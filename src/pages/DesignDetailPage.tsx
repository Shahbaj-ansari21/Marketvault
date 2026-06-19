import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Calendar, Share2, LinkIcon, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { getDownloadUrl } from '../lib/telegram';
import { CommentSection } from '../components/CommentSection';
import { getFileTypeInfo, formatFileSize, timeAgo } from '../types';
import type { DesignWithProfile } from '../types';

const THUMB_POOL = [
  'https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
  'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
  'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
  'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
];

export function DesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [design, setDesign] = useState<DesignWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dlLoading, setDlLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data } = await supabase.from('designs').select('*, profiles(*), design_categories(*)').eq('id', id).eq('is_public', true).single();
      if (data) { setDesign(data as DesignWithProfile); supabase.rpc('increment_view_count', { design_id: id }); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDownload = async () => {
    if (!design) return;
    setDlLoading(true);
    try { const url = await getDownloadUrl(design.telegram_file_id); const a = document.createElement('a'); a.href = url; a.download = design.file_name; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); await supabase.rpc('increment_download_count', { design_id: design.id }); setDesign({ ...design, download_count: design.download_count + 1 }); } catch { window.open('https://t.me', '_blank'); } finally { setDlLoading(false); }
  };

  const handleShare = async () => {
    if (navigator.share) { await navigator.share({ title: design?.title || 'DesignVault', url: window.location.href }); }
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  if (loading) return <div className="min-h-screen py-8"><div className="max-w-4xl mx-auto px-4 sm:px-6"><div className="h-8 w-32 bg-dark-700 rounded shimmer mb-6" /><div className="aspect-video bg-dark-700 rounded-xl shimmer mb-6" /></div></div>;
  if (!design || design.approval_status === 'rejected') return <div className="min-h-screen py-8 flex items-center justify-center"><div className="card p-8 text-center max-w-md"><div className="text-5xl mb-4">❓</div><h2 className="font-display text-xl font-semibold text-dark-200 mb-2">Design Not Found</h2><button onClick={() => navigate('/browse')} className="btn-primary"><ArrowLeft className="w-4 h-4" />Browse Designs</button></div></div>;

  const fi = getFileTypeInfo(design.file_name);
  const thumb = design.thumbnail_url || THUMB_POOL[design.id.charCodeAt(0) % THUMB_POOL.length];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-6"><ArrowLeft className="w-4 h-4" />Back</button>
        <div className="card overflow-hidden mb-6">
          <div className="relative aspect-video bg-dark-900">
            <img src={thumb} alt={design.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4"><span className={`file-type-badge ${fi.bg} ${fi.color} text-sm py-1 px-2`}>{fi.label}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-dark-50 mb-3">{design.title}</h1>
              {design.description && <p className="text-dark-400 leading-relaxed">{design.description}</p>}
            </div>
            {design.tags && design.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {design.tags.map(t => <span key={t} className="tag text-sm py-1">{t}</span>)}
              </div>
            )}
            <div className="flex items-center gap-6 py-4 border-y border-dark-700/50">
              <div className="flex items-center gap-2 text-dark-400"><Eye className="w-4 h-4" /><span className="text-sm">{design.view_count} views</span></div>
              <div className="flex items-center gap-2 text-dark-400"><Download className="w-4 h-4" /><span className="text-sm">{design.download_count} downloads</span></div>
              <div className="flex items-center gap-2 text-dark-400"><Heart className="w-4 h-4" /><span className="text-sm">{design.like_count || 0} likes</span></div>
              <div className="flex items-center gap-2 text-dark-400"><Calendar className="w-4 h-4" /><span className="text-sm">{timeAgo(design.created_at)}</span></div>
            </div>
            <div className="card p-4">
              <h3 className="font-display text-sm font-semibold text-dark-300 mb-3">Designed by</h3>
              <Link to={`/profile/${design.user_id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-lg font-bold text-white">{design.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div>
                  <p className="font-medium text-dark-100 group-hover:text-primary-300 transition-colors">{design.profiles?.name || 'Unknown'}</p>
                  <p className="text-sm text-dark-500">{design.profiles?.profession || 'Designer'}</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-5 space-y-3">
              <h3 className="font-display text-sm font-semibold text-dark-300">File Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-dark-500">File</span><span className="text-dark-200 font-medium">{design.file_name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-dark-500">Type</span><span className="text-dark-200 font-medium uppercase">{design.file_type}</span></div>
                <div className="flex justify-between text-sm"><span className="text-dark-500">Size</span><span className="text-dark-200 font-medium">{formatFileSize(design.file_size)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-dark-500">Category</span><span className="text-dark-200 font-medium">{design.design_categories?.name || 'Other'}</span></div>
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <button onClick={handleDownload} disabled={dlLoading} className="btn-accent w-full justify-center py-3 font-semibold text-base">
                {dlLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Downloading...</span> : <span className="flex items-center gap-2"><Download className="w-5 h-5" />Download Free</span>}
              </button>
              <button onClick={handleShare} className="btn-secondary w-full justify-center py-3"><Share2 className="w-4 h-4" />Share Design</button>
              {user?.id === design.user_id && <button onClick={() => navigate('/my-designs')} className="btn-ghost w-full justify-center py-3 text-sm"><LinkIcon className="w-4 h-4" />My Designs</button>}
            </div>
          </div>
        </div>
        {/* Comments & Ratings */}
        <div className="mt-6">
          <CommentSection designId={design.id} />
        </div>
      </div>
    </div>
  );
}
