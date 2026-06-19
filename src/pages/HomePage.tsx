import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Upload, Users, Star, Zap, Shield, Globe, TrendingUp, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DesignCard } from '../components/DesignCard';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { getDownloadUrl } from '../lib/telegram';
import type { DesignWithProfile } from '../types';
import { formatNumber } from '../types';

const CAT_EMOJIS: Record<string, string> = {
  architecture: '🏛️', autocad: '📐', mechanical: '⚙️', 'cnc-design': '🔩',
  '3d-printing': '🖨️', 'interior-design': '🛋️', electrical: '⚡', 'civil-engineering': '🌉',
  industrial: '🏭', construction: '🏗️', furniture: '🪑', jewelry: '💎',
  'product-design': '📦', other: '📁',
};

export function HomePage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [latest, setLatest] = useState<DesignWithProfile[]>([]);
  const [trending, setTrending] = useState<DesignWithProfile[]>([]);
  const [stats, setStats] = useState({ designs: 0, users: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [latestRes, trendingRes, usersRes] = await Promise.all([
        supabase.from('designs').select('*, profiles(*), design_categories(*)').eq('is_public', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('designs').select('*, profiles(*), design_categories(*)').eq('is_public', true).order('download_count', { ascending: false }).limit(4),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      if (latestRes.data) setLatest(latestRes.data as DesignWithProfile[]);
      if (trendingRes.data) setTrending(trendingRes.data as DesignWithProfile[]);
      const dl = (latestRes.data || []).reduce((s: number, d: any) => s + (d.download_count || 0), 0);
      setStats({ designs: latestRes.data?.length || 0, users: usersRes.count || 0, downloads: dl });
      setLoading(false);
    };
    load();
  }, []);

  const handleDownload = async (d: DesignWithProfile) => {
    try { const url = await getDownloadUrl(d.telegram_file_id); const a = document.createElement('a'); a.href = url; a.download = d.file_name; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); await supabase.rpc('increment_download_count', { design_id: d.id }); } catch { window.open('https://t.me', '_blank'); }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />Free design marketplace for professionals
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Share Your <span className="text-gradient">Designs</span><br />With The World
          </h1>
          <p className="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Upload your CAD, architectural, mechanical, and CNC designs once. Let anyone download and use them — completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            {user ? (
              <Link to="/upload" className="btn-primary px-8 py-3 text-base font-semibold"><Upload className="w-5 h-5" />Upload a Design<ArrowRight className="w-4 h-4" /></Link>
            ) : (
              <Link to="/register" className="btn-primary px-8 py-3 text-base font-semibold">Start Sharing Free<ArrowRight className="w-4 h-4" /></Link>
            )}
            <Link to="/browse" className="btn-secondary px-8 py-3 text-base font-semibold"><Search className="w-5 h-5" />Browse Designs</Link>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[{ label: 'Designs', value: stats.designs, icon: Star }, { label: 'Designers', value: stats.users, icon: Users }, { label: 'Downloads', value: stats.downloads, icon: Download }].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <Icon className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                <div className="font-display text-2xl font-bold text-dark-100">{formatNumber(value)}</div>
                <div className="text-xs text-dark-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="section-title">Browse by Category</h2><p className="text-dark-500 text-sm">Find designs for every profession</p></div>
            <Link to="/categories" className="btn-ghost text-sm">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/browse?category=${cat.id}`} className="card p-3 text-center hover:border-primary-500/50 hover:bg-primary-900/10 transition-all group">
                <div className="text-2xl mb-2">{CAT_EMOJIS[cat.slug] || '📁'}</div>
                <div className="text-xs font-medium text-dark-300 group-hover:text-primary-300 transition-colors leading-tight">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-16 border-t border-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-5 h-5 text-accent-400" /><h2 className="section-title mb-0">Trending Designs</h2></div>
              <Link to="/browse?sort=downloads" className="btn-ghost text-sm">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trending.map(d => <DesignCard key={d.id} design={d} onDownload={handleDownload} />)}
            </div>
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="py-16 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="section-title">Latest Uploads</h2><p className="text-dark-500 text-sm">Fresh designs from the community</p></div>
            <Link to="/browse" className="btn-ghost text-sm">View all</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden"><div className="aspect-video bg-dark-700 shimmer" /><div className="p-4 space-y-3"><div className="h-4 bg-dark-700 rounded shimmer" /><div className="h-3 bg-dark-700 rounded w-3/4 shimmer" /></div></div>
              ))}
            </div>
          ) : latest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latest.map(d => <DesignCard key={d.id} design={d} onDownload={handleDownload} />)}
            </div>
          ) : (
            <div className="text-center py-20 card">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="font-display text-xl font-semibold text-dark-200 mb-2">No designs yet</h3>
              <p className="text-dark-500 text-sm mb-6">Be the first to share your design!</p>
              {user ? <Link to="/upload" className="btn-primary inline-flex"><Upload className="w-4 h-4" />Upload Now</Link> : <Link to="/register" className="btn-primary inline-flex">Get Started Free</Link>}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-dark-800 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title text-3xl">Why DesignVault?</h2>
            <p className="text-dark-400 mt-2">Built for professionals, free for everyone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ icon: Globe, title: '100% Free Forever', desc: 'No subscriptions, no hidden fees. Upload and download any design file completely free.', color: 'text-primary-400', bg: 'bg-primary-500/10' }, { icon: Shield, title: 'All File Formats', desc: 'DWG, DXF, STL, STEP, OBJ, PDF, SVG, and more. Every professional format supported.', color: 'text-accent-400', bg: 'bg-accent-500/10' }, { icon: Users, title: 'Community Driven', desc: 'Follow designers, discover profiles, filter by profession and category.', color: 'text-warning-400', bg: 'bg-warning-500/10' }].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6 hover:border-dark-600 transition-all">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}><Icon className={`w-6 h-6 ${color}`} /></div>
                <h3 className="font-display text-lg font-semibold text-dark-100 mb-2">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 border-t border-dark-800">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-display text-4xl font-bold text-dark-50 mb-4">Ready to share your work?</h2>
            <p className="text-dark-400 mb-8">Join designers worldwide who use DesignVault to share and discover free professional designs.</p>
            <Link to="/register" className="btn-primary px-10 py-3 text-base font-semibold">Create Free Account<ArrowRight className="w-5 h-5" /></Link>
          </div>
        </section>
      )}
    </div>
  );
}
