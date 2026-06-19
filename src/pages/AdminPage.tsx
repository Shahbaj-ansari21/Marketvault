import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, ExternalLink, AlertCircle, Check, X, Clock, ShieldCheck, Settings, Megaphone, Inbox } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin, useApprovalQueue } from '../hooks/useAdmin';
import { useAllAds } from '../hooks/useAds';
import { getFileTypeInfo, timeAgo } from '../types';
import type { DesignWithProfile } from '../types';

type Tab = 'queue' | 'ads';

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, checking, registerAdmin } = useAdmin();
  const { pending, loading: pqLoading, approve, reject } = useApprovalQueue();
  const { ads, loading, create, update, remove } = useAllAds();
  const [tab, setTab] = useState<Tab>('queue');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-dark-200 mb-2">Sign In Required</h2>
          <p className="text-sm text-dark-500 mb-4">You need to be signed in to access the admin panel.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  // Not an admin — show ad viewer only (no ad manager)
  if (!isAdmin) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" />Back</button>
            <h1 className="font-display text-2xl font-bold text-dark-50">Dashboard</h1>
          </div>
          <div className="card p-6 mb-6 text-center">
            <Megaphone className="w-10 h-10 text-primary-400 mx-auto mb-3" />
            <h2 className="font-display text-lg font-semibold text-dark-100 mb-1">Active Advertisements</h2>
            <p className="text-sm text-dark-500">Here are the current ads on the platform.</p>
          </div>
          <div className="space-y-3">
            {ads.filter(a => a.is_active).map(ad => (
              <div key={ad.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-700 border border-dark-600 shrink-0">
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-dark-100 truncate">{ad.title}</h4>
                  <p className="text-xs text-dark-500 mt-0.5 flex items-center gap-1"><ExternalLink className="w-3 h-3" />{ad.link_url}</p>
                </div>
                <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">Visit</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === ADMIN VIEW ===
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail.trim()) return;
    const ok = await registerAdmin(registerEmail.trim().toLowerCase());
    setRegisterMsg(ok ? 'Admin added!' : 'Failed (maybe already exists)');
    if (ok) setRegisterEmail('');
    setTimeout(() => setRegisterMsg(''), 3000);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" />Back</button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-success-400" />
              <h1 className="font-display text-2xl font-bold text-dark-50">Admin Panel</h1>
            </div>
            <p className="text-dark-500 text-sm">Welcome, {user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4"><div className="text-xs text-dark-500">Pending Approval</div><div className="font-display text-2xl font-bold text-warning-400 mt-1">{pending.length}</div></div>
          <div className="card p-4"><div className="text-xs text-dark-500">Total Ads</div><div className="font-display text-2xl font-bold text-primary-400 mt-1">{ads.length}</div></div>
          <div className="card p-4"><div className="text-xs text-dark-500">Active Ads</div><div className="font-display text-2xl font-bold text-success-400 mt-1">{ads.filter(a => a.is_active).length}</div></div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-dark-800/50 p-1 rounded-lg w-fit">
          <button onClick={() => setTab('queue')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'queue' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-200'}`}>
            <Inbox className="w-4 h-4" /> Approval Queue {pending.length > 0 && <span className="bg-error-500 text-white text-xs px-1.5 rounded-full">{pending.length}</span>}
          </button>
          <button onClick={() => setTab('ads')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === 'ads' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-200'}`}>
            <Megaphone className="w-4 h-4" /> Ad Manager
          </button>
        </div>

        {/* === APPROVAL QUEUE === */}
        {tab === 'queue' && (
          <div className="space-y-3">
            {pqLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-xl shimmer" />)}</div>
            ) : pending.length === 0 ? (
              <div className="card p-8 text-center">
                <Check className="w-8 h-8 text-success-400 mx-auto mb-2" />
                <p className="text-sm text-dark-300">All caught up! No designs pending approval.</p>
              </div>
            ) : (
              pending.map(d => <ApprovalCard key={d.id} design={d} onApprove={approve} onReject={reject} />)
            )}
          </div>
        )}

        {/* === AD MANAGER === */}
        {tab === 'ads' && <AdManager ads={ads} loading={loading} create={create} update={update} remove={remove} />}

        {/* Admin Management */}
        <div className="card p-5 mt-6">
          <h3 className="font-display text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2"><Settings className="w-4 h-4" />Add Admin Email</h3>
          <p className="text-xs text-dark-500 mb-3">Once added, this email will always have admin access when signed in.</p>
          <form onSubmit={handleRegisterAdmin} className="flex gap-2">
            <input type="email" className="input" placeholder="admin@example.com" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
            <button type="submit" className="btn-primary px-4 whitespace-nowrap"><Plus className="w-4 h-4" />Add</button>
          </form>
          {registerMsg && <p className="text-xs mt-2 text-primary-400">{registerMsg}</p>}
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ design, onApprove, onReject }: { design: DesignWithProfile; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  const fi = getFileTypeInfo(design.file_name);

  const handleApprove = async () => { setBusy(true); await onApprove(design.id); setBusy(false); };
  const handleReject = async () => { setBusy(true); await onReject(design.id); setBusy(false); };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg ${fi.bg} flex items-center justify-center shrink-0`}>
          <span className={`font-mono font-bold text-xs ${fi.color}`}>{fi.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-dark-100 truncate">{design.title}</h4>
              <p className="text-xs text-dark-500 mt-0.5">by {design.profiles?.name || 'Unknown'} · {timeAgo(design.created_at)}</p>
            </div>
            <span className="badge-warning text-xs flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />Pending</span>
          </div>
          {design.description && <p className="text-xs text-dark-400 mt-2 line-clamp-2">{design.description}</p>}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={handleApprove} disabled={busy} className="btn-accent text-xs py-1.5 px-3"><Check className="w-3.5 h-3.5" /> Approve</button>
            <button onClick={handleReject} disabled={busy} className="btn-ghost text-xs py-1.5 px-3 text-error-400 hover:bg-error-500/10"><X className="w-3.5 h-3.5" /> Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdManager({ ads, loading, create, update, remove }: any) {
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', position: 'sidebar', priority: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url || !form.link_url) { setError('Fill all required fields'); return; }
    setSubmitting(true); setError('');
    const { error: err } = await create(form);
    setSubmitting(false);
    if (err) setError(err.message); else setForm({ title: '', image_url: '', link_url: '', position: 'sidebar', priority: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-display text-sm font-semibold text-dark-100 mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-400" />Create New Ad</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" className="input" placeholder="Ad Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <select className="input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
              <option value="sidebar">Sidebar</option>
              <option value="banner">Banner</option>
              <option value="inline">Inline</option>
              <option value="footer">Footer</option>
            </select>
          </div>
          <input type="url" className="input" placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} required />
          <input type="url" className="input" placeholder="Link URL" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} required />
          <input type="number" className="input" placeholder="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} min={0} />
          {error && <p className="text-sm text-error-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary justify-center w-full py-2.5">
            {submitting ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : 'Create Ad'}
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-dark-700"><h3 className="font-display text-sm font-semibold text-dark-100">All Ads ({ads.length})</h3></div>
        {loading ? <div className="p-4 space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded shimmer" />)}</div>
        : ads.length === 0 ? <div className="py-8 text-center text-dark-500 text-sm">No ads yet.</div>
        : <div className="divide-y divide-dark-700">
            {ads.map((ad: any) => (
              <div key={ad.id} className="p-3 flex items-center gap-3 hover:bg-dark-700/30">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-700 shrink-0"><img src={ad.image_url} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-100 truncate">{ad.title}</span>
                    <span className={`badge-${ad.is_active ? 'accent' : 'neutral'} text-xs`}>{ad.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-xs text-dark-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{ad.view_count}</span>
                    <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" />{ad.click_count}</span>
                  </p>
                </div>
                <button onClick={() => update(ad.id, { is_active: !ad.is_active })} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors">{ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => remove(ad.id)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-error-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
