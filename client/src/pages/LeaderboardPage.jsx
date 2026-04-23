import { useState, useEffect } from 'react';
import api from '../utils/api';
import Toast from '../components/Toast';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [donors, setDonors] = useState([]);
  const [ngos,   setNgos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('donors');
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Only use donations endpoint — donor/ngo info is already populated
      const { data: allDonations } = await api.get('/api/donations');

      /* ── Donor leaderboard: group by donor._id ── */
      const donorMap = {};
      allDonations.forEach(d => {
        const id = d.donor?._id;
        if (!id) return;
        if (!donorMap[id]) {
          donorMap[id] = {
            id,
            name: d.donor?.name || 'Unknown',
            org:  d.donor?.organization || 'Individual',
            total: 0, completed: 0, organic: 0, points: 0,
          };
        }
        donorMap[id].total++;
        if (d.status === 'completed') donorMap[id].completed++;
        if (d.isOrganic) donorMap[id].organic++;
        donorMap[id].points =
          donorMap[id].completed * 10 +
          donorMap[id].organic   *  5 +
          donorMap[id].total     *  2;
      });

      /* ── NGO leaderboard: group by acceptedBy._id ── */
      const ngoMap = {};
      allDonations
        .filter(d => d.acceptedBy?._id)
        .forEach(d => {
          const id = d.acceptedBy._id;
          if (!ngoMap[id]) {
            ngoMap[id] = {
              id,
              name: d.acceptedBy?.name || 'Unknown NGO',
              org:  d.acceptedBy?.organization || 'NGO',
              accepted: 0, completed: 0, points: 0,
            };
          }
          ngoMap[id].accepted++;
          if (d.status === 'completed') ngoMap[id].completed++;
          ngoMap[id].points =
            ngoMap[id].completed * 15 +
            ngoMap[id].accepted  *  3;
        });

      setDonors(Object.values(donorMap).sort((a, b) => b.points - a.points));
      setNgos(Object.values(ngoMap).sort((a, b) => b.points - a.points));
    } catch {
      setToast({ message: 'Failed to load leaderboard', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const list = tab === 'donors' ? donors : ngos;

  return (
    <div style={{ minHeight: '100vh', padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>
          🏆 <span className="gradient-text">Impact Leaderboard</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Celebrating our top contributors who are making a difference
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
        {[['donors','🍽️ Top Donors'], ['ngos','🏢 Top NGOs']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '10px 24px', borderRadius: 10, border: '1.5px solid',
            borderColor: tab === v ? '#4ade80' : 'rgba(74,222,128,0.15)',
            background: tab === v ? 'rgba(74,222,128,0.12)' : 'transparent',
            color: tab === v ? '#4ade80' : '#64748b',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>⏳ Calculating rankings…</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏆</p>
          <p style={{ color: '#64748b' }}>No data yet. Make some donations to appear here!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {list.length >= 3 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
              marginBottom: 28, alignItems: 'flex-end'
            }}>
              {/* 2nd */}
              <div className="glass" style={{
                padding: 20, textAlign: 'center', order: 1,
                borderColor: 'rgba(192,192,192,0.3)',
                paddingBottom: 32
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{MEDALS[1]}</div>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, margin: '0 auto 12px',
                  background: 'rgba(192,192,192,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 900, color: '#94a3b8'
                }}>{list[1]?.name?.[0]}</div>
                <p style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{list[1]?.name}</p>
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{list[1]?.org}</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#94a3b8', marginTop: 8 }}>{list[1]?.points} pts</p>
              </div>

              {/* 1st */}
              <div style={{
                padding: 24, textAlign: 'center', order: 0, borderRadius: 16,
                background: 'linear-gradient(135deg,rgba(234,179,8,0.15),rgba(234,179,8,0.05))',
                border: '1.5px solid rgba(234,179,8,0.35)',
                boxShadow: '0 0 30px rgba(234,179,8,0.15)'
              }}>
                <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{MEDALS[0]}</div>
                <div style={{
                  width: 60, height: 60, borderRadius: 16, margin: '0 auto 12px',
                  background: 'linear-gradient(135deg,#eab308,#ca8a04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', fontWeight: 900, color: 'white',
                  boxShadow: '0 4px 16px rgba(234,179,8,0.5)'
                }}>{list[0]?.name?.[0]}</div>
                <p style={{ fontWeight: 800, color: '#fde68a', fontSize: '1rem' }}>{list[0]?.name}</p>
                <p style={{ fontSize: '0.74rem', color: '#92400e', marginTop: 3 }}>{list[0]?.org}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#eab308', marginTop: 10 }}>{list[0]?.points} pts</p>
                <div style={{
                  marginTop: 8, padding: '4px 12px', borderRadius: 20, display: 'inline-block',
                  background: 'rgba(234,179,8,0.2)', color: '#fde68a', fontSize: '0.72rem', fontWeight: 700
                }}>👑 #1 Champion</div>
              </div>

              {/* 3rd */}
              <div className="glass" style={{
                padding: 20, textAlign: 'center', order: 2,
                borderColor: 'rgba(180,120,60,0.3)',
                paddingBottom: 28
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{MEDALS[2]}</div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
                  background: 'rgba(180,120,60,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: 900, color: '#b45309'
                }}>{list[2]?.name?.[0]}</div>
                <p style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{list[2]?.name}</p>
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{list[2]?.org}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b45309', marginTop: 8 }}>{list[2]?.points} pts</p>
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            {list.map((entry, i) => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px',
                borderBottom: i < list.length - 1 ? '1px solid rgba(74,222,128,0.07)' : 'none',
                background: i < 3 ? 'rgba(74,222,128,0.03)' : 'transparent',
                transition: 'background 0.2s'
              }}>
                {/* Rank */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: i < 3 ? 'rgba(234,179,8,0.15)' : 'rgba(74,222,128,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 3 ? '1rem' : '0.85rem',
                  fontWeight: 800, color: i < 3 ? '#eab308' : '#64748b'
                }}>{i < 3 ? MEDALS[i] : `#${i + 1}`}</div>

                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg,#16a34a,#0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 800, color: 'white'
                }}>{entry.name?.[0]}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{entry.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{entry.org}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                  {tab === 'donors' ? (
                    <>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }}>{entry.total}</p>
                        <p style={{ fontSize: '0.65rem', color: '#475569' }}>Donated</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>{entry.completed}</p>
                        <p style={{ fontSize: '0.65rem', color: '#475569' }}>Completed</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a3e635' }}>{entry.organic}</p>
                        <p style={{ fontSize: '0.65rem', color: '#475569' }}>Organic</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>{entry.accepted}</p>
                        <p style={{ fontSize: '0.65rem', color: '#475569' }}>Accepted</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>{entry.completed}</p>
                        <p style={{ fontSize: '0.65rem', color: '#475569' }}>Completed</p>
                      </div>
                    </>
                  )}
                  <div style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: 'rgba(74,222,128,0.1)',
                    color: '#4ade80', fontWeight: 800, fontSize: '0.9rem',
                    minWidth: 70, textAlign: 'center'
                  }}>{entry.points} <span style={{ fontSize: '0.65rem' }}>pts</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Points legend */}
          <div style={{
            marginTop: 20, padding: '14px 20px', borderRadius: 12,
            background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(74,222,128,0.1)',
            fontSize: '0.78rem', color: '#64748b'
          }}>
            <strong style={{ color: '#94a3b8' }}>🏅 Points System:</strong>
            {tab === 'donors'
              ? ' +10 per completed · +5 per organic · +2 per donation posted'
              : ' +15 per completed pickup · +3 per accepted'}
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
