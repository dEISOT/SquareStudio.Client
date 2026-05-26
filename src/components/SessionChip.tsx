import type { ActiveSession } from '../types';
import { Icon } from './Icon';

interface SessionChipProps {
  session: ActiveSession;
  onOpenHistory: () => void;
  onEnd: () => void;
}

function pluralVisit(n: number): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return 'визитов';
  if (b > 1 && b < 5)   return 'визита';
  if (b === 1)           return 'визит';
  return 'визитов';
}

export function SessionChip({ session, onOpenHistory, onEnd }: SessionChipProps) {
  const { name, loyaltyPoints, history } = session;
  const hasHistory = history.length > 0;
  const visits = history.length;
  const initial = (name || 'Г').trim().charAt(0).toUpperCase();

  return (
    <div className="sesschip" role="group" aria-label={`Сессия · ${name}`}>
      <button
        type="button"
        className={`sesschip__main ${hasHistory ? 'is-link' : ''}`}
        onClick={hasHistory ? onOpenHistory : undefined}
        disabled={!hasHistory}
        title={hasHistory ? 'История заказов' : ''}
      >
        <span className="sesschip__avatar">{initial}</span>
        <span className="sesschip__text">
          <span className="sesschip__name">
            <span>{name}</span>
          </span>
          <span className="sesschip__sq">
            <span className="sq sq--accent" title="Бонусные баллы">
              <Icon name="square" size={12} stroke={2} />
              <span className="sq__v">{loyaltyPoints.toLocaleString('ru-RU')}</span>
            </span>
            {hasHistory && (
              <span className="sq" title="Прошлые визиты">
                <span className="sq__v">{visits}</span>
                <span className="sq__l">{pluralVisit(visits)}</span>
              </span>
            )}
          </span>
        </span>
        {hasHistory && <Icon name="chev" size={16} style={{ opacity: 0.55 }} />}
      </button>
      <button
        type="button"
        className="sesschip__end"
        onClick={onEnd}
        title="Завершить сессию"
        aria-label="Завершить сессию"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
