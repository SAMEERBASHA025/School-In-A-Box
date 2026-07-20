import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Note, ChatMessage } from '../types';
import { GlassCard } from '../components/GlassCard';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import {
  MessageSquare,
  Send,
  FileText,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  Library,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

export const AIChatPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Voice Chat States
  const [isRecording, setIsRecording] = useState(false);
  const [speakResponse, setSpeakResponse] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stop speaking when user navigates away
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load chat history & notes list
  const loadChatData = async () => {
    try {
      const notesRes = await api.get<Note[]>('/notes');
      setNotes(notesRes.data);
      
      const historyRes = await api.get<ChatMessage[]>('/chat/history');
      setMessages(historyRes.data);
    } catch (err) {
      toast.error('Failed to load chat utilities');
    } finally {
      setSidebarLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const triggerTTS = (text: string) => {
    if (speakResponse && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown formatting for cleaner speech synthesis
      const cleanText = text.replace(/[*#`_\-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuestion || question.trim();
    if (!queryText) return;

    setQuestion('');
    
    // Add user message locally first
    const tempUserMsg: ChatMessage = {
      question: queryText,
      answer: '',
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setChatLoading(true);

    try {
      const response = await api.post<ChatMessage>('/chat', {
        question: queryText,
        note_id: selectedNoteId
      });

      // Update last message with answer
      setMessages((prev) => {
         const updated = [...prev];
         updated[updated.length - 1] = response.data;
         return updated;
      });

      // Speak back response
      triggerTTS(response.data.answer);
    } catch (err: any) {
      toast.error('Could not get answer from AI');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Voice recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'voice_input.wav', { type: 'audio/wav' });
        
        const formData = new FormData();
        formData.append('file', audioFile);

        setChatLoading(true);
        toast.info('Transcribing voice input...');

        try {
          const res = await api.post<{ text: string }>('/chat/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const transcribedText = res.data.text;
          if (transcribedText.trim() && !transcribedText.startsWith('Transcription error:')) {
            toast.success(`Voice Recognized: "${transcribedText}"`);
            handleSendMessage(undefined, transcribedText);
          } else {
            toast.warn('Could not understand your voice query.');
            setChatLoading(false);
          }
        } catch (err) {
          toast.error('Transcription failed');
          setChatLoading(false);
        }

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Listening... Speak now.');
    } catch (err) {
      toast.error('Microphone access denied or failed.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSelectSuggestion = (suggestedText: string) => {
     setQuestion(suggestedText);
  };

  // Find currently selected note name
  const currentNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 text-left pb-4">
      {/* Left Sidebar: Select Notes Context */}
      <GlassCard className="w-full md:w-64 flex flex-col p-4 shrink-0 h-48 md:h-full justify-between">
        <div className="space-y-4 overflow-hidden flex flex-col h-full">
          <div className="flex items-center gap-2 border-b border-apple-border-light dark:border-apple-border-dark pb-2">
            <Library size={18} className="text-indigo-500" />
            <span className="font-bold text-sm">Select Document Context</span>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 pr-1">
            <button
              onClick={() => setSelectedNoteId(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                selectedNoteId === null
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} />
              <span>All Indexed Notes</span>
            </button>

            {sidebarLoading ? (
              <div className="space-y-2 pt-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
              </div>
            ) : notes.length > 0 ? (
              notes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all truncate ${
                    selectedNoteId === n.id
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                  title={n.title}
                >
                  <FileText size={14} className="shrink-0 text-gray-400" />
                  <span className="truncate">{n.title}</span>
                </button>
              ))
            ) : (
              <div className="text-[10px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark text-center py-6">
                No documents found.
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Right Pane: AI Chat Core */}
      <GlassCard className="flex-1 flex flex-col p-6 h-[50vh] md:h-full justify-between border-indigo-500/10">
        {/* Chat Title bar */}
        <div className="flex items-center justify-between border-b border-apple-border-light dark:border-apple-border-dark pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">AI Learning Tutor</h3>
              <p className="text-[10px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
                Active Context: {currentNote ? `Material: "${currentNote.title}"` : 'All School Notes'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Conversation Viewport */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="space-y-3">
                {/* User message block */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="max-w-[80%] bg-indigo-500 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-sm text-left shadow-md">
                    {msg.question}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shrink-0">
                    <UserIcon size={14} />
                  </div>
                </div>

                {/* AI response block */}
                {(msg.answer || chatLoading) && (
                  <div className="flex items-start gap-2.5 justify-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="max-w-[80%] bg-white/50 dark:bg-black/35 border border-apple-border-light dark:border-apple-border-dark rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-left shadow-sm">
                      {msg.answer ? (
                        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-2">
                          <ReactMarkdown>{msg.answer}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 py-1">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col justify-center items-center gap-3 text-center py-12">
              <Bot size={38} className="text-gray-400 animate-bounce" />
              <div>
                <h4 className="font-bold text-sm">Ask your first question</h4>
                <p className="text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark max-w-xs mt-1">
                  Upload study files in the Library, select the PDF on the left panel, and ask questions!
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full pt-4">
                <button
                  onClick={() => handleSelectSuggestion('Summarize the main concepts in this note')}
                  className="p-2.5 text-left text-xs bg-white/40 dark:bg-black/20 border border-apple-border-light dark:border-apple-border-dark rounded-xl hover:border-indigo-500/30 flex items-start gap-1.5"
                >
                  <HelpCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span>Summarize the main concepts in this note.</span>
                </button>
                <button
                  onClick={() => handleSelectSuggestion('List 3 key sample questions from the material')}
                  className="p-2.5 text-left text-xs bg-white/40 dark:bg-black/20 border border-apple-border-light dark:border-apple-border-dark rounded-xl hover:border-indigo-500/30 flex items-start gap-1.5"
                >
                  <HelpCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span>List 3 key sample questions from the material.</span>
                </button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Box */}
        <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 items-center">
          {/* Mute/Unmute speech reader button */}
          <button
            type="button"
            onClick={() => {
              setSpeakResponse(!speakResponse);
              if (speakResponse && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              toast.info(speakResponse ? 'AI voice output muted.' : 'AI voice output enabled.');
            }}
            className={`p-3 rounded-xl border transition-colors ${
              speakResponse 
                ? 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20' 
                : 'bg-white/40 dark:bg-white/5 border-apple-border-light dark:border-apple-border-dark text-gray-400 hover:bg-white/60'
            }`}
            title={speakResponse ? 'Mute AI Voice response' : 'Enable AI Voice response'}
          >
            {speakResponse ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Voice Microphone recording button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={chatLoading}
            className={`p-3 rounded-xl border transition-all ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse border-red-600 hover:bg-red-600' 
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/20 disabled:bg-gray-200'
            }`}
            title={isRecording ? 'Click to stop listening' : 'Start speaking question'}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              isRecording 
                ? 'Listening... click microphone to finish speaking.' 
                : chatLoading 
                  ? 'Tutor is typing...' 
                  : 'Ask question about notes...'
            }
            disabled={chatLoading || isRecording}
            className="flex-1 glass-input rounded-xl text-sm py-3 px-4 focus:ring-purple-500/50"
          />
          
          <button
            type="submit"
            disabled={chatLoading || isRecording}
            className="glass-btn-primary p-3 shrink-0 rounded-xl"
          >
            <Send size={18} />
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default AIChatPage;
