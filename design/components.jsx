// Shared UI primitives + the product card. All components are dumped on `window`
// so the screen files below can reach them without ES modules.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size = 20, stroke = 1.6, style }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { flex: '0 0 auto', ...style },
  };
  switch (name) {
    case 'search':  return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'cart':    return <svg {...common}><path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.4L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>;
    case 'plus':    return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':   return <svg {...common}><path d="M5 12h14"/></svg>;
    case 'close':   return <svg {...common}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'check':   return <svg {...common}><path d="m5 12 5 5L20 7"/></svg>;
    case 'wifi':    return <svg {...common}><path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="19.5" r="0.8" fill="currentColor"/></svg>;
    case 'chev':    return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case 'arrow':   return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'back':    return <svg {...common}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
    case 'time':    return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'cancel':  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>;
    case 'sparkle': return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>;
    case 'square':  return <svg {...common}><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" stroke="none"/></svg>;
    case 'note':    return <svg {...common}><path d="M4 5h16M4 10h16M4 15h10"/></svg>;
    case 'chair':   return <svg {...common}><path d="M6 11V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5"/><path d="M4 11h16l-1 4H5z"/><path d="M7 15v5M17 15v5"/></svg>;
    default: return null;
  }
}
window.Icon = Icon;

// ── Format ────────────────────────────────────────────────────────────────────
function rub(n) {
  // 1 234 ₽
  return n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
}
window.rub = rub;

// "1 визит / 2 визита / 5 визитов" — Russian plural for "visit"
function pluralVisit(n) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return 'визитов';
  if (b > 1 && b < 5)   return 'визита';
  if (b === 1)          return 'визит';
  return 'визитов';
}
window.pluralVisit = pluralVisit;

// ── Session chip (header) ─────────────────────────────────────────────────────
// Compact header button that appears while a guest's session is open. Shows the
// guest's name + loyalty points as small "квадратики" and opens the order-history
// screen on tap. The little × ends the session manually (also done via socket).
function SessionChip({ session, onOpenHistory, onEnd }) {
  const { name, points, history } = session;
  const hasPoints  = typeof points === 'number';
  const hasHistory = Array.isArray(history) && history.length > 0;
  const visits = hasHistory ? history.length : 0;
  const initial = (name || 'Г').trim().charAt(0).toUpperCase();

  const onChipClick = (e) => {
    e.stopPropagation();
    if (hasHistory) onOpenHistory();
  };
  const onEndClick = (e) => {
    e.stopPropagation();
    onEnd?.();
  };

  return (
    <div className="sesschip" role="group" aria-label={`Сессия · ${name}`}>
      <button
        type="button"
        className={`sesschip__main ${hasHistory ? 'is-link' : ''}`}
        onClick={onChipClick}
        disabled={!hasHistory}
        title={hasHistory ? 'История заказов' : ''}
      >
        <span className="sesschip__avatar" aria-hidden="true">{initial}</span>
        <span className="sesschip__text">
          <span className="sesschip__name">
            <span>{name}</span>
          </span>
          <span className="sesschip__sq">
            {hasPoints && (
              <span className="sq sq--accent" title="Бонусные баллы">
                <Icon name="square" size={12} stroke={2}/>
                <span className="sq__v">{points.toLocaleString('ru-RU')}</span>
              </span>
            )}
            {hasHistory && (
              <span className="sq" title="Прошлые визиты">
                <span className="sq__v">{visits}</span>
                <span className="sq__l">{pluralVisit(visits)}</span>
              </span>
            )}
          </span>
        </span>
        {hasHistory && <Icon name="chev" size={16} style={{ opacity: 0.55 }}/>}
      </button>
      <button
        type="button"
        className="sesschip__end"
        onClick={onEndClick}
        title="Завершить сессию"
        aria-label="Завершить сессию"
      >
        <Icon name="close" size={14}/>
      </button>
    </div>
  );
}
window.SessionChip = SessionChip;

// ── Session banner (legacy on-page placement) ───────────────────────────────────
// Sits at the top of the main page when a guest's session is open. Shows their
// loyalty stats as small square tiles and a link into the full order history.
function SessionBanner({ session, onOpenHistory, onEnd }) {
  const { name, points, tier, nextTier, toNext, history } = session;
  const hasPoints  = typeof points === 'number';
  const hasHistory = Array.isArray(history) && history.length > 0;
  const visits = hasHistory ? history.length : 0;

  const tiles = [];
  if (hasPoints) tiles.push({
    label: 'Бонусные баллы',
    value: points.toLocaleString('ru-RU'),
    accent: true,
  });
  if (hasHistory) tiles.push({
    label: pluralVisit(visits),
    value: String(visits),
  });
  if (tier) tiles.push({
    label: 'Уровень',
    value: tier,
  });
  if (typeof toNext === 'number' && toNext > 0) tiles.push({
    label: `до ${nextTier || 'следующего уровня'}`,
    value: toNext.toLocaleString('ru-RU'),
    sub: 'баллов',
  });

  return (
    <section className="sessbanner" aria-label="Активная сессия">
      <div className="sessbanner__head">
        <div className="sessbanner__who">
          <span className="sessbanner__eyebrow">Активная сессия</span>
          <h2 className="sessbanner__name">Здравствуйте, {name}</h2>
        </div>
        <div className="sessbanner__actions">
          {hasHistory && (
            <button className="sessbanner__history" onClick={onOpenHistory}>
              <Icon name="time" size={18}/>
              <span>История заказов</span>
              <span className="sessbanner__hcount">{visits}</span>
              <Icon name="chev" size={16}/>
            </button>
          )}
          <button className="sessbanner__end" onClick={onEnd} title="Завершить сессию">
            <Icon name="close" size={16}/>
          </button>
        </div>
      </div>

      {tiles.length > 0 && (
        <div className="sessbanner__tiles">
          {tiles.map((t, i) => (
            <div key={i} className={`tile ${t.accent ? 'tile--accent' : ''}`}>
              <div className="tile__value">
                {t.value}
                {t.sub && <span className="tile__sub">{t.sub}</span>}
              </div>
              <div className="tile__label">{t.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
window.SessionBanner = SessionBanner;

// ── Placeholder image (subtle stripes) ────────────────────────────────────────
function PhotoSlot({ product, size = 'card' }) {
  if (product.photo) {
    return <div className={`photo photo--${size}`} style={{ backgroundImage: `url("${product.photo}")` }}/>;
  }
  const [a, b] = product.tone;
  const initials = product.name.replace(/[«»]/g,'').split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`photo photo--${size} photo--placeholder`} style={{
      background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
    }}>
      <div className="photo__stripes" aria-hidden="true"/>
      <div className="photo__mono">{initials}</div>
    </div>
  );
}
window.PhotoSlot = PhotoSlot;

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, qtyInCart, onOpen, onAdd, onInc, onDec }) {
  const stop = (e) => e.stopPropagation();
  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0}>
      <PhotoSlot product={product} size="card"/>
      <div className="card__body">
        <div className="card__head">
          <h3 className="card__name">{product.name}</h3>
          {product.sub && <span className="card__sub">{product.sub}</span>}
        </div>
        <p className="card__desc">{product.desc}</p>
        <div className="card__foot">
          <span className="card__price">{rub(product.price)}</span>
          {qtyInCart > 0 ? (
            <div className="qty" onClick={stop}>
              <button className="qty__btn" onClick={onDec} aria-label="Убрать одну">
                <Icon name="minus" size={18}/>
              </button>
              <span className="qty__n">{qtyInCart}</span>
              <button className="qty__btn" onClick={onInc} aria-label="Добавить одну">
                <Icon name="plus" size={18}/>
              </button>
            </div>
          ) : (
            <button className="add" onClick={(e) => { stop(e); onAdd(); }}>
              <Icon name="plus" size={18}/>
              <span>В корзину</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
window.ProductCard = ProductCard;

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, size = 'md', label }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose} role="dialog" aria-label={label}>
      <div className={`sheet sheet--${size}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
window.Modal = Modal;
