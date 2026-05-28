import { useState, useEffect } from 'react';
import type { CartItem, Product, Workstation } from '../types';
import { cartKey } from '../types';
import { Icon } from './Icon';
import { rub, variantPrice } from '../utils/format';

interface CheckoutProps {
  open: boolean;
  items: CartItem[];
  productsById: Record<number, Product>;
  workstations: Workstation[];
  onCancel: () => void;
  onSubmit: (data: { name: string; workstationId: number; note: string }) => void;
  submitting?: boolean;
  prefillName?: string;
  prefillWorkstationId?: number | null;
}

export function Checkout({
  open,
  items,
  productsById,
  workstations,
  onCancel,
  onSubmit,
  submitting = false,
  prefillName,
  prefillWorkstationId,
}: CheckoutProps) {
  const [name, setName] = useState('');
  const [ws, setWs] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setWs('');
      setNote('');
      setTouched(false);
    } else {
      setName(prefillName ?? '');
      setWs(prefillWorkstationId ? String(prefillWorkstationId) : '');
    }
  // prefillName/prefillWorkstationId are captured at open time — deps intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const total = items.reduce((s, it) => {
    const pr = productsById[it.productId];
    return s + it.qty * (pr ? variantPrice(pr, it.selectedSize) : 0);
  }, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);
  const valid = name.trim().length >= 2 && !!ws;

  const handleSubmit = () => {
    if (!valid) {
      setTouched(true);
      return;
    }
    onSubmit({ name: name.trim(), workstationId: Number(ws), note: note.trim() });
  };

  return (
    <div className="overlay" role="dialog" aria-label="Оформление заказа">
      <div className="overlay__inner overlay__inner--split">
        <header className="overlay__head">
          <button
            className="iconbtn iconbtn--ghost"
            onClick={onCancel}
            aria-label="Назад"
          >
            <Icon name="back" size={22} />
          </button>
          <div className="overlay__crumb">
            Корзина &nbsp;·&nbsp; <strong>Оформление</strong>
          </div>
          <div style={{ width: 44 }} />
        </header>

        <div className="checkout">
          <section className="checkout__form">
            <h1 className="checkout__title">Подтвердите заказ</h1>
            <p className="checkout__lede">
              Администратор принесёт всё к вашему креслу и добавит к счёту на
              стрижку.
            </p>

            <label className="field">
              <span className="field__label">
                Имя <em>обязательно</em>
              </span>
              <input
                className="field__input"
                placeholder="Как к вам обращаться?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
              />
              {touched && name.trim().length < 2 && (
                <span className="field__err">Введите имя</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">
                <Icon name="chair" size={16} /> Рабочее место{' '}
                <em>обязательно</em>
              </span>
              <div className="select">
                <select
                  className="field__input"
                  value={ws}
                  onChange={(e) => setWs(e.target.value)}
                  onBlur={() => setTouched(true)}
                >
                  <option value="">
                    Выберите кресло — барбер подскажет номер
                  </option>
                  {workstations.map((w) => (
                    <option key={w.id} value={String(w.id)}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chev"
                  size={16}
                  style={{ transform: 'rotate(90deg)' }}
                />
              </div>
              {touched && !ws && (
                <span className="field__err">Выберите рабочее место</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">
                <Icon name="note" size={16} /> Комментарий администратору
              </span>
              <textarea
                className="field__input field__input--area"
                rows={4}
                placeholder="Например: кофе без сахара, без молока, отдельно лёд."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={240}
              />
              <span className="field__hint">{note.length}/240</span>
            </label>
          </section>

          <aside className="checkout__summary">
            <div className="summary">
              <h2 className="summary__title">Ваш заказ</h2>
              <ul className="summary__list">
                {items.map((it) => {
                  const pr = productsById[it.productId];
                  if (!pr) return null;
                  const key = cartKey(it.productId, it.selectedSize);
                  return (
                    <li key={key} className="summary__line">
                      <span className="summary__qty">{it.qty}×</span>
                      <span className="summary__name">
                        {pr.name}
                        {it.selectedSize && (
                          <span className="summary__size"> · {it.selectedSize}</span>
                        )}
                      </span>
                      <span className="summary__price">
                        {rub(pr.price * it.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="summary__divider" />
              <div className="summary__row">
                <span>Позиций</span>
                <span>{count}</span>
              </div>
              <div className="summary__row summary__row--total">
                <span>К оплате на стойке</span>
                <span className="summary__total">{rub(total)}</span>
              </div>
              <button
                className="btn btn--primary btn--xl btn--block"
                disabled={submitting}
                onClick={handleSubmit}
              >
                <Icon name="check" size={20} />
                <span>{submitting ? 'Отправляем…' : 'Подтвердить заказ'}</span>
              </button>
              <button className="btn btn--ghost btn--block" onClick={onCancel}>
                Вернуться в корзину
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
