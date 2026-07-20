import os
import pypdf
import pickle
import numpy as np
from typing import Optional, List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

PERSIST_FILE = "vector_store.pkl"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Global embeddings instance loaded once
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        # Load local lightweight sentence-transformers embeddings
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    return _embeddings

def load_vector_store() -> dict:
    if os.path.exists(PERSIST_FILE):
        try:
            with open(PERSIST_FILE, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            print(f"Error loading vector store: {e}")
    return {}

def save_vector_store(store: dict):
    try:
        with open(PERSIST_FILE, "wb") as f:
            pickle.dump(store, f)
    except Exception as e:
        print(f"Error saving vector store: {e}")

def process_pdf(filepath: str, note_id: int) -> bool:
    """
    Extracts text from PDF, splits into chunks, computes sentence-transformers
    embeddings, and stores them in a local pickle file.
    """
    if not os.path.exists(filepath):
        print(f"Error: PDF path not found: {filepath}")
        return False
        
    try:
        # 1. Read PDF
        reader = pypdf.PdfReader(filepath)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
        if not text.strip():
            print(f"Warning: Extracted text is empty for {filepath}")
            return False
            
        # 2. Split text
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
        chunks = text_splitter.split_text(text)
        
        # 3. Generate embeddings
        embeddings_model = get_embeddings()
        embeddings = embeddings_model.embed_documents(chunks)
        
        # 4. Save to persistent pickle store
        store = load_vector_store()
        store[note_id] = [
            {
                "chunk_index": idx,
                "text": chunk,
                "embedding": embedding,
                "source": os.path.basename(filepath)
            }
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        
        save_vector_store(store)
        return True
    except Exception as e:
        print(f"Error indexing PDF {filepath}: {str(e)}")
        return False

def query_pdf(question: str, note_id: Optional[int] = None) -> str:
    """
    Queries local embeddings using cosine similarity.
    If note_id is provided, filters candidate chunks.
    """
    try:
        store = load_vector_store()
        if not store:
            return "No notes indexed yet. Please upload a PDF note first."
            
        # 1. Gather candidate chunks matching filter
        all_candidates = []
        if note_id is not None:
            if note_id in store:
                all_candidates = store[note_id]
        else:
            for chunks in store.values():
                all_candidates.extend(chunks)
                
        if not all_candidates:
            return "I couldn't find any relevant sections in the uploaded materials."
            
        # 2. Compute search query embedding
        embeddings_model = get_embeddings()
        query_embedding = np.array(embeddings_model.embed_query(question))
        
        # 3. Calculate cosine similarity against all candidates
        similarities = []
        for cand in all_candidates:
            cand_emb = np.array(cand["embedding"])
            # dot product / (norm1 * norm2)
            denom = np.linalg.norm(query_embedding) * np.linalg.norm(cand_emb)
            if denom == 0:
                sim = 0.0
            else:
                sim = np.dot(query_embedding, cand_emb) / denom
            similarities.append((sim, cand))
            
        # Sort descending by similarity score
        similarities.sort(key=lambda x: x[0], reverse=True)
        top_k = similarities[:3] # Get top 3 matching chunks
        
        # Format as standard LangChain Document wrappers
        retrieved_docs = [
            Document(
                page_content=item[1]["text"],
                metadata={
                    "note_id": note_id,
                    "source": item[1]["source"],
                    "chunk_index": item[1]["chunk_index"],
                    "similarity": float(item[0])
                }
            )
            for item in top_k
        ]
        
        # Check for OpenAI Key
        openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not openai_key:
            # Fallback mock RAG response
            sources_summary = "\n".join([
                f"- **Reference {idx+1}** (from *{d.metadata.get('source', 'Note')}*, page chunk {d.metadata.get('chunk_index', '?')} - Similarity Match: {d.metadata.get('similarity', 0.0)*100:.1f}%):\n  > \"{d.page_content.strip()}\""
                for idx, d in enumerate(retrieved_docs)
            ])
            return (
                f"### [Demo Mode] AI Chat Search Result\n\n"
                f"*Note: `OPENAI_API_KEY` is not set in `.env`. The system has executed a local semantic search in a custom pure-python vector store and successfully retrieved relevant contexts from the note:*\n\n"
                f"{sources_summary}\n\n"
                f"**System Synthesized Answer:**\n"
                f"Your query *\"{question}\"* matches sections in the notes relating to this topic. To generate complete conversational answers, configure your `OPENAI_API_KEY` in the `.env` configuration file."
            )

        # RAG prompt template
        system_prompt = (
            "You are an AI learning assistant for the digital learning platform 'School-In-A-Box'. "
            "Answer the user's question using the provided context from their uploaded PDF notes. "
            "If the context doesn't contain the answer, explain what you found in the context and ask for more details. "
            "Provide a well-structured, clear response in Markdown format.\n\n"
            "Context:\n{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3, api_key=openai_key)
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        
        response = question_answer_chain.invoke({
            "input": question,
            "context": retrieved_docs
        })
        return response
    except Exception as e:
        print(f"Error querying PDF: {str(e)}")
        return f"An error occurred while processing the AI chat request: {str(e)}"


def process_video(filepath: str, note_id: int, db) -> bool:
    """
    Transcribes video or audio file using OpenAI Whisper, generates study notes using GPT-4o-mini,
    saves the markdown notes file on disk, updates database Note filename to summary,
    cleans up large media files, and generates search embeddings.
    """
    try:
        from openai import OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            print("Error: OPENAI_API_KEY environment variable is not set")
            return False

        client = OpenAI(api_key=openai_key)

        # 1. Transcribe the video/audio file using Whisper
        with open(filepath, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )

        if not transcript.text.strip():
            print("Error: Empty transcription returned from Whisper")
            return False

        # 2. Summarize transcription into high-quality Markdown study notes
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior academic assistant. Convert the following lecture/video audio transcript into a structured, comprehensive study note in Markdown format. Use headers, bullet points, key terms, definitions, and an in-depth summary. Do not omit any crucial educational details."
                },
                {"role": "user", "content": f"Transcript:\n{transcript.text}"}
            ]
        )
        summary = response.choices[0].message.content

        # 3. Save markdown summary note to uploads/
        summary_filename = f"{note_id}_summary.md"
        upload_dir = os.path.dirname(filepath)
        summary_filepath = os.path.join(upload_dir, summary_filename)

        with open(summary_filepath, "w", encoding="utf-8") as f:
            f.write(summary)

        # 4. Update the note filename in database
        import models
        db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
        if db_note:
            db_note.filename = summary_filename
            db.commit()

        # 5. Delete the original uploaded video/audio file to conserve space
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Warning: Could not remove temporary file {filepath}: {e}")

        # 6. Split and embed the summary markdown text for RAG AI Chat
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
        chunks = text_splitter.split_text(summary)

        embeddings_model = get_embeddings()
        embeddings = embeddings_model.embed_documents(chunks)

        store = load_vector_store()
        store[note_id] = [
            {
                "chunk_index": idx,
                "text": chunk,
                "embedding": embedding,
                "source": summary_filename
            }
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        save_vector_store(store)
        return True

    except Exception as e:
        print(f"Error processing video note {filepath}: {str(e)}")
        return False
