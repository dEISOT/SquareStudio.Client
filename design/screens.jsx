// Screens: product detail modal, cart drawer, checkout, order status, idle slideshow.

const { useState: useS2, useEffect: useE2, useMemo: useM2, useRef: useR2 } = React;

// ── Product detail modal ──────────────────────────────────────────────────────
function ProductModal({ product, onClose, qtyInCart, onAdd, onInc, onDec, categoryName }) {
  if (!product) return null;
  return (
    <Modal open onClose={onClose} size="lg" label={product.name}>
      <div className="pdp">
        <PhotoSlot product={product} size="pdp"/>
        <div className="pdp__body">
          <div className="pdp__cat">{categoryName}</div>
          <h2 className="pdp__name">{product.name}</h2>
          {product.sub && <div className="pdp__sub">{product.sub}</div>}
          <p className="pdp__desc">{product.desc}</p>
          <div className="pdp__price">{rub(product.price)}</div>
          <div className="pdp__cta">
            {qtyInCart > 0 ? (
              <div className="qty qty--lg">
                <button className="qty__btn" onClick={onDec} aria-label="Убрать одну">
                  <Icon name="minus" size={22}/>
                </button>
                <span className="qty__n">{qtyInCart}</span>
                <button className="qty__btn" onClick={onInc} aria-label="Добавить одну">
                  <Icon name="plus" size={22}/>
                </button>
              </div>
            ) : (
              <button className="btn btn--primary btn--lg" onClick={onAdd}>
                <Icon name="plus" size={20}/>
                <span>Добавить в корзину</span>
              </button>
            )}
            <button className="btn btn--ghost btn--lg" onClick={onClose}>Закрыть</button>
          </div>
        </div>
        <button className="pdp__close" onClick={onClose} aria-label="Закрыть">
          <Icon name="close" size={22}/>
        </button>
      </div>
    </Modal>
  );
}
window.ProductModal = ProductModal;

// ── Cart drawer (right side) ──────────────────────────────────────────────────
function CartDrawer({ open, items, productsById, onClose, onInc, onDec, onRemove, onCheckout }) {
  const total = items.reduce((s, it) => s + it.qty * productsById[it.id].price, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);

  useE2(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
          <button className="iconbtn" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={22}/></button>
        </header>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <div className="drawer__empty-mark">∅</div>
            <h3>Корзина пуста</h3>
            <p>Добавьте напитки, десерты или продукты для ухода — администратор принесёт всё к вашему креслу.</p>
            <button className="btn btn--primary btn--lg" onClick={onClose}>Перейти к меню</button>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {items.map((it) => {
                const pr = productsById[it.id];
                return (
                  <li key={it.id} className="line">
                    <PhotoSlot product={pr} size="line"/>
                    <div className="line__body">
                      <div className="line__top">
                        <div>
                          <div className="line__name">{pr.name}</div>
                          {pr.sub && <div className="line__sub">{pr.sub}</div>}
                        </div>
                        <button className="line__x" onClick={() => onRemove(it.id)} aria-label="Удалить">
                          <Icon name="close" size={16}/>
                        </button>
                      </div>
                      <div className="line__bot">
                        <div className="qty qty--sm">
                          <button className="qty__btn" onClick={() => onDec(it.id)}><Icon name="minus" size={16}/></button>
                          <span className="qty__n">{it.qty}</span>
                          <button className="qty__btn" onClick={() => onInc(it.id)}><Icon name="plus" size={16}/></button>
                        </div>
                        <div className="line__price">{rub(pr.price * it.qty)}</div>
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
                <Icon name="note" size={16}/>
                <span>Оплата — на стойке после стрижки.</span>
              </div>
              <button className="btn btn--primary btn--xl" onClick={onCheckout}>
                <span>Оформить заказ</span>
                <Icon name="arrow" size={20}/>
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
window.CartDrawer = CartDrawer;

// ── Checkout overlay ──────────────────────────────────────────────────────────
function Checkout({ open, items, productsById, onCancel, onSubmit }) {
  const [name, setName] = useS2('');
  const [ws, setWs] = useS2('');
  const [note, setNote] = useS2('');
  const [touched, setTouched] = useS2(false);

  useE2(() => {
    if (!open) { setName(''); setWs(''); setNote(''); setTouched(false); }
  }, [open]);

  if (!open) return null;
  const total = items.reduce((s, it) => s + it.qty * productsById[it.id].price, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);
  const valid = name.trim().length >= 2 && !!ws;

  return (
    <div className="overlay" role="dialog" aria-label="Оформление заказа">
      <div className="overlay__inner overlay__inner--split">
        <header className="overlay__head">
          <button className="iconbtn iconbtn--ghost" onClick={onCancel} aria-label="Назад"><Icon name="back" size={22}/></button>
          <div className="overlay__crumb">Корзина &nbsp;·&nbsp; <strong>Оформление</strong></div>
          <div style={{ width: 44 }}/>
        </header>

        <div className="checkout">
          <section className="checkout__form">
            <h1 className="checkout__title">Подтвердите заказ</h1>
            <p className="checkout__lede">Администратор принесёт всё к вашему креслу и добавит к счёту на стрижку.</p>

            <label className="field">
              <span className="field__label">Имя <em>обязательно</em></span>
              <input
                className="field__input"
                placeholder="Как к вам обращаться?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
              />
              {touched && name.trim().length < 2 && <span className="field__err">Введите имя</span>}
            </label>

            <label className="field">
              <span className="field__label"><Icon name="chair" size={16}/> Рабочее место <em>обязательно</em></span>
              <div className="select">
                <select
                  className="field__input"
                  value={ws}
                  onChange={(e) => setWs(e.target.value)}
                  onBlur={() => setTouched(true)}
                >
                  <option value="">Выберите кресло — барбер подскажет номер</option>
                  {window.WORKSTATIONS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <Icon name="chev" size={16} style={{ transform: 'rotate(90deg)' }}/>
              </div>
              {touched && !ws && <span className="field__err">Выберите рабочее место</span>}
            </label>

            <label className="field">
              <span className="field__label"><Icon name="note" size={16}/> Комментарий администратору</span>
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
                  const pr = productsById[it.id];
                  return (
                    <li key={it.id} className="summary__line">
                      <span className="summary__qty">{it.qty}×</span>
                      <span className="summary__name">{pr.name}</span>
                      <span className="summary__price">{rub(pr.price * it.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="summary__divider"/>
              <div className="summary__row"><span>Позиций</span><span>{count}</span></div>
              <div className="summary__row summary__row--total">
                <span>К оплате на стойке</span>
                <span className="summary__total">{rub(total)}</span>
              </div>
              <button
                className="btn btn--primary btn--xl btn--block"
                disabled={!valid}
                onClick={() => valid ? onSubmit({ name: name.trim(), workstation: ws, note: note.trim() }) : setTouched(true)}
              >
                <Icon name="check" size={20}/>
                <span>Подтвердить заказ</span>
              </button>
              <button className="btn btn--ghost btn--block" onClick={onCancel}>Вернуться в корзину</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
window.Checkout = Checkout;

// ── Order status overlay ──────────────────────────────────────────────────────
function OrderStatus({ order, productsById, onClose, onCancel }) {
  if (!order) return null;
  const total = order.items.reduce((s, it) => s + it.qty * productsById[it.id].price, 0);
  const wsName = (window.WORKSTATIONS.find((w) => w.id === order.workstation) || {}).name || '—';
  const canCancel = order.status === 'pending';
  const steps = [
    { key: 'pending',   label: 'Заказ принят' },
    { key: 'confirmed', label: 'Готовим' },
    { key: 'delivered', label: 'У вас' },
  ];
  const activeIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="overlay" role="dialog" aria-label="Статус заказа">
      <div className="overlay__inner">
        <header className="overlay__head">
          <button className="iconbtn iconbtn--ghost" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={22}/></button>
          <div className="overlay__crumb">Заказ № <strong>{order.number}</strong></div>
          <div style={{ width: 44 }}/>
        </header>

        <div className="status">
          <div className="status__hero">
            <div className="status__eyebrow">{canCancel ? 'Ожидает подтверждения администратора' : (order.status === 'confirmed' ? 'Принят. Готовим.' : 'Доставлено к креслу')}</div>
            <h1 className="status__title">
              Спасибо, {order.name}.<br/>
              {canCancel ? 'Заказ передан администратору.' : (order.status === 'confirmed' ? 'Мы уже готовим.' : 'Приятного!')}
            </h1>
            <div className="status__meta">
              <div><span>Кресло</span><strong>{wsName}</strong></div>
              <div><span>Позиций</span><strong>{order.items.reduce((s, it) => s + it.qty, 0)}</strong></div>
              <div><span>К оплате</span><strong>{rub(total)}</strong></div>
              <div><span>Очередь</span><strong>{order.queuePos === 0 ? 'Вы следующий' : `${order.queuePos} перед вами`}</strong></div>
            </div>
          </div>

          <ol className="track">
            {steps.map((s, i) => (
              <li key={s.key} className={`track__step ${i <= activeIdx ? 'is-active' : ''} ${i === activeIdx ? 'is-current' : ''}`}>
                <div className="track__dot">{i < activeIdx ? <Icon name="check" size={16}/> : i + 1}</div>
                <div className="track__label">{s.label}</div>
              </li>
            ))}
          </ol>

          <div className="status__items">
            <h3>Состав заказа</h3>
            <ul>
              {order.items.map((it) => {
                const pr = productsById[it.id];
                return (
                  <li key={it.id}>
                    <PhotoSlot product={pr} size="line"/>
                    <div>
                      <div className="status__iname">{pr.name}</div>
                      {pr.sub && <div className="status__isub">{pr.sub}</div>}
                    </div>
                    <div className="status__iqty">×{it.qty}</div>
                    <div className="status__iprice">{rub(pr.price * it.qty)}</div>
                  </li>
                );
              })}
            </ul>
            {order.note && (
              <div className="status__note">
                <Icon name="note" size={16}/>
                <div><strong>Комментарий администратору · </strong>{order.note}</div>
              </div>
            )}
          </div>

          <div className="status__actions">
            <button className="btn btn--ghost btn--xl" onClick={onClose}>Продолжить покупки</button>
            <button
              className="btn btn--danger btn--xl"
              disabled={!canCancel}
              onClick={onCancel}
              title={canCancel ? '' : 'Заказ уже подтверждён администратором — отмена недоступна'}
            >
              <Icon name="cancel" size={20}/>
              <span>{canCancel ? 'Отменить заказ' : 'Отмена недоступна'}</span>
            </button>
          </div>
          {!canCancel && (
            <div className="status__hint">
              <Icon name="time" size={16}/>
              <span>Отмена возможна только до подтверждения администратором.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.OrderStatus = OrderStatus;

// ── Idle ad slideshow ────────────────────────────────────────────────────────
function IdleSlideshow({ onWake, interval = 6000 }) {
  const slides = window.AD_SLIDES;
  const [i, setI] = useS2(0);
  useE2(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [interval, slides.length]);

  const s = slides[i];
  return (
    <div className="idle" onClick={onWake} role="button" tabIndex={0} aria-label="Коснитесь, чтобы продолжить">
      {slides.map((sl, idx) => (
        <div
          key={idx}
          className={`idle__slide ${idx === i ? 'is-current' : ''}`}
          style={{ background: sl.bg, color: sl.fg }}
        >
          <div className="idle__pad">
            <div className="idle__topbar">
              <img src="assets/logo.webp" alt="" className="idle__logo"/>
              <span className="idle__brand" style={{ color: sl.fg }}>SquareStudio</span>
            </div>
            <div className="idle__center">
              <div className="idle__eyebrow" style={{ color: sl.fg, opacity: 0.7 }}>{sl.eyebrow}</div>
              <h1 className="idle__title">{sl.title.split('\n').map((l, k) => <span key={k}>{l}<br/></span>)}</h1>
              <p className="idle__body">{sl.body}</p>
              <div className="idle__cta">{sl.cta}</div>
            </div>
            <div className="idle__bottom">
              <div className="idle__hint">Коснитесь экрана, чтобы продолжить →</div>
              <div className="idle__dots">
                {slides.map((_, k) => <span key={k} className={k === i ? 'is-current' : ''}/>)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
window.IdleSlideshow = IdleSlideshow;

// ── Session greeting (socket-triggered) ──────────────────────────────────────
// Fullscreen welcome card. Triggered by the backend when a new session opens
// for a guest — see `window.showGreeting(name)` / `postMessage({type:'greeting',name})`
// wired up in app.jsx. Tap anywhere to dismiss.
function Greeting({ name, onDismiss }) {
  const [stamp] = useS2(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  // Greeting suited to the time of day (Russian).
  const partOfDay = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12)  return 'Доброе утро';
    if (h >= 12 && h < 17) return 'Добрый день';
    if (h >= 17 && h < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  })();

  // Keyboard dismiss (Enter / Space / Esc) in addition to tap.
  useE2(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const display = (name || '').trim() || 'Гость';

  return (
    <div className="greet" onClick={onDismiss} role="dialog" aria-label="Приветствие">
      <div className="greet__grain" aria-hidden="true"/>
      <div className="greet__pad">
        <div className="greet__top">
          <img src="assets/logo.webp" alt="" className="greet__logo"/>
          <div className="greet__brand">
            <div className="greet__brandname">SquareStudio</div>
            <div className="greet__brandtag">Barber</div>
          </div>
          <div className="greet__stamp">
            <span className="greet__dot"/>
            <span>СЕССИЯ · {stamp}</span>
          </div>
        </div>

        <div className="greet__center">
          <div className="greet__eyebrow">{partOfDay},</div>
          <h1 className="greet__name">{display}</h1>
          <p className="greet__body">
            Рады видеть вас снова. Меню заказа уже готово —
            выберите кофе, закуски или назначьте уход в кресле.
          </p>
        </div>

        <div className="greet__bottom">
          <div className="greet__hint">
            <span className="greet__pulse"/>
            Коснитесь экрана, чтобы открыть меню
          </div>
          <div className="greet__mono">welcome.session.open</div>
        </div>
      </div>
    </div>
  );
}
window.Greeting = Greeting;

// ── Order history (per-session) ──────────────────────────────────────────────
// Overlay screen showing the guest's previous orders. Driven by `session.history`
// which is set by the backend when the greeting is shown.
function OrderHistory({ session, onClose }) {
  const { name, history = [] } = session;
  const [openId, setOpenId] = useS2(null);

  useE2(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const totalSpent = history.reduce((s, o) => s + (o.total || 0), 0);
  const totalItems = history.reduce(
    (s, o) => s + (Array.isArray(o.items) ? o.items.reduce((n, it) => n + (it.qty || 1), 0) : 0),
    0
  );

  return (
    <div className="overlay">
      <div className="overlay__inner">
        <div className="overlay__head">
          <button className="iconbtn" onClick={onClose} aria-label="Назад">
            <Icon name="back" size={20}/>
          </button>
          <div className="overlay__crumb">
            Меню заказа · <strong>История заказов</strong>
          </div>
          <div style={{ width: 44 }}/>
        </div>

        <header className="history__hero">
          <div className="history__heroL">
            <div className="status__eyebrow">Сессия · {name}</div>
            <h1 className="status__title">Прошлые заказы</h1>
            <p className="history__lede">
              Заказы доступны для текущей сессии. После завершения сессии данные скрываются.
            </p>
          </div>
          <div className="history__stats">
            <div className="tile tile--accent">
              <div className="tile__value">{history.length}</div>
              <div className="tile__label">{window.pluralVisit(history.length)}</div>
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

        {history.length === 0 ? (
          <div className="empty">
            <div className="empty__mark">∅</div>
            <h3>Здесь пока пусто</h3>
            <p>У этой сессии ещё нет завершённых заказов.</p>
          </div>
        ) : (
          <ul className="history__list">
            {history.map((o) => {
              const id = o.id || o.date;
              const isOpen = openId === id;
              const itemsCount = Array.isArray(o.items)
                ? o.items.reduce((n, it) => n + (it.qty || 1), 0) : 0;
              return (
                <li key={id} className={`hrow ${isOpen ? 'is-open' : ''}`}>
                  <button
                    className="hrow__head"
                    onClick={() => setOpenId(isOpen ? null : id)}
                  >
                    <div className="hrow__date">
                      <span className="hrow__dot"/>
                      <div>
                        <div className="hrow__when">{o.date}</div>
                        {o.id && <div className="hrow__id">№ {o.id}</div>}
                      </div>
                    </div>
                    <div className="hrow__items">
                      {itemsCount} {window.pluralVisit ? '' : ''}
                      {Array.isArray(o.items) && (
                        <span className="hrow__preview">
                          {o.items.slice(0, 3).map((it) => it.name).join(' · ')}
                          {o.items.length > 3 && ` · +${o.items.length - 3}`}
                        </span>
                      )}
                    </div>
                    <div className="hrow__total">{rub(o.total || 0)}</div>
                    <div className="hrow__chev"><Icon name="chev" size={16}/></div>
                  </button>

                  {isOpen && Array.isArray(o.items) && (
                    <div className="hrow__body">
                      <ul className="hrow__lines">
                        {o.items.map((it, i) => (
                          <li key={i} className="hrow__line">
                            <span className="hrow__qty">×{it.qty || 1}</span>
                            <span className="hrow__name">{it.name}</span>
                            <span className="hrow__price">{rub((it.price || 0) * (it.qty || 1))}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="hrow__foot">
                        <span>Итого</span>
                        <strong>{rub(o.total || 0)}</strong>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
window.OrderHistory = OrderHistory;
