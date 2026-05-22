import type { Order, Product } from '../types';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { rub } from '../utils/format';

interface OrderStatusProps {
  order: Order;
  productsById: Record<number, Product>;
  onClose: () => void;
  onCancel: () => void;
}

const STEPS: { key: Order['status']; label: string }[] = [
  { key: 'Pending',    label: 'Заказ принят' },
  { key: 'InProgress', label: 'Готовим' },
  { key: 'Done',       label: 'У вас' },
];

export function OrderStatus({ order, productsById, onClose, onCancel }: OrderStatusProps) {
  const activeIdx = STEPS.findIndex((s) => s.key === order.status);
  const canCancel  = order.status === 'Pending';

  const heroEyebrow = canCancel
    ? 'Ожидает подтверждения администратора'
    : order.status === 'InProgress'
    ? 'Принят. Готовим.'
    : 'Доставлено к креслу';

  const heroTitle = canCancel
    ? 'Заказ передан администратору.'
    : order.status === 'InProgress'
    ? 'Мы уже готовим.'
    : 'Приятного!';

  const itemCount = order.orderItems.reduce((s, it) => s + it.quantity, 0);

  return (
    <div className="overlay" role="dialog" aria-label="Статус заказа">
      <div className="overlay__inner">
        <header className="overlay__head">
          <button className="iconbtn iconbtn--ghost" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={22} />
          </button>
          <div className="overlay__crumb">
            Заказ № <strong>{order.id}</strong>
          </div>
          <div style={{ width: 44 }} />
        </header>

        <div className="status">
          <div className="status__hero">
            <div className="status__eyebrow">{heroEyebrow}</div>
            <h1 className="status__title">
              Спасибо, {order.customer}.<br />
              {heroTitle}
            </h1>
            <div className="status__meta">
              <div>
                <span>Кресло</span>
                <strong>{order.workStationName}</strong>
              </div>
              <div>
                <span>Позиций</span>
                <strong>{itemCount}</strong>
              </div>
              <div>
                <span>К оплате</span>
                <strong>{rub(order.totalAmount)}</strong>
              </div>
            </div>
          </div>

          <ol className="track">
            {STEPS.map((s, i) => (
              <li
                key={s.key}
                className={`track__step ${i <= activeIdx ? 'is-active' : ''} ${i === activeIdx ? 'is-current' : ''}`}
              >
                <div className="track__dot">
                  {i < activeIdx ? <Icon name="check" size={16} /> : i + 1}
                </div>
                <div className="track__label">{s.label}</div>
              </li>
            ))}
          </ol>

          <div className="status__items">
            <h3>Состав заказа</h3>
            <ul>
              {order.orderItems.map((it) => {
                const pr = productsById[it.productId];
                return (
                  <li key={it.id}>
                    {pr ? (
                      <PhotoSlot product={pr} size="line" />
                    ) : (
                      <div className="photo photo--line photo--placeholder" style={{ background: '#e5e7eb' }} />
                    )}
                    <div>
                      <div className="status__iname">{it.productName}</div>
                      {it.size && (
                        <div className="status__isub">{it.size}</div>
                      )}
                    </div>
                    <div className="status__iqty">×{it.quantity}</div>
                    <div className="status__iprice">{rub(it.subtotal)}</div>
                  </li>
                );
              })}
            </ul>
            {order.note && (
              <div className="status__note">
                <Icon name="note" size={16} />
                <div>
                  <strong>Комментарий администратору · </strong>
                  {order.note}
                </div>
              </div>
            )}
          </div>

          <div className="status__actions">
            <button className="btn btn--ghost btn--xl" onClick={onClose}>
              Продолжить покупки
            </button>
            <button
              className="btn btn--danger btn--xl"
              disabled={!canCancel}
              onClick={onCancel}
              title={
                canCancel
                  ? ''
                  : 'Заказ уже подтверждён администратором — отмена недоступна'
              }
            >
              <Icon name="cancel" size={20} />
              <span>{canCancel ? 'Отменить заказ' : 'Отмена недоступна'}</span>
            </button>
          </div>

          {!canCancel && (
            <div className="status__hint">
              <Icon name="time" size={16} />
              <span>
                Отмена возможна только до подтверждения администратором.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
