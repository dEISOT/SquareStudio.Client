// Main app — composes header, category rail, product grid, and all overlays.
// Also owns: cart state, order state, idle-timer, and the Tweaks panel hooks.

const { useState: useSt, useEffect: useEf, useMemo: useMm, useRef: useRf, useCallback: useCb } = React;

// Defaults persisted in the file via EDITMODE markers — these are demo knobs only.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "idleTimeoutSec": 180,
  "demoIdleNow": false,
  "demoOrderConfirmed": false,
  "denseGrid": false,
  "device": "auto"
}/*EDITMODE-END*/;

const DEVICES = {
  'auto':       { label: 'Авто · во весь экран',         w: null, h: null,  short: 'AUTO' },
  'desktop':    { label: 'Десктоп · 1440×900',          w: 1440, h: 900,   short: 'DESKTOP' },
  'ipad-l':     { label: 'iPad ландшафт · 1180×820',       w: 1180, h: 820,   short: 'iPad LANDSCAPE' },
  'ipad-pro-l': { label: 'iPad Pro 12.9 ландш. · 1366×1024', w: 1366, h: 1024, short: 'iPad PRO 12.9 LANDSCAPE' },
  'ipad-p':     { label: 'iPad портрет · 820×1180',         w: 820,  h: 1180,  short: 'iPad PORTRAIT' },
  'iphone':     { label: 'iPhone · 390×844',                w: 390,  h: 844,   short: 'iPhone' },
};

// Default session data — shown until a real socket greeting arrives or the
// session is ended via the header's × button.
const DEFAULT_SESSION = {
  name: 'Алексей',
  points: 2480,
  tier: 'Silver',
  nextTier: 'Gold',
  toNext: 520,
  history: [
    { id: 'A-742', date: '12 марта', total: 890, items: [
      { name: 'Капучино',  qty: 2, price: 240 },
      { name: 'Чизкейк нью-йорк', qty: 1, price: 410 },
    ]},
    { id: 'A-689', date: '28 февраля', total: 1650, items: [
      { name: 'Стрижка классическая', qty: 1, price: 1200 },
      { name: 'Эспрессо', qty: 1, price: 150 },
      { name: 'Бритьё опасной бритвой', qty: 1, price: 300 },
    ]},
    { id: 'A-651', date: '15 февраля', total: 1240, items: [
      { name: 'Капучино', qty: 1, price: 240 },
      { name: 'Стрижка детская', qty: 1, price: 800 },
      { name: 'Тоник для бороды', qty: 1, price: 200 },
    ]},
    { id: 'A-602', date: '02 февраля', total: 720, items: [
      { name: 'Двойной эспрессо', qty: 1, price: 290 },
      { name: 'Круассан миндальный', qty: 2, price: 215 },
    ]},
  ],
};

function App() {
  const [t, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  // ── State ──────────────────────────────────────────────────────────────────
  const productsById = useMm(() => Object.fromEntries(window.PRODUCTS.map(p => [p.id, p])), []);
  const [activeCat, setActiveCat] = useSt('all');
  const [query, setQuery] = useSt('');
  const [cart, setCart] = useSt([]);                       // [{id, qty}]
  const [cartOpen, setCartOpen] = useSt(false);
  const [openProduct, setOpenProduct] = useSt(null);       // product obj
  const [checkoutOpen, setCheckoutOpen] = useSt(false);
  const [order, setOrder] = useSt(null);                   // current order
  const [statusOpen, setStatusOpen] = useSt(false);
  const [toast, setToast] = useSt(null);
  const [idle, setIdle] = useSt(false);
  const [greetName, setGreetName] = useSt(null);   // null = hidden; string = visible w/ name
  const [session, setSession] = useSt(DEFAULT_SESSION); // { name, points, tier, nextTier, toNext, history: [...] }
  const [historyOpen, setHistoryOpen] = useSt(false);

  // ── Greeting + session (socket-triggered) ───────────────────────────────────────
  // The backend calls one of these when a guest's session opens. Two payload shapes:
  //   window.showGreeting('Алексей')            // name only — no loyalty data
  //   window.showGreeting({                            // full session payload
  //     name: 'Алексей',
  //     points: 2480, tier: 'Silver', nextTier: 'Gold', toNext: 520,
  //     history: [{ id, date, total, items: [{name, qty, price}] }, ...]
  //   })
  //   window.endSession()                              // clears session + history chip
  //   window.parent?.postMessage({ type: 'greeting', … }, '*')
  //   window.parent?.postMessage({ type: 'session:end' }, '*')
  //
  // The greeting overlay is just a welcome card. The loyalty tiles and the order-history
  // screen live on the main page and are gated by `session` — so each guest's data only
  // appears for the duration of THEIR session and is replaced when the next one opens.
  const applyGreeting = useCb((payload) => {
    if (payload == null) { setGreetName(null); return; }
    if (typeof payload === 'string') {
      const name = payload.trim() || 'Гость';
      setGreetName(name);
      // String form means "new guest, no loyalty data" — start a bare session
      // with just the name so the header still personalizes.
      setSession({ name });
      return;
    }
    const { name: rawName, ...rest } = payload;
    const name = String(rawName ?? '').trim() || 'Гость';
    setGreetName(name);
    setSession({ name, ...rest });
  }, []);

  const endSession = useCb(() => {
    setGreetName(null);
    setSession(null);
    setHistoryOpen(false);
  }, []);

  useEf(() => {
    window.showGreeting = applyGreeting;
    window.hideGreeting = () => setGreetName(null);
    window.endSession = endSession;
    const onMsg = (ev) => {
      const d = ev?.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'greeting' || d.type === 'session:greet') {
        const { type, ...payload } = d;
        applyGreeting(payload);
      }
      if (d.type === 'greeting:hide') setGreetName(null);
      if (d.type === 'session:end') endSession();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [applyGreeting, endSession]);

  // While the greeting is up, freeze the idle countdown so it doesn't fire underneath.
  // ── Idle timer ─────────────────────────────────────────────────────────────
  const idleRef = useRf();
  const resetIdle = useCb(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setIdle(true), (t.idleTimeoutSec || 180) * 1000);
  }, [t.idleTimeoutSec]);

  useEf(() => {
    const onActivity = () => { if (!idle) resetIdle(); };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
      window.addEventListener(ev, onActivity, { passive: true }));
    resetIdle();
    return () => {
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
        window.removeEventListener(ev, onActivity));
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [idle, resetIdle]);

  // Tweak: trigger idle now.
  useEf(() => {
    if (t.demoIdleNow) {
      setIdle(true);
      setTweak('demoIdleNow', false);
    }
  }, [t.demoIdleNow]);

  // Tweak: simulate "administrator confirmed" — disables cancel.
  useEf(() => {
    if (!order) return;
    setOrder((o) => o ? { ...o, status: t.demoOrderConfirmed ? 'confirmed' : 'pending' } : o);
  }, [t.demoOrderConfirmed]);

  // ── Cart ops ───────────────────────────────────────────────────────────────
  const addToCart = (id, n = 1) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.id === id);
      if (i === -1) return [...c, { id, qty: n }];
      const copy = c.slice();
      copy[i] = { ...copy[i], qty: copy[i].qty + n };
      return copy;
    });
    flash('Добавлено в корзину');
  };
  const incCart = (id) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x));
  const decCart = (id) => setCart((c) => c.flatMap((x) => x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const qtyOf = (id) => (cart.find((x) => x.id === id) || {}).qty || 0;
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce((s, x) => s + x.qty * productsById[x.id].price, 0);

  // ── Filtered grid ──────────────────────────────────────────────────────────
  const visible = useMm(() => {
    const q = query.trim().toLowerCase();
    return window.PRODUCTS.filter((p) => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    });
  }, [activeCat, query]);

  const groupedByCat = useMm(() => {
    if (activeCat !== 'all') return null;
    return window.CATEGORIES.map((c) => ({
      cat: c,
      items: visible.filter((p) => p.category === c.id),
    })).filter((g) => g.items.length > 0);
  }, [visible, activeCat]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toastT = useRf();
  function flash(msg) {
    setToast(msg);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 1700);
  }

  // ── Order ops ──────────────────────────────────────────────────────────────
  const submitOrder = ({ name, workstation, note }) => {
    const num = String(100 + Math.floor(Math.random() * 900));
    setOrder({
      number: num,
      name,
      workstation,
      note,
      items: cart,
      status: 'pending',
      queuePos: 2 + Math.floor(Math.random() * 3),
      createdAt: Date.now(),
    });
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setStatusOpen(true);
  };
  const cancelOrder = () => {
    setOrder(null);
    setStatusOpen(false);
    flash('Заказ отменён');
  };

  // ── Wake from idle ─────────────────────────────────────────────────────────
  const wake = () => {
    setIdle(false);
    setActiveCat('all');
    setQuery('');
    resetIdle();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const categoryName = (id) => (window.CATEGORIES.find((c) => c.id === id) || {}).name || '';

  const dev = DEVICES[t.device] || DEVICES.auto;
  const stageStyle = dev.w ? { '--dev-w': dev.w + 'px', '--dev-h': dev.h + 'px' } : {};

  return (
    <>
    <div className="stagewrap" data-device={t.device} style={stageStyle}>
      {t.device !== 'auto' && (
        <div className="devicelabel">
          <span className="devicelabel__dot"/>
          <strong>{dev.short}</strong>
          <span> · {dev.w}×{dev.h}</span>
        </div>
      )}
    <div className={`app ${t.denseGrid ? 'is-dense' : ''}`}>
      <Header
        wifi={window.WIFI}
        query={query}
        onQuery={setQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setCartOpen(true)}
        onOpenStatus={() => setStatusOpen(true)}
        order={order}
        session={session}
        onOpenHistory={() => setHistoryOpen(true)}
        onEndSession={endSession}
      />

      <CategoryRail
        active={activeCat}
        onPick={setActiveCat}
        counts={countsByCategory(window.PRODUCTS)}
      />

      <main className="page">
        {activeCat === 'all' ? (
          groupedByCat.length === 0 ? (
            <EmptyState query={query} onClear={() => setQuery('')}/>
          ) : (
            groupedByCat.map((g) => (
              <section className="sect" key={g.cat.id}>
                <header className="sect__head">
                  <h2 className="sect__title">{g.cat.name}</h2>
                  <button className="sect__more" onClick={() => setActiveCat(g.cat.id)}>
                    Все {g.items.length} <Icon name="chev" size={14}/>
                  </button>
                </header>
                <div className="grid">
                  {g.items.slice(0, 8).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      qtyInCart={qtyOf(p.id)}
                      onOpen={() => setOpenProduct(p)}
                      onAdd={() => addToCart(p.id)}
                      onInc={() => incCart(p.id)}
                      onDec={() => decCart(p.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )
        ) : (
          <section className="sect">
            <header className="sect__head">
              <h2 className="sect__title">{categoryName(activeCat)}</h2>
              <span className="sect__count">{visible.length} позиций</span>
            </header>
            {visible.length === 0 ? (
              <EmptyState query={query} onClear={() => setQuery('')}/>
            ) : (
              <div className="grid">
                {visible.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qtyInCart={qtyOf(p.id)}
                    onOpen={() => setOpenProduct(p)}
                    onAdd={() => addToCart(p.id)}
                    onInc={() => incCart(p.id)}
                    onDec={() => decCart(p.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        <div className="footer-pad"/>
      </main>

      {/* Floating cart bar — only when cart has items and drawer is closed */}
      {cartCount > 0 && !cartOpen && !checkoutOpen && !statusOpen && (
        <button className="cartbar" onClick={() => setCartOpen(true)}>
          <span className="cartbar__count">{cartCount}</span>
          <span className="cartbar__label">В корзине</span>
          <span className="cartbar__total">{rub(cartTotal)}</span>
          <span className="cartbar__cta">
            Открыть <Icon name="arrow" size={18}/>
          </span>
        </button>
      )}

      <ProductModal
        product={openProduct}
        categoryName={openProduct ? categoryName(openProduct.category) : ''}
        qtyInCart={openProduct ? qtyOf(openProduct.id) : 0}
        onAdd={() => { addToCart(openProduct.id); }}
        onInc={() => incCart(openProduct.id)}
        onDec={() => decCart(openProduct.id)}
        onClose={() => setOpenProduct(null)}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        productsById={productsById}
        onClose={() => setCartOpen(false)}
        onInc={incCart}
        onDec={decCart}
        onRemove={removeFromCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      <Checkout
        open={checkoutOpen}
        items={cart}
        productsById={productsById}
        onCancel={() => { setCheckoutOpen(false); setCartOpen(true); }}
        onSubmit={submitOrder}
      />

      {statusOpen && order && (
        <OrderStatus
          order={order}
          productsById={productsById}
          onClose={() => setStatusOpen(false)}
          onCancel={cancelOrder}
        />
      )}

      {idle && <IdleSlideshow onWake={wake}/>}

      {greetName !== null && (
        <window.Greeting
          name={greetName}
          onDismiss={() => { setGreetName(null); resetIdle(); }}
        />
      )}

      {historyOpen && session && (
        <window.OrderHistory
          session={session}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {toast && <div className="toast"><Icon name="check" size={16}/><span>{toast}</span></div>}

    </div>{/* /.app */}
    </div>{/* /.stagewrap */}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Демо-управление">
            <window.TweakButton
              label="Показать приветствие"
              onClick={() => applyGreeting(DEFAULT_SESSION)}
            />
            <window.TweakButton
              label="Завершить сессию"
              secondary
              onClick={endSession}
            />
            <window.TweakButton
              label="Запустить экран ожидания"
              secondary
              onClick={() => setTweak('demoIdleNow', true)}
            />
            <window.TweakToggle
              label="Администратор подтвердил заказ"
              value={t.demoOrderConfirmed}
              onChange={(v) => setTweak('demoOrderConfirmed', v)}
            />
            <window.TweakButton
              label="Открыть статус заказа"
              secondary
              onClick={() => { if (order) setStatusOpen(true); }}
            />
          </window.TweakSection>
          <window.TweakSection label="Превью устройства">
            <window.TweakSelect
              label="Размер экрана"
              value={t.device}
              options={Object.entries(DEVICES).map(([id, d]) => ({ value: id, label: d.label }))}
              onChange={(v) => setTweak('device', v)}
            />
          </window.TweakSection>
          <window.TweakSection label="Поведение">
            <window.TweakSlider
              label="Тайм-аут ожидания"
              min={10} max={300} step={5}
              unit=" сек"
              value={t.idleTimeoutSec}
              onChange={(v) => setTweak('idleTimeoutSec', v)}
            />
            <window.TweakToggle
              label="Плотная сетка"
              value={t.denseGrid}
              onChange={(v) => setTweak('denseGrid', v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
}

function countsByCategory(products) {
  const m = { all: products.length };
  for (const p of products) m[p.category] = (m[p.category] || 0) + 1;
  return m;
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ wifi, query, onQuery, cartCount, cartTotal, onOpenCart, order, onOpenStatus, session, onOpenHistory, onEndSession }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <img src="assets/logo.webp" alt="SquareStudio" className="brand__mark"/>
        <div className="brand__text">
          <div className="brand__name">SquareStudio</div>
          <div className="brand__tag">Barber · Меню заказа</div>
        </div>
      </div>

      <div className="topbar__search">
        <Icon name="search" size={20}/>
        <input
          type="text"
          placeholder="Поиск по меню — кофе, борода, чизкейк…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        {query && (
          <button className="topbar__clear" onClick={() => onQuery('')} aria-label="Очистить">
            <Icon name="close" size={16}/>
          </button>
        )}
      </div>

      <div className="topbar__right">
        {session && (
          <window.SessionChip
            session={session}
            onOpenHistory={onOpenHistory}
            onEnd={onEndSession}
          />
        )}
        <div className="wifi" title="Wi-Fi для гостей">
          <Icon name="wifi" size={20}/>
          <div className="wifi__text">
            <span className="wifi__ssid">{wifi.ssid}</span>
            <span className="wifi__pwd">пароль <code>{wifi.password}</code></span>
          </div>
        </div>

        {order && (
          <button className="orderchip" onClick={onOpenStatus}>
            <span className="orderchip__dot" data-status={order.status}/>
            <div className="orderchip__text">
              <span>Заказ № {order.number}</span>
              <span>{order.status === 'pending' ? 'Ожидает подтверждения' : (order.status === 'confirmed' ? 'Готовим' : 'У вас')}</span>
            </div>
          </button>
        )}

        <button className={`cartbtn ${cartCount > 0 ? 'has-items' : ''}`} onClick={onOpenCart} aria-label="Корзина">
          <Icon name="cart" size={22}/>
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

// ── Category rail (pills) ─────────────────────────────────────────────────────
function CategoryRail({ active, onPick, counts }) {
  const all = [{ id: 'all', name: 'Всё меню' }, ...window.CATEGORIES];
  return (
    <nav className="rail" aria-label="Категории">
      <div className="rail__inner">
        {all.map((c) => (
          <button
            key={c.id}
            className={`pill ${active === c.id ? 'is-active' : ''}`}
            onClick={() => onPick(c.id)}
          >
            <span>{c.name}</span>
            <span className="pill__count">{counts[c.id] || 0}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ query, onClear }) {
  return (
    <div className="empty">
      <div className="empty__mark">∅</div>
      <h3>{query ? `Ничего не нашли по «${query}»` : 'Здесь пока пусто'}</h3>
      <p>Попробуйте другой запрос или выберите категорию выше.</p>
      {query && <button className="btn btn--ghost" onClick={onClear}>Очистить поиск</button>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
