import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { path: '/',            label: 'Home'        },
  { path: '/map',         label: '🗺️ Map'      },
  { path: '/leaderboard', label: '🏆 Leaders'  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'ngo'   ? '/ngo'   : '/donor';

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const isActive = (p) => location.pathname === p;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 999,
      background: 'rgba(15,23,42,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(74,222,128,0.12)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 64
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(22,163,74,0.4)'
          }}>🌱</div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
            <span className="gradient-text">Leftovers</span>
            <span style={{ color: '#94a3b8' }}> to Life</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path} style={{
              padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
              color: isActive(l.path) ? '#4ade80' : '#94a3b8',
              background: isActive(l.path) ? 'rgba(74,222,128,0.1)' : 'transparent',
            }}>{l.label}</Link>
          ))}

          {user ? (
            <>
              <Link to={dashboardPath} style={{
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 500,
                color: isActive(dashboardPath) ? '#4ade80' : '#94a3b8',
                background: isActive(dashboardPath) ? 'rgba(74,222,128,0.1)' : 'transparent',
              }}>📊 Dashboard</Link>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginLeft: 8, paddingLeft: 16,
                borderLeft: '1px solid rgba(74,222,128,0.2)'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg,#16a34a,#0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white'
                }}>{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
                <button onClick={handleLogout} style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)', color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>Logout</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} style={{
          display: 'none', flexDirection: 'column', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4,
        }} className="hamburger">
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 22, height: 2, borderRadius: 1,
              background: '#4ade80', display: 'block',
              transition: 'all 0.3s',
            }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          padding: '16px 0 20px',
          borderTop: '1px solid rgba(74,222,128,0.1)',
          display: 'flex', flexDirection: 'column', gap: 4
        }}>
          {NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} style={{
              padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
              color: isActive(l.path) ? '#4ade80' : '#94a3b8', fontWeight: 500
            }}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)} style={{
                padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
                color: '#94a3b8', fontWeight: 500
              }}>📊 Dashboard</Link>
              <button onClick={handleLogout} style={{
                margin: '8px 16px 0', padding: '10px',
                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                fontWeight: 600, cursor: 'pointer'
              }}>Logout</button>
            </>
          ) : (
            <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/login"    className="btn-secondary" onClick={() => setOpen(false)} style={{ textAlign: 'center', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" className="btn-primary"   onClick={() => setOpen(false)} style={{ textAlign: 'center', textDecoration: 'none' }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
