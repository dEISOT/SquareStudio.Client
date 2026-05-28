import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Category, Product, Workstation, CartItem, Order, KioskSettings, Ad, ActiveSession } from './types';
import { fetchCategories } from './api/categories';
import { fetchPublishedProducts } from './api/products';
import { fetchWorkstations } from './api/workstations';
import { createOrder, fetchOrder } from './api/orders';
import { fetchKioskSettings } from './api/settings';
import { fetchPublishedAds } from './api/ads';
import { fetchActiveSession } from './api/sessions';
import { useIdle } from './hooks/useIdle';
import { useToast } from './hooks/useToast';
import { useSignalR } from './hooks/useSignalR';
import type { SessionGreeting } from './hooks/useSignalR';
import { Header } from './components/Header';
import { CategoryRail } from './components/CategoryRail';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Checkout } from './components/Checkout';
import { OrderStatus } from './components/OrderStatus';
import { IdleSlideshow } from './components/IdleSlideshow';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import { Icon } from './components/Icon';
import { SessionGreetingOverlay } from './components/SessionGreeting';
import { OrderHistory } from './components/OrderHistory';
import { WorkstationSelector } from './components/WorkstationSelector';
import { rub } from './utils/format';

const DEFAULT_SETTINGS: KioskSettings = {
  idleTimeoutSec: Number(import.meta.env.VITE_IDLE_TIMEOUT_SEC) || 180,
  wifiSsid: 'SquareStudio_Guest',
  wifiPassword: 'haircut2026',
};

export default function App() {
  // ── Data ───────────────────────────────────────────────────────────────────
  const [categories, setCategories]     = useState<Category[]>([]);
  const [products, setProducts]         = useState<Product[]>([]);
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [settings, setSettings]         = useState<KioskSettings>(DEFAULT_SETTINGS);
  const [ads, setAds]                   = useState<Ad[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCategories().catch(() => [] as Category[]),
      fetchPublishedProducts().catch(() => [] as Product[]),
      fetchWorkstations().catch(() => [] as Workstation[]),
      fetchKioskSettings().catch(() => null),
      fetchPublishedAds().catch(() => [] as Ad[]),
    ]).then(([cats, prods, wss, s, adList]) => {
      setCategories(cats);
      setProducts(prods);
      setWorkstations(wss);
      if (s) setSettings(s);
      setAds(adList);
      setLoading(false);
    });
  }, []);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeCat, setActiveCat]       = useState<number | 'all'>('all');
  const [query, setQuery]               = useState('');
  const [openProduct, setOpenProduct]   = useState<Product | null>(null);
  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [statusOpen, setStatusOpen]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  // ── Cart ───────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  const productsById = useMemo<Record<number, Product>>(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const { toast, flash } = useToast();

  const addToCart = useCallback((id: number, size?: string, qty = 1) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.productId === id && x.selectedSize === size);
      if (i === -1) return [...c, { productId: id, qty, selectedSize: size }];
      const copy = [...c];
      copy[i] = { ...copy[i], qty: copy[i].qty + qty };
      return copy;
    });
    flash('Добавлено в корзину');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const incCart = useCallback((id: number, size?: string) =>
    setCart((c) =>
      c.map((x) => x.productId === id && x.selectedSize === size
        ? { ...x, qty: x.qty + 1 }
        : x
      )
    ), []);

  const decCart = useCallback((id: number, size?: string) =>
    setCart((c) =>
      c.flatMap((x) => x.productId === id && x.selectedSize === size
        ? x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []
        : [x]
      )
    ), []);

  const removeFromCart = useCallback((id: number, size?: string) =>
    setCart((c) => c.filter((x) => !(x.productId === id && x.selectedSize === size))), []);

  const qtyOf = (id: number, size?: string) =>
    cart.find((x) => x.productId === id && x.selectedSize === size)?.qty ?? 0;

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce(
    (s, x) => s + x.qty * (productsById[x.productId]?.price ?? 0), 0
  );

  // ── Filtered grid ──────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCat !== 'all' && p.categoryId !== activeCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, activeCat, query]);

  const groupedByCat = useMemo(() => {
    if (activeCat !== 'all') return null;
    return categories
      .map((cat) => ({
        cat,
        items: visible.filter((p) => p.categoryId === cat.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [visible, activeCat, categories]);

  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = { all: products.length };
    for (const p of products) {
      m[String(p.categoryId)] = (m[String(p.categoryId)] ?? 0) + 1;
    }
    return m;
  }, [products]);

  // ── Workstation ────────────────────────────────────────────────────────────
  const [workstationId, setWorkstationId] = useState<number | null>(() => {
    const saved = localStorage.getItem('kiosk_workstation_id');
    return saved ? Number(saved) : null;
  });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const logoTaps = useRef<number[]>([]);
  const [greeting, setGreeting] = useState<SessionGreeting | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSelectWorkstation = useCallback((id: number) => {
    setWorkstationId(id);
    localStorage.setItem('kiosk_workstation_id', String(id));
  }, []);

  const handleLogoTap = useCallback(() => {
    const now = Date.now();
    const recent = [...logoTaps.current, now].filter((t) => now - t < 2000);
    if (recent.length >= 3) {
      logoTaps.current = [];
      setSelectorOpen(true);
    } else {
      logoTaps.current = recent;
    }
  }, []);

  // ── Idle ───────────────────────────────────────────────────────────────────
  const { idle, wake } = useIdle(settings.idleTimeoutSec);

  const endSession = useCallback(() => {
    setSession(null);
    setGreeting(null);
    setHistoryOpen(false);
  }, []);

  // ── Restore active session on load / workstation change ───────────────────
  useEffect(() => {
    if (loading || !workstationId || session) return;
    fetchActiveSession(workstationId)
      .then((g) => {
        if (g) setSession({ sessionId: g.sessionId, name: g.clientName, loyaltyPoints: g.loyaltyPoints, totalSessions: g.totalSessions, history: g.history });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, workstationId]);

  // ── SignalR (after idle so wake is in scope) ───────────────────────────────
  useSignalR(
    workstationId,
    (g) => {
      setGreeting(g);
      setSession({ sessionId: g.sessionId, name: g.clientName, loyaltyPoints: g.loyaltyPoints, totalSessions: g.totalSessions, history: g.history });
      wake();
    },
    endSession,
  );

  const handleWake = useCallback(() => {
    wake();
    setActiveCat('all');
    setQuery('');
  }, [wake]);

  // ── Order ──────────────────────────────────────────────────────────────────
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!statusOpen || !currentOrder) return;
    if (currentOrder.status === 'Done' || currentOrder.status === 'Canceled') return;
    const t = setInterval(() => {
      fetchOrder(currentOrder.id).then(setCurrentOrder).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusOpen, currentOrder?.id, currentOrder?.status]);

  const handleSubmitOrder = async (data: {
    name: string;
    workstationId: number;
    note: string;
  }) => {
    setSubmitting(true);
    try {
      const order = await createOrder({
        workStationId: data.workstationId,
        customer: data.name,
        note: data.note || undefined,
        sessionId: session?.sessionId ?? undefined,
        items: cart.map((it) => ({
          productId: it.productId,
          quantity: it.qty,
          size: it.selectedSize,
        })),
      });
      setCurrentOrder(order);
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setStatusOpen(true);
    } catch {
      flash('Ошибка при отправке заказа. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = () => {
    setCurrentOrder(null);
    setStatusOpen(false);
    flash('Заказ отменён');
  };

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? '';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-loading">
        <img src="/logo.webp" alt="SquareStudio" className="app-loading__logo" />
        <p>Загружаем меню…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        settings={settings}
        query={query}
        onQuery={setQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setCartOpen(true)}
        order={currentOrder}
        onOpenStatus={() => setStatusOpen(true)}
        onLogoTap={handleLogoTap}
        session={session}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <CategoryRail
        categories={categories}
        active={activeCat}
        onPick={(id) => { setActiveCat(id); setQuery(''); }}
        counts={categoryCounts}
      />

      <main className="page">
        {activeCat === 'all' ? (
          !groupedByCat || groupedByCat.length === 0 ? (
            <EmptyState query={query} onClear={() => setQuery('')} />
          ) : (
            groupedByCat.map((g) => (
              <section className="sect" key={g.cat.id}>
                <header className="sect__head">
                  <h2 className="sect__title">{g.cat.name}</h2>
                  <button
                    className="sect__more"
                    onClick={() => setActiveCat(g.cat.id)}
                  >
                    Все {g.items.length}{' '}
                    <Icon name="chev" size={14} />
                  </button>
                </header>
                <div className="grid">
                  {g.items.slice(0, 8).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      qtyInCart={(size) => qtyOf(p.id, size)}
                      onOpen={() => setOpenProduct(p)}
                      onAdd={(size) => addToCart(p.id, size)}
                      onInc={(size) => incCart(p.id, size)}
                      onDec={(size) => decCart(p.id, size)}
                    />
                  ))}
                </div>
              </section>
            ))
          )
        ) : (
          <section className="sect">
            <header className="sect__head">
              <h2 className="sect__title">{categoryName(activeCat as number)}</h2>
              <span className="sect__count">{visible.length} позиций</span>
            </header>
            {visible.length === 0 ? (
              <EmptyState query={query} onClear={() => setQuery('')} />
            ) : (
              <div className="grid">
                {visible.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qtyInCart={(size) => qtyOf(p.id, size)}
                    onOpen={() => setOpenProduct(p)}
                    onAdd={(size) => addToCart(p.id, size)}
                    onInc={(size) => incCart(p.id, size)}
                    onDec={(size) => decCart(p.id, size)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        <div className="footer-pad" />
      </main>

      {cartCount > 0 && !cartOpen && !checkoutOpen && !statusOpen && (
        <button className="cartbar" onClick={() => setCartOpen(true)}>
          <span className="cartbar__count">{cartCount}</span>
          <span className="cartbar__label">В корзине</span>
          <span className="cartbar__total">{rub(cartTotal)}</span>
          <span className="cartbar__cta">
            Открыть <Icon name="arrow" size={18} />
          </span>
        </button>
      )}

      <ProductModal
        product={openProduct}
        qtyInCart={(size) => openProduct ? qtyOf(openProduct.id, size) : 0}
        onAdd={(size) => openProduct && addToCart(openProduct.id, size)}
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
        workstations={workstations}
        onCancel={() => { setCheckoutOpen(false); setCartOpen(true); }}
        onSubmit={handleSubmitOrder}
        submitting={submitting}
        prefillName={session?.name}
        prefillWorkstationId={workstationId}
      />

      {statusOpen && currentOrder && (
        <OrderStatus
          order={currentOrder}
          productsById={productsById}
          onClose={() => setStatusOpen(false)}
          onCancel={handleCancelOrder}
        />
      )}

      {idle && <IdleSlideshow ads={ads} onWake={handleWake} />}

      {greeting && (
        <SessionGreetingOverlay
          greeting={greeting}
          onDismiss={() => setGreeting(null)}
        />
      )}

      {historyOpen && session && (
        <OrderHistory
          session={session}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      <WorkstationSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        workstations={workstations}
        currentId={workstationId}
        onSelect={handleSelectWorkstation}
      />

      <Toast message={toast} />
    </div>
  );
}
