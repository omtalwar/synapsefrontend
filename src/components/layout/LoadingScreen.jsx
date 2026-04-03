import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import '../../styles/components/LoadingScreen.css';

export default function LoadingScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2200);
    const t2 = setTimeout(() => onDone?.(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`synapse-loader ${fading ? 'fade-out' : ''}`}>
      <div className="loading-dot-grid" />
      <div className="loading-orb-1" />
      <div className="loading-orb-2" />

      <div className="loading-content">
        <div className="loading-logo-wrap">
        </div>

        <div className="loading-wordmark">
          {'SYNAPSE'.split('').map((ch, i) => (
            <span
              key={i}
              className="loading-letter"
              style={{ animation: `fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 60}ms both` }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div className="loading-tagline">YOUR SECOND BRAIN</div>

        <div className="loader-bar-track">
          <div className="loader-bar-fill" />
        </div>

        <div className="loader-dots loading-dots-spacing">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      </div>
    </div>
  );
}
