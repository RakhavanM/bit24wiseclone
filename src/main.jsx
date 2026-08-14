import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowUpLeft,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Globe2,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import './styles.css';

const currencies = {
  IRT: { code: 'IRT', label: 'تومان', flag: 'تومان', rate: 186960, direction: 'ریال' },
  USDT: { code: 'USDT', label: 'تتر', flag: '₮', rate: 1, direction: 'USDT' },
  BTC: { code: 'BTC', label: 'بیت‌کوین', flag: '₿', rate: 62911.05, direction: 'USDT' },
  ETH: { code: 'ETH', label: 'اتریوم', flag: 'Ξ', rate: 1875.42, direction: 'USDT' },
};

const marketRows = [
  { code: 'USDT', name: 'تتر', price: '۱۸۶٬۹۶۰', change: '-۰٫۰۳٪', trend: 'down', icon: '₮', className: 'coin-usdt' },
  { code: 'BTC', name: 'بیت‌کوین', price: '۶۲٬۹۱۱٫۰۵', change: '-۰٫۶۷٪', trend: 'down', icon: '₿', className: 'coin-btc' },
  { code: 'ETH', name: 'اتریوم', price: '۱٬۸۷۵٫۴۲', change: '-۰٫۵۸٪', trend: 'down', icon: 'Ξ', className: 'coin-eth' },
  { code: 'SOL', name: 'سولانا', price: '۷۴٫۸۹', change: '+۱٫۵۳٪', trend: 'up', icon: 'S', className: 'coin-sol' },
];

const stats = [
  { value: '۲٬۰۰۰٬۰۰۰+', label: 'کاربر فعال', icon: Globe2 },
  { value: '۱۰۸۸', label: 'ارز دیجیتال', icon: Sparkles },
  { value: '۷۳', label: 'شبکه بلاکچین', icon: Zap },
  { value: '۰٫۰۷٪ تا ۰٫۲٪', label: 'کارمزد شفاف', icon: TrendingUp },
];

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits }).format(value);
}

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="بیت۲۴، صفحه اصلی">
      <span className="brand-mark" aria-hidden="true">۲۴</span>
      <span className="brand-name">بیت<span>۲۴</span></span>
    </a>
  );
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('bit24wise-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark';
  return (
    <button className="theme-toggle" type="button" onClick={onToggle} aria-pressed={dark} aria-label={dark ? 'فعال‌کردن حالت روشن' : 'فعال‌کردن حالت تاریک'} title={dark ? 'حالت روشن' : 'حالت تاریک'}>
      {dark ? <Sun size={17} strokeWidth={1.9} /> : <Moon size={17} strokeWidth={1.9} />}
    </button>
  );
}

function Header({ onMenu, theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <Logo />
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          <a href="#convert">خرید و فروش</a>
          <a href="#markets">بازارها</a>
          <a href="#services">خدمات بیت۲۴</a>
          <a href="#trust">امنیت و اعتماد</a>
          <a href="#blog">وبلاگ</a>
          <a href="#analysis">تحلیل</a>
        </nav>
        <div className="header-actions">
          <button className="help-button" type="button" aria-label="راهنما"><CircleHelp size={19} strokeWidth={1.8} /></button>
          <a className="login-link" href="#login">ورود</a>
          <a className="primary-button header-cta" href="#signup">ثبت‌نام</a>
          <button className="menu-button" type="button" onClick={onMenu} aria-label="باز کردن منو"><Menu size={22} /></button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="mobile-menu-backdrop" role="dialog" aria-modal="true" aria-label="منوی موبایل">
      <div className="mobile-menu">
        <div className="mobile-menu-head"><Logo /><button type="button" onClick={onClose} aria-label="بستن منو"><X size={22} /></button></div>
        <div className="mobile-links">
          <a href="#convert" onClick={onClose}>خرید و فروش</a>
          <a href="#markets" onClick={onClose}>بازارها</a>
          <a href="#services" onClick={onClose}>خدمات بیت۲۴</a>
          <a href="#trust" onClick={onClose}>امنیت و اعتماد</a>
          <a href="#blog" onClick={onClose}>وبلاگ</a>
          <a href="#analysis" onClick={onClose}>تحلیل</a>
        </div>
        <a className="primary-button mobile-signup" href="#signup" onClick={onClose}>شروع کنید <ArrowLeft size={18} /></a>
      </div>
    </div>
  );
}

function CoinBadge({ coin, small = false }) {
  return <span className={`coin-badge ${coin.className || ''} ${small ? 'small' : ''}`}>{coin.icon || coin.flag}</span>;
}

function CurrencySelect({ value, onChange, label }) {
  const item = currencies[value];
  return (
    <label className="currency-select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        {Object.values(currencies).map((currency) => <option key={currency.code} value={currency.code}>{currency.code} — {currency.label}</option>)}
      </select>
      <span className="currency-selected"><span className="currency-symbol">{item.flag}</span><strong>{item.code}</strong><ChevronDown size={15} /></span>
    </label>
  );
}

function Converter() {
  const [from, setFrom] = useState('IRT');
  const [to, setTo] = useState('USDT');
  const [amount, setAmount] = useState('10000000');
  const numericAmount = Number(amount.replace(/[^0-9.]/g, '')) || 0;
  const recipient = useMemo(() => {
    if (from === 'IRT' && to === 'USDT') return numericAmount / currencies.IRT.rate;
    if (from === 'USDT' && to === 'IRT') return numericAmount * currencies.IRT.rate;
    const fromRate = currencies[from].rate;
    const toRate = currencies[to].rate;
    return (numericAmount * fromRate) / toRate;
  }, [from, to, numericAmount]);
  const fee = from === 'IRT' && to === 'USDT' ? 0 : recipient * 0.001;
  const recipientDisplay = recipient ? formatNumber(recipient, recipient < 100 ? 6 : 2) : '۰';
  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="converter-card" id="convert">
      <div className="converter-topline"><span className="live-dot" /> نرخ لحظه‌ای بیت۲۴</div>
      <div className="converter-fields">
        <div className="money-field">
          <div className="field-label"><span>پرداخت می‌کنید</span><span className="field-hint">قیمت نهایی</span></div>
          <div className="money-input-wrap"><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} aria-label="مبلغ پرداخت" /><CurrencySelect value={from} onChange={setFrom} label="ارز پرداخت" /></div>
        </div>
        <button className="swap-button" type="button" onClick={swap} aria-label="جابه‌جایی ارزها"><ArrowUpLeft size={19} /></button>
        <div className="money-field recipient-field">
          <div className="field-label"><span>دریافت می‌کنید</span><span className="field-hint success-hint">واریز سریع</span></div>
          <div className="money-input-wrap"><output className="money-output">{recipientDisplay}</output><CurrencySelect value={to} onChange={setTo} label="ارز دریافتی" /></div>
        </div>
      </div>
      <div className="converter-summary">
        <span>کارمزد تقریبی <strong>{formatNumber(fee, 2)} {to}</strong></span>
        <span>تکمیل سفارش <strong>در چند ثانیه</strong></span>
      </div>
      <a className="primary-button converter-cta" href="#signup">شروع خرید و فروش <ArrowLeft size={18} /></a>
      <p className="converter-note">بدون غافلگیری؛ قبل از تأیید، جزئیات کامل را می‌بینید.</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-grid page-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> دنیای رمزارز، ساده‌تر از همیشه</div>
          <h1>پولِ دیجیتال،<br /><em>بدون پیچیدگی.</em></h1>
          <p className="hero-description">با بیت۲۴ ارز دیجیتال بخرید، بفروشید و دارایی‌تان را با شفافیت و سرعت مدیریت کنید.</p>
          <div className="hero-actions"><a className="primary-button large" href="#signup">همین حالا شروع کنید <ArrowLeft size={20} /></a><a className="text-link" href="#markets">قیمت‌ها را ببینید <ChevronLeft size={18} /></a></div>
          <div className="hero-assurance"><ShieldCheck size={17} /><span>امن، شفاف و در دسترس؛ ۲۴ ساعت شبانه‌روز</span></div>
        </div>
        <div className="hero-product visual-pattern"><span className="pattern-layer" aria-hidden="true" /><Converter /><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /></div>
      </div>
      <div className="hero-ticker"><div className="ticker-inner"><span className="ticker-label"><span className="live-dot" /> بازار زنده</span>{marketRows.map((row) => <a className="ticker-item" href={`#${row.code.toLowerCase()}`} key={row.code}><CoinBadge coin={row} small /><strong>{row.code}</strong><span>{row.price}</span><b className={row.trend}>{row.change}</b></a>)}</div></div>
    </section>
  );
}

function Stats() {
  return <section className="stats-section page-shell" aria-label="آمار بیت۲۴">{stats.map(({ value, label, icon: Icon }) => <div className="stat" key={label}><Icon size={20} strokeWidth={1.7} /><strong>{value}</strong><span>{label}</span></div>)}</section>;
}

function Markets() {
  const [tab, setTab] = useState('hot');
  const tabs = { hot: 'داغ‌ترین‌ها', gainers: 'بیشترین رشد', new: 'جدیدترین‌ها' };
  const rows = tab === 'gainers' ? [...marketRows].reverse() : tab === 'new' ? marketRows.map((row, index) => ({ ...row, code: ['ARB', 'XRP', 'SOL', 'BTC'][index], name: ['آربیتروم', 'ریپل', 'سولانا', 'بیت‌کوین'][index], change: `+${index + 2}٫${index + 1}٪`, trend: 'up' })) : marketRows;
  return (
    <section className="section page-shell" id="markets">
      <div className="section-head"><div><div className="section-kicker">قیمت‌ها، همین حالا</div><h2>بازار را <em>واضح‌تر</em> ببینید.</h2></div><a className="outline-button" href="#all-markets">مشاهده همه ارزها <ArrowLeft size={17} /></a></div>
      <div className="market-panel"><div className="market-tabs">{Object.entries(tabs).map(([key, label]) => <button className={tab === key ? 'active' : ''} type="button" key={key} onClick={() => setTab(key)}>{label}</button>)}</div><div className="market-list">{rows.map((row) => <a href={`#${row.code.toLowerCase()}`} className="market-row" key={`${tab}-${row.code}`}><div className="asset-name"><CoinBadge coin={row} /><span><strong>{row.code}</strong><small>{row.name}</small></span></div><span className="asset-price">{row.price}<small> USDT</small></span><span className={`asset-change ${row.trend}`}>{row.change}</span><ChevronLeft className="row-arrow" size={18} /></a>)}</div></div>
    </section>
  );
}

function Services() {
  const services = [
    { number: '۰۱', title: 'خرید و فروش آنی', body: 'ارزهای محبوب بازار را با قیمت نهایی و بدون کارمزد مجزا معامله کنید.', tone: 'blue', icon: '↗' },
    { number: '۰۲', title: 'بازار اسپات', body: 'برای معامله‌گرهای حرفه‌ای؛ سفارش‌گذاری دقیق با ابزارهای کامل بازار.', tone: 'ink', icon: '⌁' },
    { number: '۰۳', title: 'معامله اهرم‌دار', body: 'فرصت‌های بازار را با مدیریت ریسک و ابزارهای کنترل سود و ضرر دنبال کنید.', tone: 'soft', icon: '◒' },
  ];
  return <section className="section services-section" id="services"><div className="page-shell"><div className="section-head"><div><div className="section-kicker">یک حساب، چند مسیر</div><h2>هرچطور که معامله می‌کنید،<br /><em>بیت۲۴ همراه شماست.</em></h2></div><p className="section-intro">از خرید ساده تا معامله‌ی حرفه‌ای، همه‌چیز را در یک تجربه‌ی یکپارچه داشته باشید.</p></div><div className="service-grid">{services.map((service) => <a className={`service-card ${service.tone} visual-pattern`} href="#signup" key={service.number}><span className="pattern-layer" aria-hidden="true" /><div className="service-number">{service.number}</div><div className="service-icon">{service.icon}</div><h3>{service.title}</h3><p>{service.body}</p><span className="service-link">بیشتر بدانید <ArrowLeft size={17} /></span></a>)}</div></div></section>;
}

function Trust() {
  return <section className="trust-section" id="trust"><div className="page-shell trust-grid"><div className="trust-copy"><div className="section-kicker">پشتوانه‌ی یک انتخاب مطمئن</div><h2>شفافیت، از اولین<br /><em>کلیک شروع می‌شود.</em></h2><p>قیمت‌ها، کارمزدها و وضعیت سفارش را واضح می‌بینید. لایه‌های امنیتی پیشرفته و پشتیبانی فارسی ۲۴ ساعته، مسیر معامله را مطمئن‌تر می‌کنند.</p><a className="text-link light-link" href="#security">با امنیت بیت۲۴ آشنا شوید <ArrowLeft size={18} /></a></div><div className="trust-points"><div className="trust-point"><span className="trust-icon"><ShieldCheck size={21} /></span><div><h3>دارایی امن</h3><p>ترکیب کیف‌پول‌های سرد و گرم برای نگهداری ایمن و دسترسی سریع.</p></div></div><div className="trust-point"><span className="trust-icon"><Clock3 size={21} /></span><div><h3>پشتیبانی ۲۴/۷</h3><p>هر زمان نیاز داشتید، کارشناسان فارسی‌زبان کنار شما هستند.</p></div></div><div className="trust-point"><span className="trust-icon"><Zap size={21} /></span><div><h3>سریع و شفاف</h3><p>از نمایش قیمت نهایی تا انجام سفارش، بدون مرحله‌ی مبهم.</p></div></div></div></div></section>;
}

function Insights() {
  return <section className="insights-section page-shell" id="blog"><div className="section-head"><div><div className="section-kicker">ایده‌ها و نگاه بیت۲۴</div><h2>برای تصمیم‌های بهتر،<br /><em>به‌روز بمانید.</em></h2></div><p className="section-intro">خبرها، روایت‌ها و تحلیل‌های کاربردی بازار را در یک فضای روشن و قابل‌فهم دنبال کنید.</p></div><div className="insights-grid"><a className="insight-card insight-featured" href="#blog"><div className="insight-visual blog-visual visual-pattern"><span className="pattern-layer" aria-hidden="true" /><span className="visual-word">BLOG</span><span className="visual-stamp">BIT24 / ۰۱</span><span className="visual-orb orb-one" /><span className="visual-orb orb-two" /></div><div className="insight-content"><div className="insight-meta"><span>وبلاگ بیت۲۴</span><span>خواندنی‌های تازه</span></div><h3>از خبرهای مهم بازار تا راهنمایی‌های کاربردی برای معامله‌گرها</h3><span className="insight-link">رفتن به وبلاگ <ArrowLeft size={17} /></span></div></a><a className="insight-card insight-analysis" id="analysis" href="#analysis"><div className="insight-visual analysis-visual visual-pattern"><span className="pattern-layer" aria-hidden="true" /><span className="analysis-chart"><i /><i /><i /><i /><i /></span><span className="analysis-badge">LIVE<br />MARKET</span></div><div className="insight-content"><div className="insight-meta"><span>تحلیل بازار</span><span>روزانه</span></div><h3>روندها را ببینید، قبل از اینکه تصمیم بگیرید</h3><span className="insight-link">مشاهده تحلیل‌ها <ArrowLeft size={17} /></span></div></a></div></section>;
}

function Footer() {
  return <footer className="site-footer"><div className="page-shell footer-grid"><div><Logo /><p>بیت۲۴؛ راهی ساده، شفاف و امن برای ورود به دنیای ارزهای دیجیتال.</p></div><div><h3>بیت۲۴</h3><a href="#markets">بازارها</a><a href="#services">خدمات</a><a href="#trust">امنیت</a></div><div><h3>مطالب</h3><a href="#blog">وبلاگ</a><a href="#analysis">تحلیل بازار</a><a href="#faq">سوالات متداول</a></div><div><h3>شروع کنید</h3><a className="footer-cta" href="#signup">ثبت‌نام رایگان <ArrowLeft size={16} /></a><span className="footer-note">نسخه‌ی مفهومی برای بررسی UI</span></div></div><div className="page-shell footer-bottom"><span>© بیت۲۴ — تمامی حقوق محفوظ است.</span><span>طراحی مفهومی با الهام از الگوهای شفاف و انسان‌محور</span></div></footer>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('bit24wise-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1726' : '#0072ff');
  }, [theme]);

  return <><Header theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onMenu={() => setMenuOpen(true)} /><MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} /><main><Hero /><Stats /><Markets /><Services /><Trust /><Insights /></main><Footer /></>;
}

createRoot(document.getElementById('root')).render(<App />);
