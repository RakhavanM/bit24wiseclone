import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SpotTerminalPage } from './SpotTerminalPage';
import {
  Activity,
  ArrowDownUp,
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  Bot,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Filter,
  Globe2,
  LineChart,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import './styles.css';

const currencies = {
  IRT: { code: 'IRT', label: 'تومان', mark: 'ت', usdtValue: 1 / 186960, precision: 0 },
  USDT: { code: 'USDT', label: 'تتر', mark: '₮', usdtValue: 1, precision: 2 },
  BTC: { code: 'BTC', label: 'بیت‌کوین', mark: '₿', usdtValue: 62911.05, precision: 8 },
  ETH: { code: 'ETH', label: 'اتریوم', mark: 'Ξ', usdtValue: 1875.42, precision: 6 },
};

const marketRows = [
  { code: 'USDT', name: 'تتر', price: '۱۸۶٬۹۶۰', change: '-۰٫۰۳٪', trend: 'down', icon: '₮', className: 'coin-usdt' },
  { code: 'BTC', name: 'بیت‌کوین', price: '۶۲٬۹۱۱٫۰۵', change: '-۰٫۶۷٪', trend: 'down', icon: '₿', className: 'coin-btc' },
  { code: 'ETH', name: 'اتریوم', price: '۱٬۸۷۵٫۴۲', change: '-۰٫۵۸٪', trend: 'down', icon: 'Ξ', className: 'coin-eth' },
  { code: 'SOL', name: 'سولانا', price: '۷۴٫۸۹', change: '+۱٫۵۳٪', trend: 'up', icon: 'S', className: 'coin-sol' },
];

const stats = [
  { value: '۲٬۰۰۰٬۰۰۰+', label: 'کاربر', icon: Globe2 },
  { value: '۱۰۸۸', label: 'ارز دیجیتال لیست‌شده', icon: Sparkles },
  { value: '۷۳', label: 'شبکه بلاکچین برای انتقال', icon: Zap },
  { value: '۰٫۰۷٪ تا ۰٫۲٪', label: 'کمترین کارمزد بازار', icon: TrendingUp },
];

const cryptoLogos = [
  { code: 'BTC', name: 'بیت‌کوین', file: 'btc', tone: 'orange' },
  { code: 'ETH', name: 'اتریوم', file: 'eth', tone: 'blue' },
  { code: 'SOL', name: 'سولانا', file: 'sol', tone: 'purple' },
  { code: 'XRP', name: 'ریپل', file: 'xrp', tone: 'slate' },
  { code: 'USDT', name: 'تتر', file: 'usdt', tone: 'green' },
  { code: 'BNB', name: 'بایننس‌کوین', file: 'bnb', tone: 'gold' },
  { code: 'TRX', name: 'ترون', file: 'trx', tone: 'red' },
  { code: 'ADA', name: 'کاردانو', file: 'ada', tone: 'blue' },
  { code: 'DOGE', name: 'دوج‌کوین', file: 'doge', tone: 'yellow' },
  { code: 'DOT', name: 'پولکادات', file: 'dot', tone: 'pink' },
  { code: 'AVAX', name: 'آوالانچ', file: 'avax', tone: 'red' },
  { code: 'MATIC', name: 'پالیگان', file: 'matic', tone: 'purple' },
  { code: 'LINK', name: 'چین‌لینک', file: 'link', tone: 'blue' },
];


function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits }).format(value);
}

function normalizeAmount(value) {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let normalized = String(value ?? '')
    .split('')
    .map((character) => {
      const persianIndex = persianDigits.indexOf(character);
      if (persianIndex > -1) return String(persianIndex);
      const arabicIndex = arabicDigits.indexOf(character);
      return arabicIndex > -1 ? String(arabicIndex) : character;
    })
    .join('')
    .replace(/[٬,\s]/g, '')
    .replace(/[^0-9.]/g, '');
  const firstDot = normalized.indexOf('.');
  if (firstDot > -1) {
    normalized = `${normalized.slice(0, firstDot)}.${normalized.slice(firstDot + 1).replace(/\./g, '')}`;
  }
  if (!normalized) return '';
  const [whole = '0', fraction] = normalized.split('.');
  const cleanWhole = whole.replace(/^0+(?=\d)/, '') || '0';
  return fraction === undefined ? cleanWhole : `${cleanWhole}.${fraction.slice(0, 8)}`;
}

function formatCurrencyAmount(value, currencyCode) {
  const currency = currencies[currencyCode];
  if (!Number.isFinite(value)) return '۰';
  return new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: currency.precision,
    minimumFractionDigits: 0,
  }).format(value);
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
          <a href="#/buy-sell">خرید و فروش</a>
          <a href="#/markets">بازارها</a>
          <a href="#/services">خدمات بیت۲۴</a>
          <div className="nav-dropdown">
            <a className="nav-dropdown-trigger" href="#/trade" aria-haspopup="true">معامله <ChevronDown size={14} /></a>
            <div className="nav-dropdown-menu" role="menu">
              <a href="#/trade/spot" role="menuitem"><span className="nav-menu-icon"><LineChart size={17} /></span><span><strong>اسپات</strong><small>سفارش‌گذاری حرفه‌ای</small></span></a>
              <a href="#/trade/leverage" role="menuitem"><span className="nav-menu-icon"><TrendingUp size={17} /></span><span><strong>اهرم‌دار</strong><small>اهرم تا ۵۰X</small></span></a>
              <a href="#/trade/bots" role="menuitem"><span className="nav-menu-icon"><Bot size={17} /></span><span><strong>ربات‌های معامله‌گر</strong><small>اجرای منظم استراتژی‌ها</small></span></a>
            </div>
          </div>
          <a href="#/blog">وبلاگ</a>
          <a href="#/analysis">تحلیل</a>
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
          <a href="#/buy-sell" onClick={onClose}>خرید و فروش</a>
          <a href="#/markets" onClick={onClose}>بازارها</a>
          <a href="#/services" onClick={onClose}>خدمات بیت۲۴</a>
          <div className="mobile-trade-group">
            <span className="mobile-trade-title">معامله</span>
            <a href="#/trade/spot" onClick={onClose}>اسپات</a>
            <a href="#/trade/leverage" onClick={onClose}>اهرم‌دار</a>
            <a href="#/trade/bots" onClick={onClose}>ربات‌های معامله‌گر</a>
          </div>
          <a href="#/blog" onClick={onClose}>وبلاگ</a>
          <a href="#/analysis" onClick={onClose}>تحلیل</a>
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className={`currency-select ${open ? 'is-open' : ''}`} ref={rootRef}>
      <span className="sr-only">{label}</span>
      <button className={`currency-trigger ${open ? 'open' : ''}`} type="button" onClick={() => setOpen((current) => !current)} aria-label={label} aria-haspopup="listbox" aria-expanded={open}>
        <span className="currency-trigger-copy"><span className="currency-symbol">{item.mark}</span><span><strong>{item.code}</strong><small>{item.label}</small></span></span>
        <ChevronDown size={15} />
      </button>
      {open && <div className="currency-menu" role="listbox" aria-label={label}>
        {Object.values(currencies).map((currency) => <button className={`currency-option ${currency.code === value ? 'active' : ''}`} type="button" role="option" aria-selected={currency.code === value} key={currency.code} onClick={() => { onChange(currency.code); setOpen(false); }}>
          <span className="currency-symbol">{currency.mark}</span><span className="currency-option-copy"><strong>{currency.code}</strong><small>{currency.label}</small></span>{currency.code === value && <Check size={16} />}
        </button>)}
      </div>}
    </div>
  );
}

function Converter() {
  const [from, setFrom] = useState('IRT');
  const [to, setTo] = useState('USDT');
  const [amount, setAmount] = useState('10000000');
  const numericAmount = Number(amount) || 0;
  const recipient = useMemo(() => {
    return numericAmount * currencies[from].usdtValue / currencies[to].usdtValue;
  }, [from, to, numericAmount]);
  const exchangeRate = currencies[to].usdtValue / currencies[from].usdtValue;
  const recipientDisplay = numericAmount > 0 ? formatCurrencyAmount(recipient, to) : '۰';
  const exchangeRateDisplay = formatCurrencyAmount(exchangeRate, from);
  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="converter-card" id="convert">
      <div className="converter-topline"><span className="live-dot" /> نرخ تبدیل شفاف</div>
      <div className="converter-fields">
        <div className="money-field">
          <div className="field-label"><span>پرداخت می‌کنید</span><span className="field-hint">قیمت نهایی</span></div>
          <div className="money-input-wrap"><input dir="ltr" inputMode="decimal" value={amount} onChange={(event) => setAmount(normalizeAmount(event.target.value))} aria-label="مبلغ پرداخت" /><CurrencySelect value={from} onChange={setFrom} label="ارز پرداخت" /></div>
        </div>
        <button className="swap-button" type="button" onClick={swap} aria-label="جابه‌جایی ارزها"><ArrowUpLeft size={19} /></button>
        <div className="money-field recipient-field">
          <div className="field-label"><span>دریافت می‌کنید</span><span className="field-hint success-hint">واریز سریع</span></div>
          <div className="money-input-wrap"><output className="money-output" dir="ltr" aria-live="polite">{recipientDisplay}</output><CurrencySelect value={to} onChange={setTo} label="ارز دریافتی" /></div>
        </div>
      </div>
      <div className="converter-summary">
        <span>کارمزد معامله <strong>۰٪</strong></span>
        <span>نرخ تبدیل <strong>۱ {to} ≈ {exchangeRateDisplay} {from}</strong></span>
      </div>
      <a className="primary-button converter-cta" href="#signup">شروع خرید <ArrowLeft size={18} /></a>
      <p className="converter-note">قیمت نمایش‌داده‌شده، قیمت نهایی معامله است.</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-grid page-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> صرافی ارز دیجیتال بیت۲۴</div>
          <h1>خرید و فروش ارز دیجیتال،<br /><em>امن و آسان.</em></h1>
          <p className="hero-description">بیت۲۴ پلتفرم خرید و فروش ارز دیجیتال با امکان معامله سریع، امن و پشتیبانی ۲۴ ساعته است.</p>
          <div className="hero-actions"><a className="primary-button large" href="#signup">ورود یا ثبت‌نام <ArrowLeft size={20} /></a><a className="text-link" href="#markets">قیمت‌ها را ببینید <ChevronLeft size={18} /></a></div>
          <div className="hero-assurance"><ShieldCheck size={17} /><span>فرایندی شفاف از انتخاب تا تسویه</span></div>
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

function CryptoLogoRibbon() {
  const firstRow = cryptoLogos.slice(0, 7);
  const secondRow = cryptoLogos.slice(6).concat(cryptoLogos.slice(0, 6));
  return <section className="crypto-ribbon" aria-label="ارزهای دیجیتال بیت۲۴"><div className="page-shell crypto-ribbon-head"><div><div className="section-kicker">یک بازار، انتخاب‌های بیشتر</div><h2>دنیای رمزارزها<br /><em>همیشه در حرکت است.</em></h2></div></div><div className="crypto-ribbon-stage"><div className="crypto-ribbon-fade fade-right" /><div className="crypto-ribbon-fade fade-left" /><div className="crypto-logo-row row-forward" data-direction="forward">{firstRow.concat(firstRow).map((coin, index) => <a className={`crypto-logo-card ${coin.tone}`} href={`#/markets?asset=${coin.code}`} key={`top-${coin.code}-${index}`}><span className="crypto-logo-image"><img src={`/bit24wiseclone/assets/coins/${coin.file}.png`} alt="" /></span><span><strong>{coin.code}</strong><small>{coin.name}</small></span></a>)}</div><div className="crypto-logo-row row-reverse" data-direction="reverse">{secondRow.concat(secondRow).map((coin, index) => <a className={`crypto-logo-card ${coin.tone}`} href={`#/markets?asset=${coin.code}`} key={`bottom-${coin.code}-${index}`}><span className="crypto-logo-image"><img src={`/bit24wiseclone/assets/coins/${coin.file}.png`} alt="" /></span><span><strong>{coin.code}</strong><small>{coin.name}</small></span></a>)}</div></div></section>;
}

function Markets() {
  const [tab, setTab] = useState('hot');
  const tabs = { hot: 'داغ‌ترین‌ها', gainers: 'بیشترین رشد', new: 'جدیدها' };
  const rows = tab === 'gainers' ? [...marketRows].reverse() : tab === 'new' ? marketRows.map((row, index) => ({ ...row, code: ['ARB', 'XRP', 'SOL', 'BTC'][index], name: ['آربیتروم', 'ریپل', 'سولانا', 'بیت‌کوین'][index], change: `+${index + 2}٫${index + 1}٪`, trend: 'up' })) : marketRows;
  return (
    <section className="section page-shell" id="markets">
      <div className="section-head"><div><div className="section-kicker">قیمت لحظه‌ای ارزها</div><h2>نبض بازار را <em>دنبال کنید.</em></h2></div><a className="outline-button" href="#all-markets">مشاهده همه ارزها <ArrowLeft size={17} /></a></div>
      <div className="market-panel"><div className="market-tabs">{Object.entries(tabs).map(([key, label]) => <button className={tab === key ? 'active' : ''} type="button" key={key} onClick={() => setTab(key)}>{label}</button>)}</div><div className="market-list">{rows.map((row) => <a href={`#${row.code.toLowerCase()}`} className="market-row" key={`${tab}-${row.code}`}><div className="asset-name"><CoinBadge coin={row} /><span><strong>{row.code}</strong><small>{row.name}</small></span></div><span className="asset-price">{row.price}<small> USDT</small></span><span className={`asset-change ${row.trend}`}>{row.change}</span><ChevronLeft className="row-arrow" size={18} /></a>)}</div></div>
    </section>
  );
}

function Services() {
  const services = [
    { number: '۰۱', title: 'اسپات', body: 'بیشترین تنوع ابزارهای سفارش‌گذاری بازار اسپات در ایران.', tone: 'blue', icon: '⌁', href: '#/trade/spot' },
    { number: '۰۲', title: 'اهرم‌دار', body: 'خرید و فروش ارزهای دیجیتال تا اهرم ۵۰X و امکان تنظیم حد سود و ضرر برای مدیریت ریسک.', tone: 'ink', icon: '◒', href: '#/trade/leverage' },
    { number: '۰۳', title: 'ربات‌های معامله‌گر', body: 'استراتژی معاملاتی خود را منظم‌تر اجرا کنید و بازار را شبانه‌روزی زیر نظر داشته باشید.', tone: 'soft', icon: '⌁', href: '#/trade/bots' },
  ];
  return <section className="section services-section" id="trade"><div className="page-shell"><div className="section-head"><div><div className="section-kicker">سه مسیر برای معامله</div><h2>روش معامله‌تان را<br /><em>خودتان انتخاب کنید.</em></h2></div><p className="section-intro">از سفارش‌گذاری حرفه‌ای تا اجرای منظم استراتژی‌ها، ابزار مناسب خود را پیدا کنید.</p></div><div className="service-grid">{services.map((service) => <a className={`service-card ${service.tone} visual-pattern`} href={service.href} key={service.number}><span className="pattern-layer" aria-hidden="true" /><div className="service-number">{service.number}</div><div className="service-icon">{service.icon}</div><h3>{service.title}</h3><p>{service.body}</p><span className="service-link">ورود به بخش <ArrowLeft size={17} /></span></a>)}</div></div></section>;
}

function Trust() {
  return <section className="trust-section" id="trust"><div className="page-shell trust-grid"><div className="trust-copy"><div className="section-kicker">بیت۲۴؛ صرافی ارز دیجیتال امن و قابل اعتماد</div><h2>آسودگی خیال،<br /><em>بخشی از تجربه‌ی شماست.</em></h2><p>کنترل‌های امنیتی، عبارت ضد فیشینگ و محدودسازی برداشت کمک می‌کنند حساب‌تان را مطابق نیاز خود مدیریت کنید.</p><a className="text-link light-link" href="#security">جزئیات امنیت بیت۲۴ <ArrowLeft size={18} /></a></div><div className="trust-points"><div className="trust-point"><span className="trust-icon"><ShieldCheck size={21} /></span><div><h3>ذخیره‌سازی امن دارایی‌ها</h3><p>دارایی‌های رمزارزی با ترکیبی از کیف‌پول‌های سرد و گرم، ایمن و در دسترس نگهداری می‌شوند.</p></div></div><div className="trust-point"><span className="trust-icon"><Clock3 size={21} /></span><div><h3>کنترل‌های امنیتی پیشرفته</h3><p>رمز تراکنش، عبارت ضد فیشینگ و تأیید دومرحله‌ای را مطابق نیاز خود فعال کنید.</p></div></div><div className="trust-point"><span className="trust-icon"><Zap size={21} /></span><div><h3>برداشت با آدرس امن</h3><p>برداشت دارایی را به آدرس‌های مورد اعتماد خود محدود کنید و کنترل بیشتری داشته باشید.</p></div></div></div></div></section>;
}

function Insights() {
  return <section className="insights-section page-shell" id="blog"><div className="section-head"><div><div className="section-kicker">وبلاگ و تحلیل‌های بیت۲۴</div><h2>قبل از معامله،<br /><em>بیشتر بدانید.</em></h2></div><p className="section-intro">خبرها، آموزش‌ها و نگاه تحلیلی به بازار را در دو مسیر مجزا دنبال کنید.</p></div><div className="insights-grid"><a className="insight-card insight-featured" href="#blog"><div className="insight-visual blog-visual visual-pattern"><span className="pattern-layer" aria-hidden="true" /><span className="visual-word">BLOG</span><span className="visual-stamp">BIT24 / ۰۱</span><span className="visual-orb orb-one" /><span className="visual-orb orb-two" /></div><div className="insight-content"><div className="insight-meta"><span>وبلاگ</span><span>اخبار و آموزش</span></div><h3>راهنماها، خبرهای مهم و نکته‌های کاربردی برای شناخت بهتر بازار.</h3><span className="insight-link">رفتن به وبلاگ <ArrowLeft size={17} /></span></div></a><a className="insight-card insight-analysis" id="analysis" href="#analysis"><div className="insight-visual analysis-visual visual-pattern"><span className="pattern-layer" aria-hidden="true" /><span className="analysis-chart"><i /><i /><i /><i /><i /></span><span className="analysis-badge">LIVE<br />MARKET</span></div><div className="insight-content"><div className="insight-meta"><span>تحلیل‌ها</span><span>روزانه</span></div><h3>روندهای بازار و تحلیل‌های تکنیکال و فاندامنتال را بررسی کنید.</h3><span className="insight-link">مشاهده تحلیل‌ها <ArrowLeft size={17} /></span></div></a></div></section>;
}

function Footer() {
  return <footer className="site-footer"><div className="page-shell footer-grid"><div><Logo /><p>قیمت‌های لحظه‌ای، ابزارهای متنوع و مدیریت ساده‌ی دارایی در یک حساب.</p></div><div><h3>بیت۲۴</h3><a href="#/markets">بازارها</a><a href="#/services">خدمات</a><a href="#/trade">معامله</a></div><div><h3>مطالب</h3><a href="#/blog">وبلاگ</a><a href="#/analysis">تحلیل‌ها</a><a href="#/blog">سوالات متداول</a></div><div><h3>شروع کنید</h3><a className="footer-cta" href="#signup">ورود یا ثبت‌نام <ArrowLeft size={16} /></a><span className="footer-note">نسخه‌ی مفهومی برای بررسی UI</span></div></div><div className="page-shell footer-bottom"><span>© بیت۲۴ — تمامی حقوق محفوظ است.</span><span>طراحی مفهومی با الهام از الگوهای شفاف و انسان‌محور</span></div></footer>;
}

function PageIntro({ eyebrow, title, description, action, tone = 'blue' }) {
  return <div className={`inner-page-intro ${tone}`}><div className="page-shell"><div className="section-kicker">{eyebrow}</div><h1>{title}</h1><p>{description}</p>{action && <a className="primary-button large" href={action.href}>{action.label} <ArrowLeft size={20} /></a>}</div></div>;
}

function BuySellPage() {
  const steps = [
    { number: '۰۱', title: 'ارز و مقدار را انتخاب کنید', body: 'ارز دیجیتال مورد نظر و مقدار خرید یا فروش را مشخص کنید.' },
    { number: '۰۲', title: 'قیمت نهایی را ببینید', body: 'جزئیات سفارش و قیمت نهایی را پیش از تأیید بررسی کنید.' },
    { number: '۰۳', title: 'سفارش را تأیید کنید', body: 'پس از تأیید، دریافت ارز دیجیتال یا تسویه را دنبال کنید.' },
  ];
  return <div className="inner-page"><PageIntro eyebrow="خرید و فروش آنی" title={<>خرید و فروش ارز دیجیتال<br /><em>در چند قدم ساده.</em></>} description="خرید و فروش آنی بیش از ۱۰۸۸ ارز دیجیتال؛ با نمایش قیمت نهایی و فرایندی روشن." action={{ href: '#signup', label: 'شروع خرید و فروش' }} /><section className="page-shell inner-section buy-workspace"><div className="workspace-tabs"><button className="active" type="button">خرید</button><button type="button">فروش</button><button type="button">تبدیل</button></div><Converter /><div className="workspace-foot"><span><Check size={16} /> قیمت‌ها پیش از نهایی‌سازی نمایش داده می‌شوند.</span><span><WalletCards size={16} /> کیف‌پول امن و اختصاصی</span></div></section><section className="page-shell inner-section"><div className="section-head"><div><div className="section-kicker">فرایندی کوتاه و قابل فهم</div><h2>از انتخاب ارز تا دریافت،<br /><em>همه‌چیز روشن است.</em></h2></div></div><div className="step-grid">{steps.map((step) => <div className="step-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></div>)}</div></section></div>;
}

function MarketsPage() {
  const [search, setSearch] = useState('');
  const filtered = marketRows.filter((row) => `${row.code} ${row.name}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="inner-page"><PageIntro eyebrow="بازارها" title={<>قیمت لحظه‌ای ارزها،<br /><em>در یک نگاه.</em></>} description="بازار را رصد کنید، تغییرات را مقایسه کنید و دارایی مورد نظرتان را سریع‌تر پیدا کنید." /><section className="page-shell inner-section"><div className="market-dashboard-head"><div><div className="section-kicker">دیده‌بان بازار</div><h2>انتخاب بعدی‌تان را<br /><em>با داده شروع کنید.</em></h2></div><div className="market-tools"><label className="market-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی ارز" aria-label="جست‌وجوی ارز" /></label><button className="filter-button" type="button"><Filter size={17} /> فیلترها</button></div></div><div className="market-kpis"><div><span>ارزهای بیت۲۴</span><strong>۱۰۸۸ ارز</strong></div><div><span>تغییرات ۲۴ ساعت</span><strong className="negative">-۰٫۷۴٪</strong></div><div><span>تسلط بیت‌کوین</span><strong>۵۸٪</strong></div><div><span>آخرین به‌روزرسانی</span><strong>همین حالا</strong></div></div><div className="full-market-table"><div className="full-market-row table-header"><span>دارایی</span><span>آخرین قیمت</span><span>تغییر ۲۴ ساعت</span><span>عملیات</span></div>{filtered.map((row) => <a className="full-market-row" href="#/buy-sell" key={row.code}><span className="asset-name"><CoinBadge coin={row} /><b>{row.name}<small>{row.code}</small></b></span><strong className="market-number">{row.price} <small>IRT</small></strong><b className={row.trend}>{row.change}</b><span className="row-action">خرید و فروش <ChevronLeft size={16} /></span></a>)}{filtered.length === 0 && <div className="empty-state">ارزی با این عبارت پیدا نشد.</div>}</div></section></div>;
}

function ServicesPage() {
  const services = [
    { icon: WalletCards, title: 'خرید و فروش آنی', text: 'خرید یا فروش سریع ارز دیجیتال با قیمت نهایی و بدون کارمزد مجزا.', tone: 'blue' },
    { icon: LineChart, title: 'معامله اسپات', text: 'بیشترین تنوع ابزارهای سفارش‌گذاری بازار اسپات در ایران.', tone: 'light' },
    { icon: TrendingUp, title: 'معامله اهرم‌دار', text: 'اهرم تا ۵۰X، همراه با ابزارهای مدیریت ریسک و تنظیم حد سود و ضرر.', tone: 'dark' },
    { icon: BarChart3, title: 'پرتفوی سود و ضرر', text: 'میزان سود یا ضرر دارایی‌های خود را لحظه‌به‌لحظه پیگیری و مدیریت کنید.', tone: 'soft' },
    { icon: Sparkles, title: 'بیت‌گیفت', text: 'در مناسبت‌های مختلف، ارز دیجیتال را به عزیزان خود هدیه دهید.', tone: 'blue' },
    { icon: Globe2, title: 'تنوع ارزی بالا', text: 'با پشتیبانی از بیش از ۱۰۸۸ ارز دیجیتال، انتخاب‌های بیشتری داشته باشید.', tone: 'light' },
  ];
  return <div className="inner-page"><PageIntro eyebrow="خدمات بیت۲۴" title={<>یک حساب،<br /><em>چند مسیر برای معامله.</em></>} description="از خرید ساده تا ابزارهای حرفه‌ای، خدمات بیت۲۴ برای نیازهای مختلف شما آماده است." /><section className="page-shell inner-section"><div className="section-head"><div><div className="section-kicker">ابزارهای مورد نیاز شما</div><h2>هر خدمت، برای<br /><em>یک تصمیم بهتر.</em></h2></div></div><div className="service-directory">{services.map(({ icon: Icon, title, text, tone }) => <a className={`directory-card ${tone} visual-pattern`} href="#/buy-sell" key={title}><span className="pattern-layer" aria-hidden="true" /><Icon size={25} /><h3>{title}</h3><p>{text}</p><span className="service-link">مشاهده خدمت <ArrowLeft size={17} /></span></a>)}</div></section></div>;
}

const tradeLandings = {
  spot: {
    eyebrow: 'معامله اسپات',
    title: <>بازار حرفه‌ای،<br /><em>کنترل در دستان شما.</em></>,
    description: 'بیشترین تنوع ابزارهای سفارش‌گذاری بازار اسپات در ایران؛ برای تصمیم‌گیری دقیق‌تر و اجرای منظم‌تر.',
    accent: 'blue',
    icon: LineChart,
    features: [
      ['سفارش لیمیت', 'قیمت ورود و خروج را خودتان تعیین کنید.'],
      ['قیمت بازار', 'سفارش را با بهترین قیمت لحظه‌ای اجرا کنید.'],
      ['حد سود و ضرر', 'برای سناریوهای مختلف معامله، خروج مشخص داشته باشید.'],
      ['OCO و حد ضرر متحرک', 'مدیریت سفارش را با ابزارهای پیشرفته‌تر ادامه دهید.'],
    ],
  },
  leverage: {
    eyebrow: 'معامله اهرم‌دار',
    title: <>قدرت بیشتر برای<br /><em>سناریوهای بزرگ‌تر.</em></>,
    description: 'خرید و فروش ارزهای دیجیتال تا اهرم ۵۰X، همراه با ابزارهای مدیریت ریسک و تنظیم حد سود و ضرر.',
    accent: 'dark',
    icon: TrendingUp,
    features: [
      ['اهرم تا ۵۰X', 'با سرمایه کمتر، قدرت معامله‌ی بیشتری در اختیار داشته باشید.'],
      ['وجه تضمین شفاف', 'مقدار وجه تضمین و کارمزد تقریبی را پیش از سفارش ببینید.'],
      ['حد سود و حد ضرر', 'ریسک موقعیت را با نقاط خروج از پیش مشخص‌شده مدیریت کنید.'],
      ['هشدار ریسک', 'پیش از شروع، سازوکار اهرم و پیامدهای آن را بشناسید.'],
    ],
  },
  bots: {
    eyebrow: 'ربات‌های معامله‌گر',
    title: <>استراتژی‌تان را<br /><em>منظم اجرا کنید.</em></>,
    description: 'ربات‌های معامله‌گر برای اجرای پیوسته‌ی استراتژی‌ها و کاهش تصمیم‌های احساسی در بازار طراحی شده‌اند.',
    accent: 'soft',
    icon: Bot,
    features: [
      ['اجرای خودکار', 'قواعد استراتژی را تعریف کنید و اجرای آن را به ربات بسپارید.'],
      ['ربات اسپات گرید', 'خرید و فروش پله‌ای را در یک بازه‌ی مشخص دنبال کنید.'],
      ['اینفینیتی گرید', 'استراتژی گرید را با انعطاف بیشتر برای بازار دنبال کنید.'],
      ['اسمارت ریبالانس', 'ترکیب دارایی‌ها را طبق برنامه‌ی معاملاتی خود متعادل کنید.'],
    ],
  },
};

function TradeLanding({ type }) {
  const landing = tradeLandings[type];
  const Icon = landing.icon;
  return <div className={`inner-page trade-landing trade-${type}`}><PageIntro eyebrow={landing.eyebrow} title={landing.title} description={landing.description} action={{ href: '#signup', label: 'شروع معامله' }} tone={landing.accent} /><section className="page-shell inner-section trade-overview"><div className="trade-visual visual-pattern"><span className="pattern-layer" aria-hidden="true" /><div className="trade-visual-orbit orbit-a" /><div className="trade-visual-orbit orbit-b" /><Icon size={78} strokeWidth={1.15} /><span className="trade-visual-label">BIT24 / TRADE</span></div><div className="trade-overview-copy"><div className="section-kicker">ابزارهایی برای تصمیم بهتر</div><h2>{type === 'spot' ? <><span>هر سفارش،</span><br /><em>با کنترل بیشتر.</em></> : type === 'leverage' ? <><span>قبل از هر موقعیت،</span><br /><em>ریسک را ببینید.</em></> : <><span>بازار را دنبال کنید،</span><br /><em>نه هیجان را.</em></>}</h2><p>{type === 'spot' ? 'در بازار اسپات بیت۲۴، انواع سفارش‌ها و ابزارهای کنترل معامله را در یک محیط منظم کنار هم داشته باشید.' : type === 'leverage' ? 'اهرم می‌تواند فرصت و ریسک را هم‌زمان بزرگ‌تر کند؛ ابزارهای مدیریت موقعیت را آگاهانه به کار بگیرید.' : 'ربات‌ها قرار نیست جای تصمیم شما را بگیرند؛ کمک می‌کنند استراتژی‌تان منظم‌تر و پیوسته‌تر اجرا شود.'}</p><a className="text-link" href="#/trade/spot-terminal">ورود به محیط معامله <ArrowLeft size={18} /></a></div></section><section className="section trade-features-section"><div className="page-shell"><div className="section-head"><div><div className="section-kicker">ویژگی‌های این مسیر</div><h2>آنچه در اختیار<br /><em>شماست.</em></h2></div><p className="section-intro">هر ابزار با هدف ساده‌کردن تصمیم‌گیری و روشن‌ترشدن فرایند معامله طراحی شده است.</p></div><div className="trade-feature-grid">{landing.features.map(([title, text], index) => <div className="trade-feature" key={title}><span>۰{index + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></div></section><section className="page-shell trade-cta-band"><div><div className="section-kicker">آماده‌اید؟</div><h2>مسیر خود را انتخاب کنید<br /><em>و شروع کنید.</em></h2></div><a className="primary-button large" href="#/buy-sell">ورود به بازار <ArrowLeft size={20} /></a></section></div>;
}

const blogPosts = [
  { category: 'امنیت', title: 'چگونه حساب خود را امن‌تر کنیم؟', excerpt: 'لورم ایپسوم فارسی؛ چند نکته‌ی کاربردی برای شناخت بهتر تنظیمات امنیتی و مدیریت دسترسی‌ها.', tone: 'blue' },
  { category: 'آموزشی', title: 'بازار اسپات چیست و چگونه کار می‌کند؟', excerpt: 'لورم ایپسوم فارسی؛ مروری کوتاه بر سفارش‌گذاری، قیمت بازار و تفاوت معامله‌ی آنی با بازار اسپات.', tone: 'light' },
  { category: 'راهنما', title: 'آشنایی با انواع سفارش در بازار', excerpt: 'لورم ایپسوم فارسی؛ انتخاب نوع سفارش مناسب می‌تواند مسیر معامله را دقیق‌تر و منظم‌تر کند.', tone: 'dark' },
  { category: 'رمزارزها', title: 'تتر چیست و چه کاربردی دارد؟', excerpt: 'لورم ایپسوم فارسی؛ نکات مهمی که پیش از نگهداری یا انتقال یک استیبل‌کوین باید بدانید.', tone: 'soft' },
  { category: 'آموزشی', title: 'مدیریت ریسک در معاملات اهرم‌دار', excerpt: 'لورم ایپسوم فارسی؛ اهرم فرصت بیشتری ایجاد می‌کند، اما به برنامه و کنترل ریسک نیاز دارد.', tone: 'light' },
  { category: 'بازار', title: 'چطور روند بازار را بهتر دنبال کنیم؟', excerpt: 'لورم ایپسوم فارسی؛ داده‌های قیمت، حجم و خبرها را کنار هم بگذارید و عجولانه تصمیم نگیرید.', tone: 'blue' },
];

function EditorialPage({ mode = 'blog' }) {
  const analysis = mode === 'analysis';
  const posts = analysis ? blogPosts.map((post, index) => ({ ...post, category: ['تکنیکال', 'فاندامنتال', 'آن‌چین', 'احساسات بازار', 'تکنیکال', 'فاندامنتال'][index], title: ['روند کوتاه‌مدت بیت‌کوین؛ حمایت‌ها و مقاومت‌ها', 'چشم‌انداز اتریوم با نگاهی به داده‌های شبکه', 'بررسی جریان نقدینگی در بازار رمزارزها', 'شاخص ترس و طمع چه می‌گوید؟', 'تحلیل ساختار بازار و سناریوهای پیش رو', 'ترکیب تحلیل‌ها برای تصمیم‌گیری بهتر'][index] })) : blogPosts;
  return <div className="inner-page editorial-page"><PageIntro eyebrow={analysis ? 'تحلیل‌های بیت۲۴' : 'وبلاگ بیت۲۴'} title={analysis ? <>روندها را بررسی کنید،<br /><em>نه حدس‌ها را.</em></> : <>دانش بیشتر،<br /><em>تصمیم بهتر.</em></>} description={analysis ? 'تحلیل‌های تکنیکال، فاندامنتال و آن‌چین را برای درک بهتر شرایط بازار دنبال کنید.' : 'با خبرها، آموزش‌ها و مقالات کاربردی در دنیای رمزارزها همراه شوید.'} /><section className="page-shell inner-section"><div className="editorial-toolbar"><div className="editorial-tabs"><button className="active" type="button">همه</button><button type="button">آموزشی</button><button type="button">بازار</button><button type="button">امنیت</button></div><label className="market-search"><Search size={17} /><input placeholder="جست‌وجو در مطالب" aria-label="جست‌وجو در مطالب" /></label></div><div className="editorial-grid">{posts.map((post, index) => <a className={`editorial-card ${post.tone} visual-pattern ${index === 0 ? 'featured' : ''}`} href={analysis ? '#/analysis/article' : '#/blog/article'} key={`${post.category}-${post.title}`}><span className="pattern-layer" aria-hidden="true" /><div className="editorial-visual"><span className="editorial-number">۰{index + 1}</span><BookOpen size={34} /><span className="editorial-shape" /></div><div className="editorial-card-body"><div className="insight-meta"><span>{post.category}</span><span>{analysis ? 'تحلیل' : '۵ دقیقه مطالعه'}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><span className="insight-link">ادامه مطلب <ArrowLeft size={17} /></span></div></a>)}</div></section></div>;
}

function InnerPageRouter() {
  const path = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (path === 'buy-sell') return <BuySellPage />;
  if (path === 'markets') return <MarketsPage />;
  if (path === 'services') return <ServicesPage />;
  if (path === 'trade/spot-terminal') return <SpotTerminalPage />;
  if (path === 'trade/spot') return <TradeLanding type="spot" />;
  if (path === 'trade/leverage') return <TradeLanding type="leverage" />;
  if (path === 'trade/bots') return <TradeLanding type="bots" />;
  if (path === 'trade') return <Services />;
  if (path === 'blog' || path.startsWith('blog/')) return <EditorialPage />;
  if (path === 'analysis' || path.startsWith('analysis/')) return <EditorialPage mode="analysis" />;
  return null;
}

function useScrollShift() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frame = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return scrollY;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [route, setRoute] = useState(window.location.hash);
  const scrollY = useScrollShift();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('bit24wise-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1726' : '#0072ff');
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const innerPage = route.startsWith('#/');
  return <><Header theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onMenu={() => setMenuOpen(true)} /><MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} /><main style={{ '--ribbon-scroll': `${scrollY}px` }}>{innerPage ? <InnerPageRouter /> : <><Hero /><Stats /><CryptoLogoRibbon /><Markets /><Services /><Trust /><Insights /></>}</main><Footer /></>;
}

createRoot(document.getElementById('root')).render(<App />);
