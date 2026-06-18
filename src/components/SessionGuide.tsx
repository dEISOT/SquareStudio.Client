import { useState } from 'react';

// ── layout constants ────────────────────────────────────────────────────────
const NAVY  = '#0d1f3c';
const SCALE = 0.629;
const VW    = 1024;   // virtual app width
const VH    = 680;    // virtual app height shown
const FW    = Math.round(VW * SCALE);   // 644 – preview frame visual width
const FH    = Math.round(VH * SCALE);   // 428 – preview frame visual height
const COL   = 150;    // callout column width
const GAP   = 16;     // gap between column and preview

// ── types ───────────────────────────────────────────────────────────────────
interface Callout {
  num: number;
  side: 'left' | 'right';
  top: number;   // visual px from top of preview frame (centered with translateY(-50%))
  text: string;
}

interface StepDef {
  title: string;
  sub: string;
  callouts: Callout[];
  Preview: () => React.ReactElement;
}

// ── shared preview primitives ───────────────────────────────────────────────
const rub = (n: number) =>
  n.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' Br';


function PTopbar() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64, background: '#fff',
      borderBottom: '1px solid #e2e8f0', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.webp" alt="" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: NAVY, letterSpacing: '-0.01em' }}>SquareStudio</div>
          <div style={{ fontSize: 9, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>BARBER · МЕНЮ ЗАКАЗА</div>
        </div>
      </div>
      <div style={{ flex: 1, maxWidth: 440, margin: '0 24px', height: 40, background: '#f8f9fc', borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
        <span style={{ fontSize: 14, color: '#94a3b8' }}>Поиск по меню — кофе, борода, чизкейк...</span>
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>SquareStudio_Guest</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>пароль</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Корзина</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>пусто</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PCategoryRail({ active = 0 }: { active?: number }) {
  const cats = ['Всё меню', 'Кофе', 'Сезонные напитки', 'Сэндвичи', 'Средства', 'Услуги'];
  return (
    <div style={{ background: '#f8f9fc', padding: '10px 32px', display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
      {cats.map((c, i) => (
        <div key={i} style={{
          padding: '8px 16px', borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: 'default',
          background: i === active ? NAVY : '#fff',
          color: i === active ? '#fff' : NAVY,
          border: `1.5px solid ${i === active ? NAVY : '#e2e8f0'}`,
        }}>{c}</div>
      ))}
    </div>
  );
}

// ── preview 1 – catalog + product card ──────────────────────────────────────
function Step1Preview() {
  const cards = [
    { name: 'Капучино',  desc: 'Кофе с молоком и плотной молочной пеной.', sizes: ['200 мл','300 мл','400 мл'], price: 7, hi: true },
    { name: 'Американо', desc: 'Эспрессо, разбавленный горячей водой.',    sizes: ['200 мл','300 мл'],          price: 6 },
    { name: 'Эспрессо',  desc: 'Крепкий концентрированный кофе.',           sizes: ['25 мл','50 мл'],            price: 5 },
  ];
  const prodW = VW - 32 * 2 - 350;
  return (
    <div style={{ width: VW, height: VH, background: '#f5f7fb', position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>
      <PTopbar />
      <PCategoryRail active={0} />
      {/* product grid */}
      <div style={{ padding: '20px 32px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Кофе</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, 1fr)`, gap: 14, width: prodW }}>
          {cards.map((p, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: `2px solid ${p.hi ? NAVY : '#e2e8f0'}`, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ height: 100, background: '#e5e7eb' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.desc}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {p.sizes.map(s => <span key={s} style={{ fontSize: 10, padding: '2px 7px', border: '1px solid #e2e8f0', borderRadius: 20, color: '#475569' }}>{s}</span>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{p.price} Br</span>
                  <div style={{ background: NAVY, color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600 }}>+ В корзину</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* product detail panel */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 350, height: '100%', background: '#fff', boxShadow: '-6px 0 32px rgba(13,31,60,0.13)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 220, background: '#e8eaef' }} />
        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NAVY }}>КОФЕ</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Капучино</div>
          <div style={{ fontSize: 13, color: '#475569' }}>Кофе с молоком и плотной молочной пеной.</div>
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>ВАРИАНТ</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['200 мл','300 мл','400 мл'].map((s, i) => (
                <div key={s} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${i === 0 ? NAVY : '#e2e8f0'}`, background: i === 0 ? NAVY : '#fff', color: i === 0 ? '#fff' : NAVY, fontSize: 12, fontWeight: 600, cursor: 'default' }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: NAVY, marginBottom: 8 }}>7 Br</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: NAVY, color: '#fff', borderRadius: 10, padding: '9px 0', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>+ В корзину</div>
              <div style={{ padding: '9px 14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#475569' }}>Закрыть</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── preview 2 – checkout form ────────────────────────────────────────────────
function Step2Preview() {
  return (
    <div style={{ width: VW, height: VH, background: '#f5f7fb', overflow: 'hidden', fontFamily: 'inherit' }}>
      {/* overlay header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <span style={{ fontSize: 14, color: '#64748b' }}>Корзина &nbsp;·&nbsp; <strong style={{ color: NAVY }}>Оформление</strong></span>
        <div style={{ width: 36 }} />
      </div>
      {/* main area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, padding: '24px 32px', height: VH - 57, overflow: 'hidden' }}>
        {/* form */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginBottom: 6 }}>Подтвердите заказ</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Администратор принесёт всё к вашему креслу и добавит к счёту на стрижку.</div>
          </div>
          {/* name */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Имя <span style={{ color: '#94a3b8', fontSize: 10 }}>ОБЯЗАТЕЛЬНО</span></div>
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: NAVY, fontWeight: 500, background: '#fafafa' }}>Никита</div>
          </div>
          {/* workstation */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Рабочее место <span style={{ color: '#94a3b8', fontSize: 10 }}>ОБЯЗАТЕЛЬНО</span></div>
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: NAVY, background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Рабочее место 1</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          {/* comment */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Комментарий администратору</div>
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#94a3b8', height: 90, background: '#fafafa', alignItems: 'flex-start' }}>
              Например: кофе без сахара, без молока, отдельно лёд.
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>0/240</div>
          </div>
        </div>
        {/* summary */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>Ваш заказ</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
            <span>1× Капучино · 200 мл</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>7 Br</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
            <span>Позиций</span><span>1</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
            <span style={{ fontSize: 14, color: NAVY }}>К оплате на стойке</span>
            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: NAVY }}>7 Br</span>
          </div>
          <div style={{ background: NAVY, color: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', fontSize: 15, fontWeight: 600, marginTop: 4 }}>✓ Подтвердить заказ</div>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px', textAlign: 'center', fontSize: 14, color: NAVY }}>Вернуться в корзину</div>
        </div>
      </div>
    </div>
  );
}

// ── preview 3 – order status ─────────────────────────────────────────────────
function Step3Preview() {
  return (
    <div style={{ width: VW, height: VH, background: '#f5f7fb', overflow: 'hidden', fontFamily: 'inherit' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <span style={{ fontSize: 14, color: '#64748b' }}>Заказ № <strong style={{ color: NAVY }}>70</strong></span>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ padding: '0 28px', overflowY: 'hidden', height: VH - 57 }}>
        {/* hero */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', margin: '18px 0 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NAVY, marginBottom: 6 }}>ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ АДМИНИСТРАТОРА</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 14 }}>Спасибо, Никита.<br/>Заказ передан администратору.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[['Кресло','Рабочее место 1'],['Позиций','1'],['К оплате','7 Br']].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* track */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', marginBottom: 12, display: 'flex' }}>
          {[['1','Заказ принят',true,true],['2','Готовим',false,false],['3','У вас',false,false]].map(([n,l,active,cur]) => (
            <div key={String(n)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, borderRight: n !== '3' ? '1px dashed #e2e8f0' : 'none', paddingRight: n !== '3' ? 16 : 0, marginRight: n !== '3' ? 16 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: active ? NAVY : '#e2e8f0', color: active ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{n}</div>
              <div style={{ fontSize: 13, fontWeight: cur ? 700 : 400, color: active ? NAVY : '#94a3b8' }}>{l}</div>
            </div>
          ))}
        </div>
        {/* items */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Состав заказа</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e5e7eb', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>Капучино</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>200 мл</div>
            </div>
            <span style={{ fontSize: 12, color: '#64748b' }}>×1</span>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: NAVY }}>{rub(7)}</span>
          </div>
        </div>
        {/* actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: NAVY, background: '#fff' }}>Продолжить покупки</div>
          <div style={{ flex: 1, border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#dc2626', background: '#fff' }}>⊗ Отменить заказ</div>
        </div>
      </div>
    </div>
  );
}

// ── preview 4 – order history ────────────────────────────────────────────────
function Step4Preview() {
  const past = [
    { date: '12 июня', id: 66, items: 'Укороченная стрижка · Базовая футболка', total: 100 },
    { date: '12 июня', id: 64, items: 'Текстурирующий спрей',                   total: 40  },
    { date: '12 июня', id: 63, items: 'Капучино',                                total: 9   },
    { date: '3 июня',  id: 55, items: 'Латте · Шорты · Шорты',                  total: 210 },
    { date: '3 июня',  id: 48, items: 'Шорты',                                   total: 100 },
  ];
  return (
    <div style={{ width: VW, height: VH, background: '#f5f7fb', overflow: 'hidden', fontFamily: 'inherit' }}>
      <PTopbar />
      {/* overlay nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <span style={{ fontSize: 13, color: '#64748b' }}>Меню заказа · <strong style={{ color: NAVY }}>История заказов</strong></span>
      </div>
      <div style={{ padding: '16px 28px 0', overflowY: 'hidden', height: VH - 64 - 47 }}>
        {/* hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NAVY, marginBottom: 4 }}>СЕССИЯ · НИКИТА</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>История заказов</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, maxWidth: 360 }}>Заказы доступны для текущей сессии. После завершения сессии данные скрываются.</div>
          </div>
          {/* stats tiles */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[{v:'13',l:'визитов',a:true},{v:'57',l:'Квадратики'},{v:'0',l:'позиций всего'},{v:'0,00 Br',l:'сумма визита'}].map((t,i) => (
              <div key={i} style={{ background: t.a ? NAVY : '#fff', borderRadius: 10, padding: '10px 12px', minWidth: 64, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.a ? '#fff' : NAVY, fontFamily: 'monospace' }}>{t.v}</div>
                <div style={{ fontSize: 9, color: t.a ? 'rgba(255,255,255,0.6)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{t.l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* list */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>ПРОШЛЫЕ СЕССИИ</div>
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {past.map((o, i) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < past.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: NAVY, flexShrink: 0 }} />
              <div style={{ width: 60, flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{o.date}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>№ {o.id}</div>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: NAVY, whiteSpace: 'nowrap' }}>{rub(o.total)}</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── step definitions ─────────────────────────────────────────────────────────
const STEPS: StepDef[] = [
  {
    title: '1. Выбор товаров и опций',
    sub: 'Выберите категорию, настройте товар и добавьте его в корзину.',
    Preview: Step1Preview,
    callouts: [
      { num: 1, side: 'left',  top: 86,  text: 'Выберите нужную категорию в меню.' },
      { num: 2, side: 'left',  top: 230, text: 'Откройте товар и выберите объём / опции.' },
      { num: 3, side: 'right', top: 32,  text: 'После добавления товар появится в корзине.' },
      { num: 4, side: 'right', top: 350, text: 'Нажмите «В корзину».' },
    ],
  },
  {
    title: '2. Подтверждение заказа',
    sub: 'Проверьте данные заказа, при необходимости добавьте комментарий и подтвердите оформление.',
    Preview: Step2Preview,
    callouts: [
      { num: 1, side: 'left',  top: 118, text: 'Проверьте имя клиента.' },
      { num: 2, side: 'left',  top: 178, text: 'Выберите, куда подать ваш заказ?' },
      { num: 3, side: 'left',  top: 252, text: 'При необходимости добавьте комментарий к заказу.' },
      { num: 4, side: 'right', top: 160, text: 'Проверьте состав заказа и сумму.' },
      { num: 5, side: 'right', top: 280, text: 'Нажмите «Подтвердить заказ».' },
    ],
  },
  {
    title: '3. После оформления заказа',
    sub: 'Вы можете следить за статусом заказа и при необходимости продолжить покупки.',
    Preview: Step3Preview,
    callouts: [
      { num: 1, side: 'left',  top: 130, text: 'Заказ передан администратору.' },
      { num: 2, side: 'left',  top: 235, text: 'Следите за текущим статусом заказа.' },
      { num: 3, side: 'right', top: 295, text: 'Проверьте состав заказа и сумму.' },
      { num: 4, side: 'left',  top: 368, text: 'Нажмите «Продолжить покупки», чтобы вернуться в меню.' },
    ],
  },
  {
    title: '4. История заказов',
    sub: 'Ознакомьтесь со статистикой и списком прошлых заказов и сессий.',
    Preview: Step4Preview,
    callouts: [
      { num: 1, side: 'left',  top: 148, text: 'Откройте раздел с историей заказов.' },
      { num: 2, side: 'right', top: 145, text: 'Сверху доступна краткая статистика.' },
      { num: 3, side: 'left',  top: 298, text: 'Ниже отображается список прошлых заказов.' },
      { num: 4, side: 'right', top: 340, text: 'Нажмите на строку заказа, чтобы открыть детали.' },
    ],
  },
];

// ── callout bubble component ─────────────────────────────────────────────────
const ARROW_LINE = GAP + 10;   // px – line length (crosses gap + 10px into preview)
const ARROW_HEAD = 7;           // px – arrowhead width

function CalloutBubble({ c, side }: { c: Callout; side: 'left' | 'right' }) {
  const offset = -(ARROW_LINE + ARROW_HEAD);
  const arrowLine = (
    <div style={{ width: ARROW_LINE, height: 1.5, background: NAVY, flexShrink: 0 }} />
  );
  const arrowHeadR = (
    <div style={{ width: 0, height: 0, flexShrink: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `${ARROW_HEAD}px solid ${NAVY}` }} />
  );
  const arrowHeadL = (
    <div style={{ width: 0, height: 0, flexShrink: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `${ARROW_HEAD}px solid ${NAVY}` }} />
  );

  const bubble = (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '8px 10px',
      boxShadow: '0 2px 14px rgba(13,31,60,0.13)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: COL - 6,
      flexShrink: 0,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, borderRadius: '50%', background: NAVY, color: '#fff',
        fontSize: 11, fontWeight: 700, flexShrink: 0, alignSelf: 'flex-start',
      }}>{c.num}</span>
      <p style={{ margin: 0, fontSize: 11.5, color: '#1e293b', lineHeight: 1.45 }}>{c.text}</p>
    </div>
  );

  return (
    <div style={{
      position: 'absolute',
      top: c.top,
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      ...(side === 'left' ? { right: offset } : { left: offset }),
    }}>
      {side === 'right' && <>{arrowHeadL}{arrowLine}</>}
      {bubble}
      {side === 'left' && <>{arrowLine}{arrowHeadR}</>}
    </div>
  );
}

// ── main SessionGuide component ──────────────────────────────────────────────
export function SessionGuide({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleTap = (e: React.MouseEvent) => {
    // Ignore taps on the preview frame (pointer-events:none means this shouldn't fire from there,
    // but guard anyway)
    const isRight = e.clientX > window.innerWidth / 2;
    if (isRight) {
      if (step < STEPS.length - 1) setStep(s => s + 1);
      else onDismiss();
    } else {
      if (step > 0) setStep(s => s - 1);
    }
  };

  const leftCallouts  = current.callouts.filter(c => c.side === 'left');
  const rightCallouts = current.callouts.filter(c => c.side === 'right');

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: '#f8f9fc',
        display: 'flex', flexDirection: 'column',
        padding: '20px 24px 24px',
        userSelect: 'none', cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {/* ── progress bars ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? NAVY : '#dde1ea' }} />
        ))}
      </div>

      {/* ── title row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {current.title}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{current.sub}</p>
        </div>
        <div style={{
          background: NAVY, color: '#fff',
          borderRadius: 22, padding: '7px 16px',
          fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 16,
        }}>
          Шаг {step + 1} из {STEPS.length}
        </div>
      </div>

      {/* ── main content: columns + preview ── */}
      <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start', justifyContent: 'center', flex: 1, marginTop: 8 }}>

        {/* left callout column */}
        <div style={{ width: COL, position: 'relative', height: FH, flexShrink: 0 }}>
          {leftCallouts.map(c => <CalloutBubble key={c.num} c={c} side="left" />)}
        </div>

        {/* preview frame */}
        <div style={{
          width: FW, height: FH, flexShrink: 0,
          overflow: 'hidden', borderRadius: 12,
          boxShadow: '0 4px 32px rgba(13,31,60,0.14)',
          pointerEvents: 'none',
        }}>
          <div style={{ width: VW, height: VH, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
            <current.Preview />
          </div>
        </div>

        {/* right callout column */}
        <div style={{ width: COL, position: 'relative', height: FH, flexShrink: 0 }}>
          {rightCallouts.map(c => <CalloutBubble key={c.num} c={c} side="right" />)}
        </div>
      </div>

      {/* ── nav hint ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>
        <span>{step > 0 ? '← Предыдущий шаг' : ''}</span>
        <span>{step < STEPS.length - 1 ? 'Следующий шаг →' : 'Нажмите → чтобы начать'}</span>
      </div>
    </div>
  );
}
