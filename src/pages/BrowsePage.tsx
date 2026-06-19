import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, LayoutList, ArrowDownWideNarrow, X, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DesignCard } from '../components/DesignCard';
import { useCategories } from '../hooks/useCategories';
import { Link } from 'react-router-dom';
import { getDownloadUrl } from '../lib/telegram';
import { AdSlot } from '../components/AdDisplay';
import type { DesignWithProfile } from '../types';

const PROFESSIONS = ['Architect','AutoCAD Designer','Mechanical Engineer','Civil Engineer','CNC Operator / Designer','Interior Designer','Electrical Engineer','Product Designer'];

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [designs, setDesigns] = useState<DesignWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get('search') || '');
  const [cat, setCat] = useState(searchParams.get('category') || '');
  const [prof, setProf] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { categories } = useCategories();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from('designs').select('*, profiles(*), design_categories(*)').eq('is_public', true);
      if (cat) query = query.eq('category_id', cat);
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (sort === 'newest') query = query.order('created_at', { ascending: false });
      else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
      else if (sort === 'downloads') query = query.order('download_count', { ascending: false });
      else if (sort === 'views') query = query.order('view_count', { ascending: false });
      else if (sort === 'title') query = query.order('title', { ascending: true });
      const { data } = await query;
      let result = data as DesignWithProfile[] || [];
      if (prof) result = result.filter(d => d.profiles?.profession === prof);
      setDesigns(result);
      setLoading(false);
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q, cat, prof, sort]);

  const handleDownload = async (d: DesignWithProfile) => {
    try { const url = await getDownloadUrl(d.telegram_file_id); const a = document.createElement('a'); a.href = url; a.download = d.file_name; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); await supabase.rpc('increment_download_count', { design_id: d.id }); } catch { window.open('https://t.me', '_blank'); }
  };

  const clearFilters = () => { setQ(''); setCat(''); setProf(''); setSort('newest'); setSearchParams(new URLSearchParams()); };
  const hasFilters = q || cat || prof || sort !== 'newest';

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-dark-50 mb-1">Browse Designs</h1>
              <p className="text-dark-500 text-sm">Discover free designs from professionals worldwide</p>
            </div>
            <Link to="/admin" className="btn-ghost text-sm hidden sm:flex">
              <Settings className="w-4 h-4" />Ad Manager
            </Link>
          </div>
        </div>
        <div className="mb-6">
          <AdSlot position="banner" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input type="text" className="input pl-10" placeholder="Search by title, description..." value={q} onChange={e => setQ(e.target.value)} />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className={`btn-secondary shrink-0 ${filtersOpen ? 'border-primary-500/50 bg-primary-900/10' : ''}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="flex items-center bg-dark-800 rounded-lg border border-dark-700 overflow-hidden shrink-0">
            <button onClick={() => setView('grid')} className={`p-2 transition-colors ${view === 'grid' ? 'bg-primary-500/10 text-primary-400' : 'text-dark-500 hover:text-dark-300'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={`p-2 transition-colors ${view === 'list' ? 'bg-primary-500/10 text-primary-400' : 'text-dark-500 hover:text-dark-300'}`}><LayoutList className="w-4 h-4" /></button>
          </div>
        </div>

        {filtersOpen && (
          <div className="card p-4 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">Category</label>
                <select className="input" value={cat} onChange={e => setCat(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">Profession</label>
                <select className="input" value={prof} onChange={e => setProf(e.target.value)}>
                  <option value="">All Professions</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">Sort By</label>
                <div className="relative">
                  <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <select className="input pl-10" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="downloads">Most Downloads</option>
                    <option value="views">Most Views</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>
              </div>
            </div>
            {hasFilters && <button onClick={clearFilters} className="mt-3 text-sm text-error-400 hover:text-error-300 flex items-center gap-1"><X className="w-3 h-3" /> Clear all filters</button>}
          </div>
        )}

        {hasFilters && !filtersOpen && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {q && <span className="badge-primary text-xs">Search: {q}</span>}
            {cat && <span className="badge-primary text-xs">{categories.find(c => c.id === cat)?.name}</span>}
            {prof && <span className="badge-primary text-xs">{prof}</span>}
            {sort !== 'newest' && <span className="badge-neutral text-xs capitalize">{sort}</span>}
            <button onClick={clearFilters} className="text-xs text-dark-500 hover:text-error-400 ml-2">Clear</button>
          </div>
        )}

        <div className="mb-4 text-sm text-dark-500">{loading ? 'Loading...' : `${designs.length} design${designs.length !== 1 ? 's' : ''} found`}</div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden"><div className="aspect-video bg-dark-700 shimmer" /><div className="p-4 space-y-3"><div className="h-4 bg-dark-700 rounded shimmer" /><div className="h-3 bg-dark-700 rounded w-3/4 shimmer" /></div></div>
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {designs.map(d => <DesignCard key={d.id} design={d} onDownload={handleDownload} />)}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold text-dark-200 mb-2">No designs found</h3>
            <p className="text-dark-500 text-sm mb-4">Try adjusting your search or filters</p>
            {hasFilters && <button onClick={clearFilters} className="btn-primary inline-flex"><X className="w-4 h-4" />Clear Filters</button>}
          </div>
        )}
      </div>
    </div>
  );
}
