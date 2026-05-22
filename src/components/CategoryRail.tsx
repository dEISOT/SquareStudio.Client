import type { Category } from '../types';

interface CategoryRailProps {
  categories: Category[];
  active: number | 'all';
  onPick: (id: number | 'all') => void;
  counts: Record<string, number>;
}

export function CategoryRail({ categories, active, onPick, counts }: CategoryRailProps) {
  const all = [{ id: 'all' as const, name: 'Всё меню' }, ...categories];

  return (
    <nav className="rail" aria-label="Категории">
      <div className="rail__inner">
        {all.map((c) => (
          <button
            key={c.id}
            className={`pill ${active === c.id ? 'is-active' : ''}`}
            onClick={() => onPick(c.id as number | 'all')}
          >
            <span>{c.name}</span>
            <span className="pill__count">{counts[String(c.id)] ?? 0}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
