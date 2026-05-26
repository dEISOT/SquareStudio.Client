import { useEffect, useState } from 'react';
import type { SessionGreeting } from '../hooks/useSignalR';

interface SessionGreetingProps {
  greeting: SessionGreeting;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 30000;

function fmtTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function SessionGreetingOverlay({ greeting, onDismiss }: SessionGreetingProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#00102e',
        display: 'flex', flexDirection: 'column',
        padding: '2.5rem 3rem',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes fadeInGreeting {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        .greeting-root { animation: fadeInGreeting 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div
        className="greeting-root"
        style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.webp"
              alt="SquareStudio"
              style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 8 }}
            />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                SquareStudio
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Barber
              </div>
            </div>
          </div>

          {/* Session indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              animation: 'pulse 2.5s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '0.8125rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.06em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              СЕССИЯ · {fmtTime(now)}
            </span>
          </div>
        </div>

        {/* Main content — vertically centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '1rem' }}>
          <div style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '0.5rem',
          }}>
            Добрый день,
          </div>
          <div style={{
            fontSize: 'clamp(6rem, 20vw, 16rem)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            marginBottom: '2rem',
          }}>
            {greeting.clientName || 'Гость'}
          </div>
          <div style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.75rem)', fontWeight: 400,
            color: 'rgba(255,255,255,0.38)',
            maxWidth: 700,
            lineHeight: 1.6,
          }}>
            Рады видеть вас снова. Меню заказа уже готово —<br />
            выберите кофе, закуски или назначьте уход в кресле.
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
              display: 'inline-block',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              Коснитесь экрана, чтобы открыть меню
            </span>
          </div>
          <span style={{
            fontSize: '0.6875rem',
            color: 'rgba(255,255,255,0.12)',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}>
            welcome.session.open
          </span>
        </div>
      </div>
    </div>
  );
}
