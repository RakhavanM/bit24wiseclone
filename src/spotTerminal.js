export const spotSymbols = [
  { code: 'BTC/USDT', base: 'BTC', quote: 'USDT', name: 'بیت‌کوین', price: 62911.05, change: 1.28, icon: '₿', tone: 'coin-btc' },
  { code: 'ETH/USDT', base: 'ETH', quote: 'USDT', name: 'اتریوم', price: 1875.42, change: -0.58, icon: 'Ξ', tone: 'coin-eth' },
  { code: 'SOL/USDT', base: 'SOL', quote: 'USDT', name: 'سولانا', price: 74.89, change: 2.14, icon: 'S', tone: 'coin-sol' },
  { code: 'XRP/USDT', base: 'XRP', quote: 'USDT', name: 'ریپل', price: 0.5284, change: 0.74, icon: 'X', tone: 'coin-xrp' },
  { code: 'BNB/USDT', base: 'BNB', quote: 'USDT', name: 'بایننس‌کوین', price: 589.26, change: -0.32, icon: 'B', tone: 'coin-bnb' },
  { code: 'TRX/USDT', base: 'TRX', quote: 'USDT', name: 'ترون', price: 0.1127, change: 0.41, icon: 'T', tone: 'coin-trx' },
  { code: 'USDT/IRT', base: 'USDT', quote: 'IRT', name: 'تتر', price: 186960, change: -0.03, icon: '₮', tone: 'coin-usdt' },
  { code: 'BTC/IRT', base: 'BTC', quote: 'IRT', name: 'بیت‌کوین', price: 11765200000, change: 1.1, icon: '₿', tone: 'coin-btc' },
  { code: 'ETH/IRT', base: 'ETH', quote: 'IRT', name: 'اتریوم', price: 350600000, change: -0.42, icon: 'Ξ', tone: 'coin-eth' },
  { code: 'SOL/IRT', base: 'SOL', quote: 'IRT', name: 'سولانا', price: 14005000, change: 1.87, icon: 'S', tone: 'coin-sol' },
];

export const orderTypes = [
  { code: 'limit', label: 'محدود' },
  { code: 'market', label: 'بازار' },
  { code: 'stop', label: 'حد ضرر' },
];

export const defaultSpotAccount = {
  balances: { IRT: 500000000, USDT: 25000, BTC: 0.18, ETH: 3.2, SOL: 80, XRP: 2500, BNB: 4, TRX: 5000 },
  history: [],
  openOrders: [],
};

const round = (number, digits = 8) => Number(number.toFixed(digits));

export function createOrderBook(symbol, seed = 1) {
  const spread = symbol.price * 0.00018;
  const asks = Array.from({ length: 7 }, (_, index) => {
    const price = symbol.price + spread * (index + 1);
    const amount = round((0.018 + ((index * 13 + seed * 7) % 29) / 1000) * (symbol.price > 1000 ? 1 : 8), 8);
    return { id: `ask-${index}`, side: 'sell', price: round(price, symbol.price < 1 ? 6 : 2), amount, total: round(price * amount, 2) };
  }).reverse();
  const bids = Array.from({ length: 7 }, (_, index) => {
    const price = symbol.price - spread * (index + 1);
    const amount = round((0.021 + ((index * 17 + seed * 5) % 31) / 1000) * (symbol.price > 1000 ? 1 : 8), 8);
    return { id: `bid-${index}`, side: 'buy', price: round(price, symbol.price < 1 ? 6 : 2), amount, total: round(price * amount, 2) };
  });
  return { asks, bids, mid: symbol.price };
}

export function createRecentTrades(symbol, seed = 1) {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `trade-${symbol.code}-${seed}-${index}`,
    price: round(symbol.price * (1 + ((index % 3) - 1) * 0.00022), symbol.price < 1 ? 6 : 2),
    amount: round(0.008 + ((index * 7 + seed) % 21) / 1000, 6),
    side: index % 3 === 0 ? 'sell' : 'buy',
    time: `${String(12 + Math.floor(index / 3)).padStart(2, '0')}:${String(48 - index * 3).padStart(2, '0')}`,
  }));
}

export function executeMarketOrder({ side, symbol, amount, account, feeRate = 0.001, executionPrice = symbol.price }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return { ok: false, error: 'مقدار سفارش باید بیشتر از صفر باشد.' };
  const price = executionPrice;
  const gross = numericAmount * price;
  const fee = gross * feeRate;
  const quote = symbol.quote;
  const base = symbol.base;
  const next = structuredClone(account);
  if (side === 'buy') {
    if ((next.balances[quote] || 0) < gross + fee) return { ok: false, error: `موجودی ${quote} برای این سفارش کافی نیست.` };
    next.balances[quote] -= gross + fee;
    next.balances[base] = (next.balances[base] || 0) + numericAmount;
  } else {
    if ((next.balances[base] || 0) < numericAmount) return { ok: false, error: `موجودی ${base} برای این سفارش کافی نیست.` };
    next.balances[base] -= numericAmount;
    next.balances[quote] = (next.balances[quote] || 0) + gross - fee;
  }
  const fill = { id: `fill-${Date.now()}`, symbol: symbol.code, side, type: 'market', price, amount: numericAmount, total: gross, fee, status: 'filled', time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) };
  next.history = [fill, ...next.history].slice(0, 30);
  return { ok: true, account: next, fill };
}

export function placeLimitOrder({ side, symbol, price, amount, account, feeRate = 0.001 }) {
  const numericPrice = Number(price);
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0 || !Number.isFinite(numericAmount) || numericAmount <= 0) return { ok: false, error: 'قیمت و مقدار سفارش باید بیشتر از صفر باشند.' };
  const next = structuredClone(account);
  const quote = symbol.quote;
  const base = symbol.base;
  const reserve = numericPrice * numericAmount;
  const fee = reserve * feeRate;
  if (side === 'buy') {
    if ((next.balances[quote] || 0) < reserve + fee) return { ok: false, error: `موجودی ${quote} برای این سفارش کافی نیست.` };
    next.balances[quote] -= reserve + fee;
  } else {
    if ((next.balances[base] || 0) < numericAmount) return { ok: false, error: `موجودی ${base} برای این سفارش کافی نیست.` };
    next.balances[base] -= numericAmount;
  }
  const order = { id: `open-${Date.now()}`, symbol: symbol.code, side, type: 'limit', price: numericPrice, amount: numericAmount, total: reserve, fee, status: 'open' };
  next.openOrders = [order, ...next.openOrders];
  return { ok: true, account: next, order };
}

export function cancelSimulatedOrder({ account, orderId }) {
  const order = account.openOrders.find((item) => item.id === orderId);
  if (!order) return { ok: false, error: 'سفارش پیدا نشد.' };
  const next = structuredClone(account);
  const [base, quote] = order.symbol.split('/');
  if (order.side === 'buy') next.balances[quote] = (next.balances[quote] || 0) + order.total + order.fee;
  else next.balances[base] = (next.balances[base] || 0) + order.amount;
  next.openOrders = next.openOrders.filter((item) => item.id !== orderId);
  return { ok: true, account: next, order };
}
