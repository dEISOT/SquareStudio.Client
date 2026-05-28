import type { ActiveSession } from '../types';
import { Icon } from './Icon';

interface SessionChipProps {
  session: ActiveSession;
  onOpenHistory: () => void;
}

function pluralVisit(n: number): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return 'визитов';
  if (b > 1 && b < 5)   return 'визита';
  if (b === 1)           return 'визит';
  return 'визитов';
}

export function SessionChip({ session, onOpenHistory }: SessionChipProps) {
  const { name, loyaltyPoints } = session;
  const initial = (name || 'Г').trim().charAt(0).toUpperCase();

  return (
    <div className="sesschip" role="group" aria-label={`Сессия · ${name}`}>
      <button
        type="button"
        className="sesschip__main is-link"
        onClick={onOpenHistory}
        title="История заказов"
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
          </span>
        </span>
        <Icon name="chev" size={16} style={{ opacity: 0.55 }} />
      </button>
    </div>
  );
}
