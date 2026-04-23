import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();
  const [params]      = useSearchParams();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: params.get('role') || 'donor',
    phone: '', organization: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setToast({ message: 'Passwords do not match!', type: 'error' });
    }
    if (form.password.length < 6) {
      return setToast({ message: 'Password must be at least 6 characters', type: 'error' });
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      setToast({ message: `Account created! Welcome, ${user.name} 🎉`, type: 'success' });
      setTimeout(() => {
        if (user.role === 'admin')   navigate('/admin');
        else if (user.role === 'ngo') navigate('/ngo');
        else                          navigate('/donor');
      }, 800);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    donor: { icon: '🍽️', desc: 'Donate surplus food from your restaurant, home or event.' },
    ngo:   { icon: '🏢', desc: 'Collect and distribute food to communities in need.' },
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, position: 'relative'
    }}>
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%',
        background: '#16a34a', filter: 'blur(100px)', opacity: 0.07, top: -80, right: -80, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        <div className="glass" style={{ padding: '36px 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
              background: 'linear-gradient(135deg,#16a34a,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', boxShadow: '0 8px 20px rgba(22,163,74,0.4)'
            }}>🌱</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
              Join <span className="gradient-text">Leftovers to Life</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Create your free account in seconds</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
              I am a…
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['donor', 'ngo'].map(r => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                  style={{
                    padding: '12px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid',
                    borderColor: form.role === r ? '#4ade80' : 'rgba(74,222,128,0.15)',
                    background: form.role === r ? 'rgba(74,222,128,0.12)' : 'rgba(15,23,42,0.4)',
                    color: form.role === r ? '#4ade80' : '#94a3b8',
                    fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                  }}>
                  {roleInfo[r].icon} {r.toUpperCase()}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 8, textAlign: 'center' }}>
              {roleInfo[form.role]?.desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Full Name *</label>
              <input type="text" name="name" required value={form.name}
                onChange={handleChange} className="input-field" placeholder="Ravi Kumar" id="reg-name" />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Email Address *</label>
              <input type="email" name="email" required value={form.email}
                onChange={handleChange} className="input-field" placeholder="you@example.com" id="reg-email" />
            </div>

            {/* Organization */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>
                {form.role === 'ngo' ? 'NGO Name *' : 'Organization / Restaurant Name'}
              </label>
              <input type="text" name="organization" value={form.organization}
                onChange={handleChange} className="input-field" placeholder="e.g. Hunger Free India" id="reg-org" />
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Phone Number</label>
              <input type="tel" name="phone" value={form.phone}
                onChange={handleChange} className="input-field" placeholder="+91 9876543210" id="reg-phone" />
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>City / Area</label>
              <input type="text" name="address" value={form.address}
                onChange={handleChange} className="input-field" placeholder="e.g. Connaught Place, Delhi" id="reg-address" />
            </div>

            {/* Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Password *</label>
                <input type="password" name="password" required value={form.password}
                  onChange={handleChange} className="input-field" placeholder="••••••••" id="reg-password" />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5, display: 'block' }}>Confirm *</label>
                <input type="password" name="confirmPassword" required value={form.confirmPassword}
                  onChange={handleChange} className="input-field" placeholder="••••••••" id="reg-confirm-password" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? '⏳ Creating Account…' : '🎉 Create Account'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}>
              Sign In →
            </Link>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
