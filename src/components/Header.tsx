import type { KioskSettings, ActiveSession } from '../types';
import { Icon } from './Icon';
import { SessionChip } from './SessionChip';
import { rub } from '../utils/format';

interface HeaderProps {
  settings: KioskSettings;
  query: string;
  onQuery: (q: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  activeOrderCount: number;
  onOpenOrders: () => void;
  onLogoTap: () => void;
  session: ActiveSession | null;
  onOpenHistory: () => void;
}

export function Header({ settings, query, onQuery, cartCount, cartTotal, onOpenCart, activeOrderCount, onOpenOrders, onLogoTap, session, onOpenHistory }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          onClick={onLogoTap}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'default', lineHeight: 0 }}
          aria-label="logo"
          tabIndex={-1}
        >
          <img src="/logo.webp" alt="SquareStudio" className="brand__mark" />
        </button>
        <div className="brand__text">
          <div className="brand__name">SquareStudio</div>
          <div className="brand__tag">Barber · Меню заказа</div>
        </div>
      </div>

      <div className="topbar__search">
        <Icon name="search" size={20} />
        <input
          type="text"
          placeholder="Поиск по меню — кофе, борода, чизкейк…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        {query && (
          <button
            className="topbar__clear"
            onClick={() => onQuery('')}
            aria-label="Очистить"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <div className="topbar__right">
        {session && (
          <SessionChip
            session={session}
            onOpenHistory={onOpenHistory}
          />
        )}

        <div className="wifi" title="Wi-Fi для гостей">
          <Icon name="wifi" size={20} />
          <div className="wifi__text">
            <span className="wifi__ssid">{settings.wifiSsid}</span>
            <span className="wifi__pwd">
              пароль <code>{settings.wifiPassword}</code>
            </span>
          </div>
        </div>

        {activeOrderCount > 0 && (
          <button className="orderchip" onClick={onOpenOrders}>
            <span className="orderchip__dot" data-status="pending" />
            <div className="orderchip__text">
              <span>{activeOrderCount === 1 ? '1 заказ' : `${activeOrderCount} заказа`}</span>
              <span>Отслеживать</span>
            </div>
          </button>
        )}

        <button
          className={`cartbtn ${cartCount > 0 ? 'has-items' : ''}`}
          onClick={onOpenCart}
          aria-label="Корзина"
        >
          <Icon name="cart" size={22} />
          <span className="cartbtn__label">
            <span>Корзина</span>
            <span>{cartCount > 0 ? rub(cartTotal) : 'пусто'}</span>
          </span>
          {cartCount > 0 && <span className="cartbtn__badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}
