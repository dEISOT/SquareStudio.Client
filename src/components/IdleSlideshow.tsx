import { useState, useEffect } from 'react';
import type { Ad } from '../types';

interface IdleSlideshowProps {
  ads: Ad[];
  onWake: () => void;
  intervalMs?: number;
}

export function IdleSlideshow({ ads, onWake, intervalMs = 6000 }: IdleSlideshowProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [ads]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(
      () => setCurrent((i) => (i + 1) % ads.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [ads.length, intervalMs]);

  return (
    <div
      className="idle"
      onClick={onWake}
      role="button"
      tabIndex={0}
      aria-label="Коснитесь, чтобы продолжить"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? onWake() : undefined)}
    >
      {ads.length === 0 ? (
        <div className="idle__fallback">
          <img src="/logo.webp" alt="SquareStudio" className="idle__fallback-logo" />
          <p className="idle__fallback-hint">Коснитесь экрана, чтобы продолжить →</p>
        </div>
      ) : (
        ads.map((ad, idx) => (
          <div
            key={ad.id}
            className={`idle__slide ${idx === current ? 'is-current' : ''}`}
            style={{ backgroundImage: `url("${ad.imageUrl}")` }}
          />
        ))
      )}

      {ads.length > 0 && (
        <div className="idle__chrome">
          <div className="idle__topbar">
            <img src="/logo.webp" alt="" className="idle__logo" />
            <span className="idle__brand">SquareStudio</span>
          </div>
          <div className="idle__bottom">
            <div className="idle__hint">Коснитесь экрана, чтобы продолжить →</div>
            {ads.length > 1 && (
              <div className="idle__dots">
                {ads.map((_, k) => (
                  <span key={k} className={k === current ? 'is-current' : ''} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
