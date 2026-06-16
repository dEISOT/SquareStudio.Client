import { useState } from 'react';
import type { Order, Product } from '../types';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { rub } from '../utils/format';

interface Props {
  orders: Order[];
  productsById: Record<number, Product>;
  initialViewingId?: number | null;
  onClose: () => void;
  onCancel: (orderId: number) => void;
}

const STATUS_LABEL: Record<Order['status'], string> = {
  Pending:    'Ожидает подтверждения',
  InProgress: 'Готовим',
  Done:       'Доставлено',
  Canceled:   'Отменён',
};

const STEPS: { key: Order['status']; label: string }[] = [
  { key: 'Pending',    label: 'Заказ принят' },
  { key: 'InProgress', label: 'Готовим' },
  { key: 'Done',       label: 'У вас' },
];

function dotStatus(status: Order['status']): string {
  switch (status) {
    case 'InProgress': return 'confirmed';
    case 'Done':       return 'delivered';
    default:           return 'pending';
  }
}

function OrderDetail({ order, productsById, onBack, onCancel, onContinue }: {
  order: Order;
  productsById: Record<number, Product>;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
}) {
  const activeIdx = STEPS.findIndex((s) => s.key === order.status);
  const canCancel = order.status === 'Pending';
  const itemCount = order.orderItems.reduce((s, it) => s + it.quantity, 0);

  const heroEyebrow = canCancel
    ? 'Ожидает подтверждения администратора'
    : order.status === 'InProgress'
    ? 'Принят. Готовим.'
    : order.status === 'Done'
    ? 'Доставлено к креслу'
    : 'Отменён';

  const heroTitle = canCancel
    ? 'Заказ передан администратору.'
    : order.status === 'InProgress'
    ? 'Мы уже готовим.'
    : order.status === 'Done'
    ? 'Приятного!'
    : 'Заказ отменён.';

  return (
    <>
      <header className="overlay__head">
        <button className="iconbtn iconbtn--ghost" onClick={onBack} aria-label="Назад">
          <Icon name="back" size={20} />
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
            <div><span>Кресло</span><strong>{order.workStationName}</strong></div>
            <div><span>Позиций</span><strong>{itemCount}</strong></div>
            <div><span>К оплате</span><strong>{rub(order.totalAmount)}</strong></div>
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
              const pr = it.productId != null ? productsById[it.productId] : undefined;
              return (
                <li key={it.id}>
                  {pr
                    ? <PhotoSlot item={pr} size="line" />
                    : <div className="photo photo--line photo--placeholder" style={{ background: '#e5e7eb' }} />
                  }
                  <div>
                    <div className="status__iname">{it.productName}</div>
                    {it.size && <div className="status__isub">{it.size}</div>}
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
              <div><strong>Комментарий · </strong>{order.note}</div>
            </div>
          )}
        </div>

        <div className="status__actions">
          <button className="btn btn--ghost btn--xl" onClick={onContinue}>
            Продолжить покупки
          </button>
          <button
            className="btn btn--danger btn--xl"
            disabled={!canCancel}
            onClick={onCancel}
            title={canCancel ? '' : 'Заказ уже подтверждён — отмена недоступна'}
          >
            <Icon name="cancel" size={20} />
            <span>{canCancel ? 'Отменить заказ' : 'Отмена недоступна'}</span>
          </button>
        </div>

        {!canCancel && order.status !== 'Done' && order.status !== 'Canceled' && (
          <div className="status__hint">
            <Icon name="time" size={16} />
            <span>Отмена возможна только до подтверждения администратором.</span>
          </div>
        )}
      </div>
    </>
  );
}

export function OrdersOverlay({ orders, productsById, initialViewingId, onClose, onCancel }: Props) {
  const [viewingId, setViewingId] = useState<number | null>(initialViewingId ?? null);

  const viewing = viewingId != null ? (orders.find((o) => o.id === viewingId) ?? null) : null;

  const handleCancel = (orderId: number) => {
    onCancel(orderId);
    setViewingId(null);
  };

  return (
    <div className="overlay" role="dialog" aria-label="Мои заказы">
      <div className="overlay__inner">
        {viewing ? (
          <OrderDetail
            order={viewing}
            productsById={productsById}
            onBack={() => setViewingId(null)}
            onCancel={() => handleCancel(viewing.id)}
            onContinue={onClose}
          />
        ) : (
          <>
            <header className="overlay__head">
              <button className="iconbtn iconbtn--ghost" onClick={onClose} aria-label="Закрыть">
                <Icon name="close" size={22} />
              </button>
              <div className="overlay__crumb"><strong>Мои заказы</strong></div>
              <div style={{ width: 44 }} />
            </header>

            <div className="olist">
              {orders.map((o) => (
                <button key={o.id} className="ocard" onClick={() => setViewingId(o.id)}>
                  <span className="orderchip__dot" data-status={dotStatus(o.status)} />
                  <div className="ocard__body">
                    <div className="ocard__top">
                      <span className="ocard__num">Заказ № {o.id}</span>
                      <span className="ocard__status">{STATUS_LABEL[o.status]}</span>
                    </div>
                    <div className="ocard__items">
                      {o.orderItems.slice(0, 3).map((it) => it.productName).join(' · ')}
                      {o.orderItems.length > 3 && ` · +${o.orderItems.length - 3}`}
                    </div>
                  </div>
                  <span className="ocard__total">{rub(o.totalAmount)}</span>
                  <Icon name="chev" size={18} style={{ opacity: 0.35, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
