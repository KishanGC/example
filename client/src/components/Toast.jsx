import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const cls   = { success: 'toast-success', error: 'toast-error', info: 'toast-info' };

  return (
    <div className={`toast ${cls[type]}`} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
      <span style={{ fontSize: '1.1rem' }}>{icons[type]}</span>
      <span>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{ marginLeft: 8, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>
        ✕
      </button>
    </div>
  );
}
