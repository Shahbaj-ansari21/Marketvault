import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, UserMinus, Upload, Grid3X3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { DesignCard } from '../components/DesignCard';
import { getDownloadUrl } from '../lib/telegram';
import type { Profile, DesignWithProfile } from '../types';
import { timeAgo } from '../types';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [designs, setDesigns] = useState<DesignWithProfile[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fLoading, setFLoading] = useState(false);
  const isOwn = user?.id === id;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [pRes, dRes, follRes, folwRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('designs').select('*, profiles(*), design_categories(*)').eq('user_id', id).eq('is_public', true).order('created_at', { ascending: false }),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', id),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', id),
      ]);
      if (pRes.data) setProfile(pRes.data);
      if (dRes.data) setDesigns(dRes.data as DesignWithProfile[]);
      if (follRes.count !== null) setFollowers(follRes.count);
      if (folwRes.count !== null) setFollowing(folwRes.count);
      if (user?.id) {
        const { data } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle();
        setIsFollowing(!!data);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleFollow = async () => {
    if (!user) { navigate('/login'); return; }
    setFLoading(true);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id!);
      setIsFollowing(false); setFollowers(p => p - 1);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: id! });
      setIsFollowing(true); setFollowers(p => p + 1);
    }
    setFLoading(false);
  };

  const handleDownload = async (d: DesignWithProfile) => {
    try { const url = await getDownloadUrl(d.telegram_file_id); const a = document.createElement('a'); a.href = url; a.download = d.file_name; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); await supabase.rpc('increment_download_count', { design_id: d.id }); } catch { window.open('https://t.me', '_blank'); }
  };

  if (loading) return <div className="min-h-screen py-8"><div className="max-w-4xl mx-auto px-4 sm:px-6"><div className="card p-8 mb-8 animate-pulse"><div className="flex gap-6"><div className="w-24 h-24 bg-dark-700 rounded-full" /><div className="flex-1 space-y-4"><div className="h-7 bg-dark-700 rounded w-1/3" /><div className="h-4 bg-dark-700 rounded w-1/2" /></div></div></div></div></div>;
  if (!profile) return <div className="min-h-screen py-8 flex items-center justify-center"><div className="card p-8 text-center max-w-md"><div className="text-5xl mb-4">👤</div><h2 className="font-display text-xl font-semibold text-dark-200 mb-2">Profile Not Found</h2><button onClick={() => navigate(-1)} className="btn-primary"><ArrowLeft className="w-4 h-4" />Go Back</button></div></div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-6"><ArrowLeft className="w-4 h-4" />Back</button>
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white shrink-0 mx-auto sm:mx-0">
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 justify-between mb-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-dark-50">{profile.name}</h1>
                  <span className="badge-primary mt-1">{profile.profession}</span>
                </div>
                {!isOwn && (
                  <button onClick={handleFollow} disabled={fLoading} className={isFollowing ? 'btn-secondary' : 'btn-primary'}>
                    {isFollowing ? <><UserMinus className="w-4 h-4" />Unfollow</> : <><UserPlus className="w-4 h-4" />Follow</>}
                  </button>
                )}
                {isOwn && <button onClick={() => navigate('/upload')} className="btn-primary"><Upload className="w-4 h-4" />Upload Design</button>}
              </div>
              {profile.bio && <p className="text-dark-400 text-sm mb-3">{profile.bio}</p>}
              <p className="text-xs text-dark-600">Member since {timeAgo(profile.created_at)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-700/50">
            {[{ label: 'Designs', value: designs.length, icon: Grid3X3 }, { label: 'Followers', value: followers, icon: Users }, { label: 'Following', value: following, icon: UserPlus }].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-4 h-4 text-dark-500 mx-auto mb-1" />
                <div className="font-display text-xl font-bold text-dark-100">{value}</div>
                <div className="text-xs text-dark-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="section-title mb-6">{isOwn ? 'My Designs' : `${profile.name}'s Designs`}</h2>
          {designs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {designs.map(d => <DesignCard key={d.id} design={d} onDownload={handleDownload} />)}
            </div>
          ) : (
            <div className="text-center py-16 card">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="font-display text-lg font-semibold text-dark-200 mb-2">No designs yet</h3>
              <p className="text-dark-500 text-sm">{isOwn ? 'Upload your first design!' : 'Nothing uploaded yet.'}</p>
              {isOwn && <button onClick={() => navigate('/upload')} className="btn-primary mt-4"><Upload className="w-4 h-4" />Upload Now</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
