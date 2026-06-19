import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertCircle, CheckCircle, File, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { uploadFileToTelegram, isTelegramConfigured } from '../lib/telegram';
import { getFileTypeInfo, formatFileSize, ALLOWED_EXTENSIONS } from '../types';



export function UploadPage() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [catId, setCatId] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [drag, setDrag] = useState(false);

  const validate = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) { setError(`File type .${ext} not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`); return false; }
    if (f.size > 50 * 1024 * 1024) { setError('File must be under 50MB'); return false; }
    setError(''); return true;
  };

  const handleFile = (f: File) => {
    if (validate(f)) { setFile(f); if (!title) setTitle(f.name.split('.')[0].replace(/[_-]/g, ' ')); }
  };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Select a file'); return; }
    if (!title.trim()) { setError('Enter a title'); return; }
    if (!catId) { setError('Select a category'); return; }
    if (!session) { setError('Please sign in'); return; }
    setLoading(true);
    setError('');
    try {
      const tg = await uploadFileToTelegram(file);
      const { error: dbErr } = await supabase.from('designs').insert({
        user_id: session.user.id, title: title.trim(), description: desc.trim(),
        category_id: catId, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        telegram_file_id: tg.file_id, file_name: tg.file_name, file_size: tg.file_size,
        file_type: tg.file_type, is_public: true, approval_status: 'pending',
      });
      if (dbErr) throw new Error(dbErr.message);
      setSuccess(true);
      setTimeout(() => navigate('/my-designs'), 2500);
    } catch (err: any) { setError(err.message || 'Upload failed'); } finally { setLoading(false); }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center p-4"><div className="card p-8 text-center max-w-md"><div className="text-5xl mb-4">🔒</div><h2 className="font-display text-xl font-semibold text-dark-200 mb-2">Sign in Required</h2><button onClick={() => navigate('/login')} className="btn-primary mt-4"><ArrowRight className="w-4 h-4" /> Sign In</button></div></div>;
  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-md animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-success-400" /></div>
        <h2 className="font-display text-2xl font-bold text-dark-100 mb-2">Design Uploaded!</h2>
        <div className="flex items-center gap-2 justify-center text-sm text-warning-400 mt-3 mb-2"><Clock className="w-4 h-4" />Pending Admin Approval</div>
        <p className="text-dark-500 text-xs">Your design will be reviewed by an admin before going live. This usually takes a few hours.</p>
      </div>
    </div>
  );

  const fi = file ? getFileTypeInfo(file.name) : null;
  const configured = isTelegramConfigured();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-dark-50 mb-1">Upload Design</h1>
          <p className="text-dark-500 text-sm">Share your design with the community</p>
        </div>
        {!configured && (
          <div className="flex items-start gap-2 bg-warning-500/10 border border-warning-500/30 rounded-lg px-3 py-2 mb-6">
            <AlertCircle className="w-4 h-4 text-warning-400 shrink-0 mt-0.5" />
            <div className="text-sm text-warning-400">
              <p className="font-medium">Telegram not configured</p>
              <p className="text-xs mt-1">Add VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHANNEL_ID to your .env file.</p>
            </div>
          </div>
        )}
        <form onSubmit={submit} className="card p-6 space-y-5">
          <div onDragEnter={e => { e.preventDefault(); setDrag(true); }} onDragLeave={e => { e.preventDefault(); setDrag(false); }} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${drag ? 'border-primary-500 bg-primary-900/10' : file ? 'border-accent-500 bg-accent-900/10' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'}`}>
            {file ? (
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${fi?.bg} flex items-center justify-center`}><span className={`font-mono font-bold text-sm ${fi?.color}`}>{fi?.label}</span></div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-dark-200 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-dark-500">{formatFileSize(file.size)}</p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-500 hover:text-error-400 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center mx-auto"><Upload className="w-6 h-6 text-dark-400" /></div>
                <div><p className="text-dark-300 font-medium text-sm">Drop your file here or click to browse</p><p className="text-dark-500 text-xs mt-1">DWG, DXF, STL, STEP, OBJ, PDF, PNG, SVG, ZIP, and more</p></div>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm"><File className="w-4 h-4" />Select File</button>
              </div>
            )}
            <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} accept={ALLOWED_EXTENSIONS.map(t => `.${t}`).join(',')} />
          </div>
          <div><label className="input-label">Design Title *</label><input type="text" className="input" placeholder="Give your design a catchy title" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label className="input-label">Description</label><textarea className="input min-h-[100px] resize-none" placeholder="Describe your design, tools used, purpose..." value={desc} onChange={e => setDesc(e.target.value)} rows={4} /></div>
          <div>
            <label className="input-label">Category *</label>
            <select className="input" value={catId} onChange={e => setCatId(e.target.value)} required>
              <option value="" disabled>Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="input-label">Tags</label><input type="text" className="input" placeholder="architecture, modern, villa (comma separated)" value={tags} onChange={e => setTags(e.target.value)} /><p className="text-xs text-dark-500 mt-1">Comma separated keywords for better search</p></div>
          {error && <div className="flex items-center gap-2 bg-error-500/10 border border-error-500/30 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4 text-error-400 shrink-0" /><p className="text-sm text-error-400">{error}</p></div>}
          <button type="submit" disabled={loading || !configured} className="btn-primary w-full justify-center py-3 text-base font-semibold">
            {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading to Telegram...</span> : <span className="flex items-center gap-2"><Upload className="w-5 h-5" />Upload & Share</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
