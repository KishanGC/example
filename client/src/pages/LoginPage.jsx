import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setToast({ message: `Welcome back, ${user.name}! 🎉`, type: 'success' });
      setTimeout(() => {
        if (user.role === 'admin')   navigate('/admin');
        else if (user.role === 'ngo') navigate('/ngo');
        else                          navigate('/donor');
      }, 800);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* Demo quick-login buttons */
  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin')   navigate('/admin');
      else if (user.role === 'ngo') navigate('/ngo');
      else                          navigate('/donor');
    } catch {
      setToast({ message: 'Demo account unavailable — please run seed.js first', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, position: 'relative'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%',
        background: '#16a34a', filter: 'blur(100px)', opacity: 0.07, top: 0, left: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%',
        background: '#0d9488', filter: 'blur(100px)', opacity: 0.07, bottom: 0, right: 0, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div className="glass" style={{ padding: '40px 36px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(22,163,74,0.4)'
            }}>🌱</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sign in to your Leftovers to Life account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                📧 Email Address
              </label>
              <input
                type="email" name="email" required
                value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com"
                id="login-email"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                🔒 Password
              </label>
              <input
                type="password" name="password" required
                value={form.password} onChange={handleChange}
                className="input-field" placeholder="••••••••"
                id="login-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? '⏳ Signing in…' : '🚀 Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick Demo Login
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: '🍽️ Donor', email: 'donor@demo.com', password: 'demo1234' },
                { label: '🏢 NGO',   email: 'ngo@demo.com',   password: 'demo1234' },
                { label: '🛡️ Admin', email: 'admin@demo.com', password: 'demo1234' },
              ].map(d => (
                <button key={d.label} onClick={() => demoLogin(d.email, d.password)}
                  disabled={loading}
                  style={{
                    padding: '8px 4px', borderRadius: 8, fontSize: '0.75rem',
                    fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(74,222,128,0.2)',
                    background: 'rgba(74,222,128,0.05)', color: '#94a3b8', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.12)'; e.currentTarget.style.color = '#4ade80'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                >{d.label}</button>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
