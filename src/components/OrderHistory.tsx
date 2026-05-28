import { useState, useEffect } from 'react';
import type { ActiveSession, SessionHistoryOrder, Order } from '../types';
import { fetchOrdersBySession } from '../api/orders';
import { Icon } from './Icon';

interface OrderHistoryProps {
  session: ActiveSession;
  onClose: () => void;
}

function rub(n: number): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Br';
}

const RU_MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

function formatBelarusDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 3 * 3600_000);
  return `${d.getUTCDate()} ${RU_MONTHS[d.getUTCMonth()]}`;
}

function orderToHistoryRow(o: Order): SessionHistoryOrder {
  return {
    id: o.id,
    date: formatBelarusDate(o.createTime),
    total: o.totalAmount,
    items: o.orderItems.map((oi) => ({
      name: oi.productName,
      qty: oi.quantity,
      price: oi.unitPrice,
    })),
  };
}

function pluralVisit(n: number): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return 'визитов';
  if (b > 1 && b < 5)   return 'визита';
  if (b === 1)           return 'визит';
  return 'визитов';
}

function OrderRow({ order }: { order: SessionHistoryOrder }) {
  const [open, setOpen] = useState(false);
  const itemsCount = order.items.reduce((s, it) => s + it.qty, 0);

  return (
    <li className={`hrow ${open ? 'is-open' : ''}`}>
      <button className="hrow__head" onClick={() => setOpen((v) => !v)}>
        <div className="hrow__date">
          <span className="hrow__dot" />
          <div>
            <div className="hrow__when">{order.date}</div>
            <div className="hrow__id">№ {order.id}</div>
          </div>
        </div>
        <div className="hrow__items">
          {itemsCount} поз.
          {order.items.length > 0 && (
            <span className="hrow__preview">
              {order.items.slice(0, 3).map((it) => it.name).join(' · ')}
              {order.items.length > 3 && ` · +${order.items.length - 3}`}
            </span>
          )}
        </div>
        <div className="hrow__total">{rub(order.total)}</div>
        <div className="hrow__chev"><Icon name="chev" size={16} /></div>
      </button>

      {open && (
        <div className="hrow__body">
          <ul className="hrow__lines">
            {order.items.map((it, i) => (
              <li key={i} className="hrow__line">
                <span className="hrow__qty">×{it.qty}</span>
                <span className="hrow__name">{it.name}</span>
                <span className="hrow__price">{rub(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="hrow__foot">
            <span>Итого</span>
            <strong>{rub(order.total)}</strong>
          </div>
        </div>
      )}
    </li>
  );
}

export function OrderHistory({ session, onClose }: OrderHistoryProps) {
  const { name, history } = session;
  const [currentOrders, setCurrentOrders] = useState<SessionHistoryOrder[]>([]);

  useEffect(() => {
    fetchOrdersBySession(session.sessionId)
      .then((orders) => setCurrentOrders(orders.map(orderToHistoryRow)))
      .catch(() => {});
  }, [session.sessionId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allOrders = [...currentOrders, ...history];
  const totalSpent = currentOrders.reduce((s, o) => s + o.total, 0);
  const totalItems = currentOrders.reduce(
    (s, o) => s + o.items.reduce((n, it) => n + it.qty, 0),
    0
  );

  return (
    <div className="overlay">
      <div className="overlay__inner">
        <div className="overlay__head">
          <button className="iconbtn" onClick={onClose} aria-label="Назад">
            <Icon name="back" size={20} />
          </button>
          <div className="overlay__crumb">
            Меню заказа · <strong>История заказов</strong>
          </div>
          <div style={{ width: 44 }} />
        </div>

        <header className="history__hero">
          <div className="history__heroL">
            <div className="status__eyebrow">Сессия · {name}</div>
            <h1 className="status__title">История заказов</h1>
            <p className="history__lede">
              Заказы доступны для текущей сессии. После завершения сессии данные скрываются.
            </p>
          </div>
          <div className="history__stats">
            <div className="tile tile--accent">
              <div className="tile__value">{session.totalSessions}</div>
              <div className="tile__label">{pluralVisit(session.totalSessions)}</div>
            </div>
            <div className="tile">
              <div className="tile__value">{session.loyaltyPoints.toLocaleString('ru-RU')}</div>
              <div className="tile__label">Квадратики</div>
            </div>
            <div className="tile">
              <div className="tile__value">{totalItems}</div>
              <div className="tile__label">позиций всего</div>
            </div>
            <div className="tile">
              <div className="tile__value">{rub(totalSpent)}</div>
              <div className="tile__label">сумма</div>
            </div>
          </div>
        </header>

        {allOrders.length === 0 ? (
          <div className="empty">
            <div className="empty__mark">∅</div>
            <h3>Здесь пока пусто</h3>
            <p>У этой сессии ещё нет заказов.</p>
          </div>
        ) : (
          <>
            {currentOrders.length > 0 && (
              <>
                <div className="history__section-label">Текущая сессия</div>
                <ul className="history__list">
                  {currentOrders.map((o) => (
                    <OrderRow key={o.id} order={o} />
                  ))}
                </ul>
              </>
            )}
            {history.length > 0 && (
              <>
                <div className="history__section-label">Прошлые сессии</div>
                <ul className="history__list">
                  {history.map((o) => (
                    <OrderRow key={o.id} order={o} />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
