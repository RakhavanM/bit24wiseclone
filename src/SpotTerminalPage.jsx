import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownUp,
  ArrowLeft,
  ChartCandlestick,
  ChevronDown,
  Clock3,
  Maximize2,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  createOrderBook,
  createRecentTrades,
  defaultSpotAccount,
  executeMarketOrder,
  orderTypes,
  spotSymbols,
} from './spotTerminal';

const faNumber = (value, digits = 2) => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: digits }).format(value);
const faTime = (value) => new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(value);
const money = (value, symbol) => `${faNumber(value, value < 1 ? 6 : 2)} ${symbol}`;

function SpotCoin({ symbol, small = false }) {
  return <span className={`spot-coin ${symbol.tone} ${small ? 'small' : ''}`}>{symbol.icon}</span>;
}

function PairSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visible = spotSymbols.filter((symbol) => symbol.code.toLowerCase().includes(query.toLowerCase()) || symbol.name.includes(query));
  return <div className="spot-pair-select"><button className={`spot-pair-trigger ${open ? 'open' : ''}`} type="button" onClick={() => setOpen((value) => !value)} aria-label="انتخاب نماد معاملاتی" aria-expanded={open}><SpotCoin symbol={selected} /><span><strong>{selected.code}</strong><small>{selected.name}</small></span><ChevronDown size={16} /></button>{open && <div className="spot-pair-menu" role="listbox" aria-label="انتخاب نماد معاملاتی"><label className="spot-pair-search"><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نماد" aria-label="جست‌وجوی نماد" /></label><div className="spot-pair-group"><span>جفت‌ارزهای محبوب</span>{visible.map((symbol) => <button className={symbol.code === selected.code ? 'active' : ''} type="button" role="option" aria-selected={symbol.code === selected.code} key={symbol.code} onClick={() => { onChange(symbol); setOpen(false); setQuery(''); }}><SpotCoin symbol={symbol} small /><b>{symbol.code}</b><small>{symbol.name}</small><em>{money(symbol.price, symbol.quote)}</em></button>)}</div></div>}</div>;
}

function ChartPanel({ symbol, timeframe, onTimeframe }) {
  const candles = useMemo(() => Array.from({ length: 36 }, (_, index) => {
    const wave = Math.sin(index * 0.57) * symbol.price * 0.004;
    const trend = index * symbol.price * 0.00017;
    const close = symbol.price + wave + trend;
    return { close, open: close - Math.cos(index) * symbol.price * .002, high: close + symbol.price * .0034, low: close - symbol.price * .003, volume: 25 + ((index * 17) % 42) };
  }), [symbol]);
  const min = Math.min(...candles.map((candle) => candle.low));
  const max = Math.max(...candles.map((candle) => candle.high));
  const x = (index) => 18 + (index / (candles.length - 1)) * 620;
  const y = (price) => 230 - ((price - min) / (max - min)) * 196;
  const line = candles.map((candle, index) => `${x(index)},${y(candle.close)}`).join(' ');
  return <section className="spot-chart-panel"><div className="spot-panel-head"><div><span className="spot-panel-kicker"><Activity size={14} /> نمودار قیمت</span><h2>{faNumber(symbol.price, symbol.price < 1 ? 6 : 2)} <small>{symbol.quote}</small></h2></div><div className="spot-chart-tools"><div className="spot-timeframes">{['۱د', '۵د', '۱۵د', '۱س', '۴س', '۱روز'].map((item) => <button className={timeframe === item ? 'active' : ''} type="button" key={item} onClick={() => onTimeframe(item)}>{item}</button>)}</div><button className="spot-icon-button" type="button" aria-label="بزرگ‌نمایی نمودار"><Maximize2 size={16} /></button></div></div><div className="spot-chart-meta"><span className="spot-positive"><TrendingUp size={14} /> +{faNumber(symbol.change, 2)}٪</span><span>بیشترین {faNumber(max, symbol.price < 1 ? 6 : 2)}</span><span>کمترین {faNumber(min, symbol.price < 1 ? 6 : 2)}</span><span>حجم ۲۴ساعته {faNumber(128.4, 1)}M</span></div><div className="spot-chart-canvas"><svg viewBox="0 0 660 260" role="img" aria-label={`نمودار قیمت ${symbol.code}`} preserveAspectRatio="none"><defs><linearGradient id="spot-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0072ff" stopOpacity=".22" /><stop offset="1" stopColor="#0072ff" stopOpacity="0" /></linearGradient></defs>{[38, 86, 134, 182, 230].map((yValue) => <line className="chart-grid-line" key={yValue} x1="0" x2="660" y1={yValue} y2={yValue} />)}<polygon points={`18,230 ${line} 638,230`} fill="url(#spot-chart-fill)" /><polyline points={line} fill="none" stroke="#0072ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{candles.filter((_, index) => index % 6 === 0).map((candle, index) => <text x={18 + index * 103} y="253" key={index}>{['۱۰:۰۰', '۱۲:۰۰', '۱۴:۰۰', '۱۶:۰۰', '۱۸:۰۰', 'اکنون'][index]}</text>)}</svg></div><div className="spot-chart-disclaimer"><ChartCandlestick size={14} /> داده‌ها شبیه‌سازی‌شده‌اند و صرفاً برای نمایش تجربه‌ی معامله استفاده می‌شوند.</div></section>;
}

function OrderBook({ book, symbol, onPrice }) {
  const maxTotal = Math.max(...book.asks.concat(book.bids).map((row) => row.total));
  const row = (item) => <button className={`spot-order-row ${item.side}`} type="button" key={item.id} onClick={() => onPrice(item.price)}><i style={{ width: `${Math.max(8, (item.total / maxTotal) * 100)}%` }} /><span>{faNumber(item.price, symbol.price < 1 ? 6 : 2)}</span><span>{faNumber(item.amount, 6)}</span><span>{faNumber(item.total, 2)}</span></button>;
  return <section className="spot-card spot-orderbook"><div className="spot-card-head"><h3>دفتر سفارشات</h3><button className="spot-icon-button" type="button" aria-label="تنظیمات دفتر سفارشات"><SlidersHorizontal size={15} /></button></div><div className="spot-book-tabs"><button className="active" type="button">دفتر سفارشات</button><button type="button">عمق بازار</button></div><div className="spot-book-labels"><span>قیمت ({symbol.quote})</span><span>مقدار ({symbol.base})</span><span>مجموع</span></div><div className="spot-book-rows asks">{book.asks.map(row)}</div><div className="spot-mid-price"><strong>{faNumber(symbol.price, symbol.price < 1 ? 6 : 2)}</strong><span>{symbol.quote}</span><b className={symbol.change >= 0 ? 'spot-positive' : 'spot-negative'}>{symbol.change >= 0 ? '+' : ''}{faNumber(symbol.change, 2)}٪</b></div><div className="spot-book-rows bids">{book.bids.map(row)}</div></section>;
}

function RecentTrades({ trades, symbol }) {
  return <section className="spot-card spot-recent"><div className="spot-card-head"><h3>معاملات اخیر</h3><span className="spot-live-label"><i /> زنده</span></div><div className="spot-book-labels"><span>قیمت ({symbol.quote})</span><span>مقدار ({symbol.base})</span><span>زمان</span></div><div className="spot-recent-list">{trades.map((trade) => <div className="spot-recent-row" key={trade.id}><b className={trade.side === 'buy' ? 'spot-positive' : 'spot-negative'}>{faNumber(trade.price, symbol.price < 1 ? 6 : 2)}</b><span>{faNumber(trade.amount, 6)}</span><time>{trade.time}</time></div>)}</div></section>;
}

function OrderForm({ side, setSide, symbol, book, balances, onSubmit, selectedPrice }) {
  const [type, setType] = useState('limit');
  const [price, setPrice] = useState(String(symbol.price));
  const [amount, setAmount] = useState('');
  const [typeOpen, setTypeOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);
  useEffect(() => { setPrice(String(selectedPrice || symbol.price)); setAmount(''); setPercentage(0); }, [symbol, selectedPrice]);
  const available = balances[side === 'buy' ? symbol.quote : symbol.base] || 0;
  const total = (Number(price) || symbol.price) * (Number(amount) || 0);
  const currentPrice = side === 'buy' ? book.asks[book.asks.length - 1]?.price : book.bids[0]?.price;
  const chooseBookPrice = () => setPrice(String(currentPrice || symbol.price));
  const submit = () => onSubmit({ side, type, price: Number(price) || symbol.price, amount: Number(amount) || 0, setAmount });
  return <section className="spot-order-form"><div className="spot-side-tabs"><button className={side === 'buy' ? 'active buy' : ''} type="button" onClick={() => setSide('buy')}>خرید {symbol.base}</button><button className={side === 'sell' ? 'active sell' : ''} type="button" onClick={() => setSide('sell')}>فروش {symbol.base}</button></div><div className="spot-order-type"><span>نوع سفارش</span><div className={`spot-select-control ${typeOpen ? 'open' : ''}`}><button type="button" aria-label="نوع سفارش" onClick={() => setTypeOpen((current) => !current)}>{orderTypes.find((item) => item.code === type)?.label}<ChevronDown size={14} /></button>{typeOpen && <div className="spot-select-popover" role="listbox">{orderTypes.map((item) => <button type="button" role="option" key={item.code} aria-selected={item.code === type} onClick={() => { setType(item.code); setTypeOpen(false); }}>{item.label}</button>)}</div>}</div></div>{type !== 'market' && <label className="spot-field"><span>قیمت سفارش</span><div><input dir="ltr" value={price} onChange={(event) => setPrice(event.target.value.replace(/[^0-9.]/g, ''))} aria-label="قیمت سفارش" /><b>{symbol.quote}</b><button type="button" onClick={chooseBookPrice} aria-label="انتخاب قیمت دفتر سفارشات"><ArrowDownUp size={14} /></button></div></label>}<label className="spot-field"><span>مقدار {side === 'buy' ? 'خرید' : 'فروش'}</span><div><input dir="ltr" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} aria-label={side === 'buy' ? 'مقدار خرید' : 'مقدار فروش'} placeholder="۰٫۰۰۰۰" /><b>{symbol.base}</b></div></label><div className="spot-percentages">{[25, 50, 75, 100].map((value) => <button className={percentage === value ? 'active' : ''} type="button" key={value} onClick={() => { setPercentage(value); setAmount(String((available * value / 100) / (side === 'buy' ? (Number(price) || symbol.price) : 1))); }}>{value}٪</button>)}</div><div className="spot-form-summary"><span>موجودی <b>{faNumber(available, 6)} {side === 'buy' ? symbol.quote : symbol.base}</b></span><span>مجموع <b>{faNumber(total, 2)} {symbol.quote}</b></span><span>کارمزد <b>۰٫۱٪</b></span></div><button className={`spot-submit ${side}`} type="button" onClick={submit} aria-label={`ثبت سفارش ${side === 'buy' ? 'خرید' : 'فروش'}`}>{side === 'buy' ? `خرید ${symbol.base}` : `فروش ${symbol.base}`} <ArrowLeft size={17} /></button></section>;
}

export function SpotTerminalPage() {
  const [symbol, setSymbol] = useState(spotSymbols[0]);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [timeframe, setTimeframe] = useState('۱۵د');
  const [book, setBook] = useState(() => createOrderBook(spotSymbols[0]));
  const [trades, setTrades] = useState(() => createRecentTrades(spotSymbols[0]));
  const [account, setAccount] = useState(() => { try { return JSON.parse(localStorage.getItem('bit24-spot-account')) || defaultSpotAccount; } catch { return defaultSpotAccount; } });
  const [side, setSide] = useState('buy');
  const [notice, setNotice] = useState(null);
  useEffect(() => { setBook(createOrderBook(symbol, Date.now() % 23)); setTrades(createRecentTrades(symbol, Date.now() % 23)); setSide('buy'); }, [symbol]);
  useEffect(() => { localStorage.setItem('bit24-spot-account', JSON.stringify(account)); }, [account]);
  useEffect(() => { const timer = setInterval(() => { setBook(createOrderBook(symbol, Math.floor(Math.random() * 22))); setTrades(createRecentTrades(symbol, Math.floor(Math.random() * 22))); }, 3500); return () => clearInterval(timer); }, [symbol]);
  const submitOrder = ({ side: orderSide, type, price, amount }) => { if (type === 'market') { const result = executeMarketOrder({ side: orderSide, symbol, amount, account }); if (!result.ok) { setNotice({ type: 'error', text: result.error }); return; } setAccount(result.account); setNotice({ type: 'success', text: 'سفارش با موفقیت اجرا شد' }); return; } if (!amount || amount <= 0) { setNotice({ type: 'error', text: 'مقدار سفارش را وارد کنید.' }); return; } const next = structuredClone(account); const order = { id: `open-${Date.now()}`, symbol: symbol.code, side: orderSide, type, price, amount, total: price * amount, status: 'open' }; next.openOrders = [order, ...next.openOrders]; setAccount(next); setNotice({ type: 'success', text: 'سفارش در فهرست سفارش‌های باز قرار گرفت.' }); };
  return <div className="inner-page spot-terminal-page"><div className="spot-terminal-top page-shell"><div className="spot-terminal-title"><div className="section-kicker"><Activity size={15} /> محیط آزمایشی معامله</div><h1>معاملات اسپات</h1><p>داده‌ها و سفارش‌ها شبیه‌سازی‌شده‌اند؛ تجربه‌ای نزدیک به محیط واقعی معامله.</p></div><div className="spot-terminal-actions"><span className="spot-sim-badge"><i /> شبیه‌سازی فعال</span><button className="spot-reset" type="button" onClick={() => { localStorage.removeItem('bit24-spot-account'); setAccount(defaultSpotAccount); setNotice({ type: 'success', text: 'حساب آزمایشی بازنشانی شد.' }); }}><RefreshCcw size={15} /> بازنشانی حساب</button></div></div><div className="page-shell spot-market-bar"><PairSelector selected={symbol} onChange={setSymbol} /><div className="spot-market-price"><strong>{faNumber(symbol.price, symbol.price < 1 ? 6 : 2)}</strong><span>{symbol.quote}</span><b className={symbol.change >= 0 ? 'spot-positive' : 'spot-negative'}>{symbol.change >= 0 ? '+' : ''}{faNumber(symbol.change, 2)}٪</b></div><div className="spot-market-stats"><span>بیشترین ۲۴ساعت <b>{faNumber(symbol.price * 1.024, symbol.price < 1 ? 6 : 2)}</b></span><span>کمترین ۲۴ساعت <b>{faNumber(symbol.price * .976, symbol.price < 1 ? 6 : 2)}</b></span><span>حجم ۲۴ساعت <b>۱۲۸٫۴M</b></span></div></div><main className="page-shell spot-terminal-grid"><ChartPanel symbol={symbol} timeframe={timeframe} onTimeframe={setTimeframe} /><aside className="spot-side-column"><OrderBook book={book} symbol={symbol} onPrice={(price) => setSelectedPrice(price)} /><RecentTrades trades={trades} symbol={symbol} /></aside><section className="spot-trade-card"><div className="spot-card-head"><h3>ثبت سفارش</h3><span><Clock3 size={14} /> تسویه‌ی شبیه‌سازی‌شده</span></div><OrderForm side={side} setSide={setSide} symbol={symbol} book={book} balances={account.balances} onSubmit={submitOrder} selectedPrice={selectedPrice} /></section><section className="spot-bottom-panel"><div className="spot-bottom-tabs"><button className="active" type="button">سفارش‌های باز ({account.openOrders.length})</button><button type="button">تاریخچه معاملات ({account.history.length})</button><button type="button">موجودی حساب</button></div>{notice && <div className={`spot-notice ${notice.type}`}>{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="بستن پیام"><X size={15} /></button></div>}<div className="spot-history-table">{account.history.length ? account.history.map((item) => <div className="spot-history-row" key={item.id}><span>{item.symbol}</span><b className={item.side === 'buy' ? 'spot-positive' : 'spot-negative'}>{item.side === 'buy' ? 'خرید' : 'فروش'}</b><span>{faNumber(item.price, symbol.price < 1 ? 6 : 2)}</span><span>{faNumber(item.amount, 6)}</span><span>{item.time}</span><span>{item.status === 'filled' ? 'تکمیل‌شده' : item.status}</span></div>) : <div className="spot-empty-state">هنوز معامله‌ای در این حساب آزمایشی ثبت نشده است.</div>}</div></section></main></div>;
}
