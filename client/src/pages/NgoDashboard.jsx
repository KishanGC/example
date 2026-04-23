import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DonationCard from '../components/DonationCard';
import { StatCard } from '../components/StatCard';
import Toast from '../components/Toast';

/* Haversine distance in km */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NgoDashboard() {
  const { user }  = useAuth();
  const [donations, setDonations] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [tab, setTab]            = useState('available'); // available | my
  const [radius, setRadius]      = useState(20); // km
  const [ngoLoc, setNgoLoc]      = useState({ lat: 28.6139, lng: 77.209 });
  const [toast, setToast]        = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    /* Try to get NGO geolocation */
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNgoLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoLoading(false);
        },
        () => setGeoLoading(false),
        { timeout: 5000 }
      );
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/api/donations?status=available'),
        api.get('/api/donations'),
      ]);
      setDonations(allRes.data);
      // Only keep donations where THIS NGO accepted/completed them
      setMyPickups(
        myRes.data.filter(d =>
          d.acceptedBy?._id === user?._id ||
          d.acceptedBy === user?._id
        )
      );
    } catch {
      setToast({ message: 'Failed to load donations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* Filter by radius */
  const nearby = donations.filter(d => {
    const dLat = d.location?.lat ?? 28.6139;
    const dLng = d.location?.lng ?? 77.209;
    return haversine(ngoLoc.lat, ngoLoc.lng, dLat, dLng) <= radius;
  });

  /* AI score = closer + fresher = higher priority */
  const scored = [...nearby].map(d => {
    const dist  = haversine(ngoLoc.lat, ngoLoc.lng, d.location?.lat ?? 28.6139, d.location?.lng ?? 77.209);
    const fresh = Math.max(0, new Date(d.expiresAt) - Date.now()) / 3600000; // hours remaining
    const score = (1 / (dist + 0.1)) * Math.log(fresh + 1);
    return { ...d, _dist: dist.toFixed(1), _score: score };
  }).sort((a, b) => b._score - a._score);

  /* My accepted/completed pickups */
  const accepted  = myPickups.filter(d => d.status === 'accepted');
  const completed = myPickups.filter(d => d.status === 'completed');

  const handleAccept = async (id) => {
    try {
      await api.put(`/api/donations/${id}/accept`);
      setToast({ message: '✅ Donation accepted! Get the route below.', type: 'success' });
      fetchAll();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to accept', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/api/donations/${id}/reject`);
      setToast({ message: 'Donation rejected.', type: 'info' });
      fetchAll();
    } catch {
      setToast({ message: 'Failed to reject', type: 'error' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/api/donations/${id}/complete`);
      setToast({ message: '🎉 Pickup completed! Great work!', type: 'success' });
      fetchAll();
    } catch {
      setToast({ message: 'Failed to complete', type: 'error' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
          🏢 <span className="gradient-text">{user?.organization || user?.name}</span> Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>NGO Portal</span>
          {geoLoading && <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>📍 Detecting location…</span>}
          {!geoLoading && (
            <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
              📍 {ngoLoc.lat.toFixed(4)}, {ngoLoc.lng.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="📍" label="Nearby Available" value={nearby.length}    color="#4ade80"  />
        <StatCard icon="🚗" label="Active Pickups"   value={accepted.length}  color="#60a5fa"  />
        <StatCard icon="✅" label="Completed"        value={completed.length} color="#34d399"  />
        <StatCard icon="🎯" label="Radius (km)"      value={`${radius} km`}   color="#f59e0b"  />
      </div>

      {/* Radius slider */}
      <div className="glass" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
          🔍 Search Radius:
        </span>
        <input type="range" min={1} max={50} value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          style={{ flex: 1, minWidth: 100, accentColor: '#4ade80' }} />
        <span style={{ fontWeight: 700, color: '#4ade80', minWidth: 50 }}>{radius} km</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {nearby.length} donations found
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['available','🟢 Available Nearby'], ['my','🚗 My Pickups']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '9px 20px', borderRadius: 8, border: '1.5px solid',
            borderColor: tab === v ? '#4ade80' : 'rgba(74,222,128,0.15)',
            background: tab === v ? 'rgba(74,222,128,0.12)' : 'transparent',
            color: tab === v ? '#4ade80' : '#64748b',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>⏳ Loading donations…</div>
      ) : tab === 'available' ? (
        <>
          {/* AI Recommendation banner */}
          {scored.length > 0 && (
            <div style={{
              padding: '14px 20px', borderRadius: 12, marginBottom: 20,
              background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <p style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>AI Recommendation</p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Top pick: <strong style={{ color: '#e2e8f0' }}>{scored[0]?.foodType?.replace('_',' ')}</strong> from{' '}
                  <strong style={{ color: '#e2e8f0' }}>{scored[0]?.donor?.name}</strong> —{' '}
                  {scored[0]?._dist} km away · Highest priority score
                </p>
              </div>
            </div>
          )}

          {scored.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</p>
              <p style={{ color: '#64748b' }}>No donations within {radius} km. Try increasing the radius.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {scored.map((d, i) => (
                <div key={d._id} style={{ position: 'relative' }}>
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: -10, left: 12, zIndex: 10,
                      background: 'linear-gradient(135deg,#10b981,#0d9488)',
                      color: 'white', padding: '3px 10px', borderRadius: 20,
                      fontSize: '0.7rem', fontWeight: 700
                    }}>🤖 AI Top Pick</div>
                  )}
                  <div style={{
                    position: 'absolute', top: -10, right: 12, zIndex: 10,
                    background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                    border: '1px solid rgba(74,222,128,0.2)'
                  }}>📍 {d._dist} km</div>
                  <DonationCard donation={d} role="ngo"
                    onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {accepted.length === 0 && completed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚗</p>
              <p style={{ color: '#64748b' }}>No pickups yet. Accept a donation to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[...accepted, ...completed].map(d => (
                <DonationCard key={d._id} donation={d} role="ngo"
                  onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
