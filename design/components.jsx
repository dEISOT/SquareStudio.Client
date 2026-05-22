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
