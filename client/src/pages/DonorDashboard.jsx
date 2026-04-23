import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DonationCard from '../components/DonationCard';
import { StatCard } from '../components/StatCard';
import Toast from '../components/Toast';

const FOOD_TYPES = ['cooked', 'packaged', 'raw', 'organic_waste', 'mixed'];

const emptyForm = {
  foodType: 'cooked', quantity: '', description: '', address: '',
  expiresAt: '', isOrganic: false,
  location: { lat: 28.6139, lng: 77.209 },
};

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const [tab, setTab]               = useState('all'); // all | active | completed

  const fetchDonations = async () => {
    try {
      const { data } = await api.get('/api/donations/my');
      setDonations(data);
    } catch (err) {
      setToast({ message: 'Failed to fetch donations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      /* Try to get geolocation */
      if (navigator.geolocation) {
        await new Promise((res) =>
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              form.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              res();
            },
            res, { timeout: 3000 }
          )
        );
      }
      await api.post('/api/donations', form);
      setToast({ message: '🎉 Donation posted successfully!', type: 'success' });
      setShowModal(false);
      setForm(emptyForm);
      fetchDonations();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to post donation', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /* Stats */
  const total    = donations.length;
  const active   = donations.filter(d => d.status === 'available').length;
  const accepted = donations.filter(d => d.status === 'accepted').length;
  const completed = donations.filter(d => d.status === 'completed').length;

  /* Filter */
  const filtered = tab === 'all' ? donations
    : tab === 'active'    ? donations.filter(d => ['available','accepted'].includes(d.status))
    : donations.filter(d => d.status === 'completed');

  /* Min datetime for expiry picker = now + 30 min */
  const minDate = new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16);

  return (
    <div style={{ minHeight: '100vh', padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
            👋 Hello, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {user?.organization && `${user.organization} • `}Donor Dashboard
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" id="add-donation-btn">
          ➕ Post Donation
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="📦" label="Total Donations" value={total}     color="#4ade80" />
        <StatCard icon="🟢" label="Active"           value={active}    color="#60a5fa" />
        <StatCard icon="🚗" label="Picked Up"        value={accepted}  color="#f59e0b" />
        <StatCard icon="✅" label="Completed"        value={completed} color="#34d399" />
      </div>

      {/* Impact banner */}
      {completed > 0 && (
        <div style={{
          padding: '16px 24px', borderRadius: 14, marginBottom: 24,
          background: 'linear-gradient(135deg,rgba(22,163,74,0.15),rgba(13,148,136,0.15))',
          border: '1px solid rgba(74,222,128,0.2)',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🌍</span>
          <div>
            <p style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.9rem' }}>Your Impact So Far</p>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              ~{completed * 5} kg food saved · ~{completed * 2} kg CO₂ reduced · ~{completed * 10} meals provided
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all','All'], ['active','Active'], ['completed','Completed']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '8px 18px', borderRadius: 8, border: '1.5px solid',
            borderColor: tab === v ? '#4ade80' : 'rgba(74,222,128,0.15)',
            background: tab === v ? 'rgba(74,222,128,0.12)' : 'transparent',
            color: tab === v ? '#4ade80' : '#64748b',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>{l}</button>
        ))}
      </div>

      {/* Donation list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>⏳ Loading donations…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: '3rem', marginBottom: 12 }}>🍱</p>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>No donations yet. Post your first one!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ marginTop: 20 }}>
            ➕ Post Donation
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(d => (
            <DonationCard key={d._id} donation={d} role="donor" />
          ))}
        </div>
      )}

      {/* ── Add Donation Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>🍱 Post New Donation</h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', color: '#64748b',
                fontSize: '1.3rem', cursor: 'pointer'
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Food type */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Food Type *</label>
                <select name="foodType" value={form.foodType}
                  onChange={e => setForm({ ...form, foodType: e.target.value })}
                  className="input-field" id="donation-food-type">
                  {FOOD_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Quantity *</label>
                <input type="text" value={form.quantity} required
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="input-field" placeholder="e.g. 10 kg, 50 portions, 5 boxes"
                  id="donation-quantity" />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Description</label>
                <textarea value={form.description} rows={2}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field" placeholder="e.g. Dal, rice, sabzi — freshly cooked this morning"
                  id="donation-description" style={{ resize: 'vertical' }} />
              </div>

              {/* Address */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Pickup Address *</label>
                <input type="text" value={form.address} required
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="input-field" placeholder="Full pickup address"
                  id="donation-address" />
              </div>

              {/* Expiry */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Expiry Date & Time *</label>
                <input type="datetime-local" value={form.expiresAt} min={minDate} required
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className="input-field" id="donation-expiry" />
              </div>

              {/* Organic toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 10,
                background: form.isOrganic ? 'rgba(132,204,22,0.1)' : 'rgba(15,23,42,0.4)',
                border: `1.5px solid ${form.isOrganic ? 'rgba(132,204,22,0.4)' : 'rgba(74,222,128,0.1)'}`,
                transition: 'all 0.2s'
              }}>
                <input type="checkbox" checked={form.isOrganic}
                  onChange={e => setForm({ ...form, isOrganic: e.target.checked })}
                  style={{ width: 16, height: 16 }} id="donation-organic" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: form.isOrganic ? '#a3e635' : '#94a3b8' }}>
                  ♻️ This is organic waste (route to agricultural trusts)
                </span>
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, justifyContent: 'center' }}>
                  {submitting ? '⏳ Posting…' : '🚀 Post Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
