import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Upload, LogOut, Menu, X, Home, Compass, Library,
  Diamond, LogIn, UserPlus, User, ChevronDown, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useFooterBanners } from '../hooks/useFooterBanners';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [q, setQ] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { banners } = useFooterBanners();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/browse?search=${encodeURIComponent(q.trim())}`);
  };

  const isActive = (p: string) => location.pathname === p;
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    let active = true;
    (async () => {
      try { const { data } = await supabase.rpc('is_admin'); if (active) setIsAdmin(!!data); }
      catch { if (active) setIsAdmin(false); }
    })();
    return () => { active = false; };
  }, [user]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/browse', label: 'Browse', icon: Compass },
    { to: '/categories', label: 'Categories', icon: Library },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Diamond className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gradient hidden sm:block">DesignVault</span>
          </Link>

          {/* Search */}
          <form onSubmit={onSearch} className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="text" placeholder="Search designs..." value={q} onChange={e => setQ(e.target.value)}
                className="input pl-10 py-1.5 text-sm bg-dark-800/60 border-dark-700/60" />
            </div>
          </form>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {navLinks.map(n => (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive(n.to) ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'}`}>
                <n.icon className="w-4 h-4" />{n.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/upload" className="btn-primary text-sm py-1.5">
                  <Upload className="w-4 h-4" />Upload
                </Link>
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-3 h-3 text-dark-500" />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 top-full pt-1 w-48 z-50" onMouseLeave={() => setDropOpen(false)}>
                      <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-card-hover py-1 overflow-hidden animate-slide-down">
                        <div className="px-4 py-2 border-b border-dark-700">
                          <p className="text-sm font-medium text-dark-100 truncate">{user.name}</p>
                          <p className="text-xs text-dark-500 truncate">{user.profession}</p>
                        </div>
                        <Link to={`/profile/${user.id}`} onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors">
                          <User className="w-4 h-4" />My Profile
                        </Link>
                        <Link to="/my-designs" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors">
                          <Library className="w-4 h-4" />My Designs
                        </Link>
                        {isAdmin && (
                          <>
                            <Link to="/admin" onClick={() => setDropOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-primary-400 hover:bg-dark-700 transition-colors">
                              <ShieldCheck className="w-4 h-4" />Admin Panel
                            </Link>
                          </>
                        )}
                        <div className="h-px bg-dark-700 my-1" />
                        <button onClick={() => { signOut(); setDropOpen(false); }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-error-400 hover:bg-dark-700 w-full text-left transition-colors">
                          <LogOut className="w-4 h-4" />Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm"><LogIn className="w-4 h-4" />Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5"><UserPlus className="w-4 h-4" />Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-lg animate-slide-down">
            <div className="px-4 py-3 space-y-2">
              <form onSubmit={e => { onSearch(e); setMenuOpen(false); }} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input type="text" placeholder="Search designs..." value={q} onChange={e => setQ(e.target.value)} className="input pl-10 py-2 text-sm" />
                </div>
              </form>
              {navLinks.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive(n.to) ? 'bg-primary-500/10 text-primary-400' : 'text-dark-300 hover:bg-dark-800'}`}>
                  <n.icon className="w-4 h-4" />{n.label}
                </Link>
              ))}
              <div className="h-px bg-dark-700" />
              {user ? (
                <>
                  <Link to="/upload" onClick={() => setMenuOpen(false)} className="btn-primary text-sm w-full justify-center py-2"><Upload className="w-4 h-4" />Upload Design</Link>
                  <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800 rounded-lg"><User className="w-4 h-4" />My Profile</Link>
                  <Link to="/my-designs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800 rounded-lg"><Library className="w-4 h-4" />My Designs</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-primary-400 hover:bg-dark-800 rounded-lg"><ShieldCheck className="w-4 h-4" />Admin Panel</Link>}
                  <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-error-400 hover:bg-dark-800 rounded-lg w-full"><LogOut className="w-4 h-4" />Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm w-full justify-center py-2"><LogIn className="w-4 h-4" />Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm w-full justify-center py-2"><UserPlus className="w-4 h-4" />Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-dark-700/50 bg-dark-900/50 mt-auto">
        {/* Admin-managed banner photos */}
        {banners.length > 0 && (
          <div className="border-b border-dark-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {banners.map(b => (
                  b.link_url ? (
                    <a key={b.id} href={b.link_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-lg overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all hover:scale-105 shrink-0">
                      <img src={b.image_url} alt={b.alt_text || ''} className="h-20 w-auto object-cover" />
                    </a>
                  ) : (
                    <div key={b.id} className="rounded-lg overflow-hidden border border-dark-700 shrink-0">
                      <img src={b.image_url} alt={b.alt_text || ''} className="h-20 w-auto object-cover" />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Diamond className="w-3 h-3 text-white" />
                </div>
                <span className="font-display font-bold text-dark-100">DesignVault</span>
              </div>
              <p className="text-sm text-dark-400 leading-relaxed">Free marketplace for designers to share professional design files. Upload once, benefit the whole community.</p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-dark-200 mb-3">Supported Formats</h3>
              <p className="text-sm text-dark-400">DWG, DXF, STL, STEP, OBJ, PDF, SVG, PNG, IGES, F3D, SKP, GCODE and more</p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-dark-200 mb-3">Platform</h3>
              <div className="space-y-1 text-sm text-dark-400">
                <p>100% Free to use</p>
                <p>Telegram Cloud Storage</p>
                <p>Community driven</p>
              </div>
            </div>
          </div>
          <div className="h-px bg-dark-800 my-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-dark-500">
            <p>DesignVault — Free Design Marketplace</p>
            <p>Made with love for designers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
