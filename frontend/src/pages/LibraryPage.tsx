import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import {
  Search,
  UploadCloud,
  Bookmark,
  Download,
  Trash2,
  FileText,
  Eye,
  X,
  FileUp,
  Video,
  FileAudio
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const LibraryPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('school_notes_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Selected note for PDF Viewer / Markdown content
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      if (selectedNote.filename.endsWith('.pdf')) {
        setNoteContent(null);
      } else {
        const fetchContent = async () => {
          setLoadingContent(true);
          try {
            const res = await api.get<{ content: string }>(`/notes/${selectedNote.id}/content`);
            setNoteContent(res.data.content);
          } catch (err) {
            setNoteContent('Failed to load note content.');
          } finally {
            setLoadingContent(false);
          }
        };
        fetchContent();
      }
    } else {
      setNoteContent(null);
    }
  }, [selectedNote]);

  const { user } = useAuth();

  const fetchNotes = async () => {
    try {
      const response = await api.get<Note[]>('/notes');
      setNotes(response.data);
    } catch (err) {
      toast.error('Failed to load library notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleToggleBookmark = (noteId: number) => {
    let updated;
    if (bookmarks.includes(noteId)) {
      updated = bookmarks.filter((id) => id !== noteId);
      toast.info('Bookmark removed');
    } else {
      updated = [...bookmarks, noteId];
      toast.success('Bookmark added');
    }
    setBookmarks(updated);
    localStorage.setItem('school_notes_bookmarks', JSON.stringify(updated));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFile) {
      toast.warn('Please provide a title and select a file');
      return;
    }
    const allowed = ['.pdf', '.mp3', '.mp4', '.wav', '.m4a', '.mpeg'];
    const hasAllowedExt = allowed.some((ext) => uploadFile.name.toLowerCase().endsWith(ext));
    if (!hasAllowedExt) {
      toast.warn(`Supported formats: ${allowed.join(', ')}`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('file', uploadFile);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Material uploaded and processed successfully!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('Delete this material permanently from Library?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      toast.success('Material deleted');
      if (selectedNote?.id === noteId) {
         setSelectedNote(null);
      }
      fetchNotes();
    } catch (err) {
      toast.error('Could not delete note. (Only Teachers/Admins can delete)');
    }
  };

  const handleDownloadNote = (noteId: number, filename: string) => {
    // Navigate or trigger download API stream
    window.open(`/api/notes/${noteId}/download`, '_blank');
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left pb-20 relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-apple-text-primary-light dark:text-apple-text-primary-dark">
            Library Materials
          </h2>
          <p className="text-sm text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
            Access study PDFs, bookmark relevant segments, and open files in our RAG AI chat.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="glass-btn-primary py-2.5 text-sm"
        >
          <UploadCloud size={16} /> Upload Study Material
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title..."
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
          />
        </div>
      </div>

      {/* Main Grid: Materials Index + PDF Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notes Grid */}
        <div className={`space-y-4 ${selectedNote ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((n) => {
                const isBookmarked = bookmarks.includes(n.id);
                return (
                  <GlassCard
                    key={n.id}
                    className={`flex flex-col justify-between gap-4 border transition-all ${
                      selectedNote?.id === n.id ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-400/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                          {n.filename.endsWith('.pdf') ? <FileText size={20} /> : <Video size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-snug line-clamp-1">
                            {n.title}
                          </h4>
                          <p className="text-[10px] text-apple-text-secondary-light dark:text-apple-text-secondary-dark line-clamp-1">
                            {n.filename.split('_').slice(2).join('_') || n.filename}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(n.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isBookmarked
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                            : 'border-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs text-apple-text-secondary-light dark:text-apple-text-secondary-dark border-t border-apple-border-light dark:border-apple-border-dark pt-3">
                      <span>{new Date(n.upload_date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedNote(n)}
                          className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-500 hover:text-indigo-600 transition-colors"
                          title="View PDF"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownloadNote(n.id, n.filename)}
                          className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-500 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        {(user?.role === 'Teacher' || user?.role === 'Admin') && (
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-apple-text-secondary-light dark:text-apple-text-secondary-dark">
              No notes found in library.
            </div>
          )}
        </div>

        {/* PDF / Markdown Viewer Panel */}
        {selectedNote && (
          <GlassCard className="lg:col-span-6 space-y-4 h-[75vh] flex flex-col justify-between border-indigo-500/30">
            <div className="flex justify-between items-center border-b border-apple-border-light dark:border-apple-border-dark pb-2">
              <div className="flex items-center gap-2">
                {selectedNote.filename.endsWith('.pdf') ? <FileText size={18} className="text-indigo-500" /> : <Video size={18} className="text-indigo-500" />}
                <h3 className="font-bold text-sm truncate max-w-[200px] sm:max-w-xs">{selectedNote.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-500 text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 w-full bg-black/5 dark:bg-black/20 rounded-xl overflow-hidden relative">
              {selectedNote.filename.endsWith('.pdf') ? (
                <iframe
                  src={`/uploads/${selectedNote.filename}`}
                  title={selectedNote.title}
                  className="w-full h-full border-none"
                />
              ) : loadingContent ? (
                <div className="flex flex-col items-center justify-center h-full text-apple-text-secondary-light dark:text-apple-text-secondary-dark text-xs gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  Transcribing lecture audio & compiling notes...
                </div>
              ) : (
                <div className="w-full h-full p-6 overflow-y-auto text-left prose prose-indigo dark:prose-invert max-w-none text-apple-text-primary-light dark:text-apple-text-primary-dark">
                  <ReactMarkdown>{noteContent || ''}</ReactMarkdown>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Upload Dialog Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-apple-bg-light dark:bg-apple-bg-dark rounded-2xl max-w-md w-full border border-apple-border-light dark:border-apple-border-dark shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Upload PDF Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-apple-text-secondary-light dark:text-apple-text-secondary-dark hover:text-red-500 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Note Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: Introduction to Data Structures"
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold block">Select Document, Audio, or Video Lecture</label>
                <div className="border-2 border-dashed border-apple-border-light dark:border-apple-border-dark hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all relative">
                  <input
                    type="file"
                    accept="application/pdf,audio/*,video/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) setUploadFile(files[0]);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <FileUp className="text-gray-400" size={32} />
                  <span className="text-xs font-medium text-apple-text-secondary-light dark:text-apple-text-secondary-dark text-center">
                    {uploadFile ? uploadFile.name : 'Click or Drag to upload PDF, Audio, or Video'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full glass-btn-primary py-2.5 rounded-xl font-bold mt-2"
              >
                {uploading ? 'Parsing & Indexing PDF...' : 'Upload & AI Index'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
