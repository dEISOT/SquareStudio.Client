import { useEffect } from 'react';
import type { CartItem, Product, Service } from '../types';
import { cartKey } from '../types';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { rub, variantPrice } from '../utils/format';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  productsById: Record<number, Product>;
  servicesById: Record<number, Service>;
  onClose: () => void;
  onInc: (id: number, size?: string) => void;
  onDec: (id: number, size?: string) => void;
  onRemove: (id: number, size?: string) => void;
  onIncSvc: (id: number) => void;
  onDecSvc: (id: number) => void;
  onRemoveSvc: (id: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  productsById,
  servicesById,
  onClose,
  onInc,
  onDec,
  onRemove,
  onIncSvc,
  onDecSvc,
  onRemoveSvc,
  onCheckout,
}: CartDrawerProps) {
  const total = items.reduce((s, it) => {
    if (it.serviceId != null) {
      const svc = servicesById[it.serviceId];
      return s + it.qty * (svc?.cost ?? 0);
    }
    const pr = productsById[it.productId!];
    return s + it.qty * (pr ? variantPrice(pr, it.selectedSize) : 0);
  }, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="scrim scrim--drawer" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Корзина">
        <header className="drawer__head">
          <div>
            <div className="drawer__eyebrow">Ваш заказ</div>
            <h2 className="drawer__title">Корзина</h2>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <div className="drawer__empty-mark">∅</div>
            <h3>Корзина пуста</h3>
            <p>
              Добавьте напитки, десерты или продукты для ухода — администратор
              принесёт всё к вашему креслу.
            </p>
            <button className="btn btn--primary btn--lg" onClick={onClose}>
              Перейти к меню
            </button>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {items.map((it) => {
                const key = cartKey(it);

                if (it.serviceId != null) {
                  const svc = servicesById[it.serviceId];
                  if (!svc) return null;
                  return (
                    <li key={key} className="line">
                      <PhotoSlot item={svc} size="line" />
                      <div className="line__body">
                        <div className="line__top">
                          <div>
                            <div className="line__name">{svc.name}</div>
                            <div className="line__sub">Услуга</div>
                          </div>
                          <button
                            className="line__x"
                            onClick={() => onRemoveSvc(svc.id)}
                            aria-label="Удалить"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                        <div className="line__bot">
                          <div className="qty qty--sm">
                            <button className="qty__btn" onClick={() => onDecSvc(svc.id)}>
                              <Icon name="minus" size={16} />
                            </button>
                            <span className="qty__n">{it.qty}</span>
                            <button className="qty__btn" onClick={() => onIncSvc(svc.id)}>
                              <Icon name="plus" size={16} />
                            </button>
                          </div>
                          <div className="line__price">{rub(svc.cost * it.qty)}</div>
                        </div>
                      </div>
                    </li>
                  );
                }

                const pr = productsById[it.productId!];
                if (!pr) return null;
                return (
                  <li key={key} className="line">
                    <PhotoSlot item={pr} size="line" />
                    <div className="line__body">
                      <div className="line__top">
                        <div>
                          <div className="line__name">{pr.name}</div>
                          {it.selectedSize && (
                            <div className="line__sub">{it.selectedSize}</div>
                          )}
                        </div>
                        <button
                          className="line__x"
                          onClick={() => onRemove(pr.id, it.selectedSize)}
                          aria-label="Удалить"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                      <div className="line__bot">
                        <div className="qty qty--sm">
                          <button
                            className="qty__btn"
                            onClick={() => onDec(pr.id, it.selectedSize)}
                          >
                            <Icon name="minus" size={16} />
                          </button>
                          <span className="qty__n">{it.qty}</span>
                          <button
                            className="qty__btn"
                            onClick={() => onInc(pr.id, it.selectedSize)}
                          >
                            <Icon name="plus" size={16} />
                          </button>
                        </div>
                        <div className="line__price">{rub(variantPrice(pr, it.selectedSize) * it.qty)}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="drawer__foot">
              <div className="drawer__row">
                <span>Позиций</span>
                <span>{count}</span>
              </div>
              <div className="drawer__row drawer__row--total">
                <span>Итого</span>
                <span className="drawer__total">{rub(total)}</span>
              </div>
              <div className="drawer__note">
                <Icon name="note" size={16} />
                <span>Оплата — на стойке после стрижки.</span>
              </div>
              <button className="btn btn--primary btn--xl" onClick={onCheckout}>
                <span>Оформить заказ</span>
                <Icon name="arrow" size={20} />
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
