/* DonationCard — used in donor + NGO dashboards */
const FOOD_ICONS = {
  cooked: '🍛', packaged: '📦', raw: '🥦',
  organic_waste: '♻️', mixed: '🥗'
};

export default function DonationCard({ donation, role, onAccept, onReject, onComplete }) {
  const d = donation;
  const statusColors = {
    available: '#4ade80', accepted: '#60a5fa',
    completed: '#34d399', expired: '#94a3b8', rejected: '#f87171'
  };

  const timeLeft = () => {
    const diff = new Date(d.expiresAt) - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m left`;
  };

  return (
    <div className="donation-card animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'rgba(74,222,128,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
          }}>{FOOD_ICONS[d.foodType] || '🍱'}</div>
          <div>
            <p style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem', textTransform: 'capitalize' }}>
              {d.foodType?.replace('_', ' ')}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              by {d.donor?.name || d.donor?.organization || 'Unknown'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className={`badge badge-${d.status}`}>{d.status}</span>
          {d.isOrganic && <span className="badge badge-organic">♻️ Organic</span>}
        </div>
      </div>

      {/* Details */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12
      }}>
        {[
          ['📦 Qty', d.quantity],
          ['⏰ Expires', timeLeft()],
          ['📍 Location', d.address?.slice(0, 30) + '…' || '—'],
          ['🏢 Org', d.donor?.organization || 'Individual'],
        ].map(([k, v]) => (
          <div key={k} style={{
            padding: '8px 12px', borderRadius: 8,
            background: 'rgba(15,23,42,0.4)',
          }}>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 2 }}>{k}</p>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, wordBreak: 'break-word' }}>{v}</p>
          </div>
        ))}
      </div>

      {d.description && (
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12, fontStyle: 'italic' }}>
          "{d.description}"
        </p>
      )}

      {/* Action buttons */}
      {role === 'ngo' && d.status === 'available' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onAccept(d._id)} className="btn-primary" style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}>
            ✅ Accept
          </button>
          <button onClick={() => onReject(d._id)} className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
            ✕ Reject
          </button>
        </div>
      )}

      {role === 'ngo' && d.status === 'accepted' && (
        <button onClick={() => onComplete(d._id)} className="btn-amber" style={{ width: '100%', justifyContent: 'center', padding: '9px' }}>
          🎉 Mark Completed
        </button>
      )}

      {role === 'donor' && d.status === 'accepted' && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          fontSize: '0.82rem', color: '#93c5fd'
        }}>
          🚛 Accepted by: {d.acceptedBy?.name || d.acceptedBy?.organization || 'NGO'}
        </div>
      )}
    </div>
  );
}
