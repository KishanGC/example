import { useState, useEffect, useRef } from 'react';

/* Animates a number from 0 → target */
export function AnimatedCounter({ target, suffix = '', duration = 1500 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(target);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* Generic stat card */
export function StatCard({ icon, label, value, sub, color = '#4ade80', bg }) {
  return (
    <div className="stat-card glass" style={{ background: bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>{sub}</p>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem'
        }}>{icon}</div>
      </div>
    </div>
  );
}
