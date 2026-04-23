export default function Spinner({ size = 48, message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16
    }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid rgba(74,222,128,0.15)`,
        borderTopColor: '#4ade80',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
