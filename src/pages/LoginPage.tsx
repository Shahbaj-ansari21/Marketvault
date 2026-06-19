import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Diamond, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(form.email, form.password);
    setLoading(false);
    if (err) setError(err.message);
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Diamond className="w-7 h-7 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gradient">DesignVault</span>
          </Link>
          <p className="text-dark-400 mt-2 text-sm">Sign in to your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="email" className="input pl-10" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type={show ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="flex items-center gap-2 bg-error-500/10 border border-error-500/30 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4 text-error-400 shrink-0" /><p className="text-sm text-error-400">{error}</p></div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base font-semibold">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : <span className="flex items-center gap-2">Sign In<ArrowRight className="w-4 h-4" /></span>}
            </button>
          </form>
          <p className="text-center text-sm text-dark-400 mt-6">Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
