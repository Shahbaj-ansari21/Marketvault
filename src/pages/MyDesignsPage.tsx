import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Eye, Trash2, AlertCircle, Clock, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { getDownloadUrl } from '../lib/telegram';
import type { DesignWithProfile } from '../types';
import { getFileTypeInfo, formatFileSize, timeAgo } from '../types';

export function MyDesignsPage() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<DesignWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    supabase.from('designs').select('*, profiles(*), design_categories(*)').eq('user_id', session.user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setDesigns(data as DesignWithProfile[]); setLoading(false); });
  }, [session]);

  const handleDownload = async (d: DesignWithProfile) => {
    try { const url = await getDownloadUrl(d.telegram_file_id); const a = document.createElement('a'); a.href = url; a.download = d.file_name; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); } catch { window.open('https://t.me', '_blank'); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await supabase.from('designs').delete().eq('id', id);
    setDesigns(prev => prev.filter(d => d.id !== id));
    setDeleteId(null); setDeleting(false);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center p-4"><div className="card p-8 text-center max-w-md"><div className="text-5xl mb-4">🔒</div><h2 className="font-display text-xl font-semibold text-dark-200 mb-2">Sign in Required</h2><button onClick={() => navigate('/login')} className="btn-primary mt-4">Sign In</button></div></div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" />Back</button>
            <div><h1 className="font-display text-2xl font-bold text-dark-50">My Designs</h1><p className="text-dark-500 text-sm">Manage your uploaded designs</p></div>
          </div>
          <button onClick={() => navigate('/upload')} className="btn-primary text-sm"><Upload className="w-4 h-4" />Upload New</button>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-dark-700 rounded" /><div className="flex-1 space-y-2"><div className="h-4 bg-dark-700 rounded w-1/3" /><div className="h-3 bg-dark-700 rounded w-1/4" /></div></div></div>)}</div>
        ) : designs.length > 0 ? (
          <div className="space-y-3">
            {designs.map(d => {
              const fi = getFileTypeInfo(d.file_name);
              return (
                <div key={d.id} className="card p-4 flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-lg ${fi.bg} flex items-center justify-center shrink-0`}>
                    <span className={`font-mono font-bold text-sm ${fi.color}`}>{fi.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-dark-100 text-sm truncate cursor-pointer hover:text-primary-300 transition-colors" onClick={() => navigate(`/design/${d.id}`)}>{d.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-dark-500">
                      <span>{formatFileSize(d.file_size)}</span>
                      <span>{timeAgo(d.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{d.view_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`${d.is_public ? 'badge-accent' : 'badge-neutral'} text-xs`}>{d.is_public ? 'Public' : 'Private'}</span>
                    {d.approval_status === 'pending' && <span className="badge-warning text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>}
                    {d.approval_status === 'approved' && <span className="badge-success text-xs flex items-center gap-1"><Check className="w-3 h-3" />Approved</span>}
                    {d.approval_status === 'rejected' && <span className="badge-error text-xs flex items-center gap-1"><X className="w-3 h-3" />Rejected</span>}
                    <button onClick={() => handleDownload(d)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-accent-400 transition-colors" title="Download">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button onClick={() => navigate(`/design/${d.id}`)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-error-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 card">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="font-display text-lg font-semibold text-dark-200 mb-2">No designs yet</h3>
            <p className="text-dark-500 text-sm mb-4">Upload your first design to share with the community</p>
            <button onClick={() => navigate('/upload')} className="btn-primary"><Upload className="w-4 h-4" />Upload Design</button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
          <div className="card p-6 max-w-sm w-full mx-4 animate-scale-in">
            <div className="flex items-center gap-3 text-error-400 mb-4"><AlertCircle className="w-6 h-6" /><h3 className="font-display font-semibold text-lg">Delete Design?</h3></div>
            <p className="text-dark-400 text-sm mb-6">This will permanently delete your design. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="bg-error-500/20 hover:bg-error-500/30 border border-error-500/30 text-error-400 font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 flex-1 text-sm transition-all">
                {deleting ? <div className="w-3 h-3 border-2 border-error-400/30 border-t-error-400 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
