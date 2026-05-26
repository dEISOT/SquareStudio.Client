import type { Workstation } from '../types';

interface WorkstationSelectorProps {
  open: boolean;
  onClose: () => void;
  workstations: Workstation[];
  currentId: number | null;
  onSelect: (id: number) => void;
}

export function WorkstationSelector({ open, onClose, workstations, currentId, onSelect }: WorkstationSelectorProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 8001,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.5rem',
          minWidth: 320,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
            Выбор рабочего места
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 2 }}>
            Этот экран будет получать приветствия только для выбранного места
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {workstations.map((ws) => {
            const active = ws.id === currentId;
            return (
              <button
                key={ws.id}
                onClick={() => { onSelect(ws.id); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                  background: active ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>{ws.name}</div>
                  {ws.description && <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 1 }}>{ws.description}</div>}
                </div>
                {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '1rem', width: '100%', padding: '0.625rem',
            borderRadius: '0.5rem', border: '1px solid #e2e8f0',
            background: '#f8fafc', cursor: 'pointer',
            fontSize: '0.875rem', color: '#64748b',
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
