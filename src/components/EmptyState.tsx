interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__mark">∅</div>
      <h3>{query ? `Ничего не нашли по «${query}»` : 'Здесь пока пусто'}</h3>
      <p>Попробуйте другой запрос или выберите категорию выше.</p>
      {query && (
        <button className="btn btn--ghost" onClick={onClear}>
          Очистить поиск
        </button>
      )}
    </div>
  );
}
