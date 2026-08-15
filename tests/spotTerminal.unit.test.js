import { describe, expect, it } from 'vitest';
import { createOrderBook, createRecentTrades, defaultSpotAccount, executeMarketOrder, spotSymbols } from '../src/spotTerminal.js';

describe('spot terminal simulation', () => {
  it('creates both sides of an order book around the selected price', () => {
    const book = createOrderBook(spotSymbols[0]);
    expect(book.asks).toHaveLength(7);
    expect(book.bids).toHaveLength(7);
    expect(book.asks.every((row) => row.price > spotSymbols[0].price)).toBe(true);
    expect(book.bids.every((row) => row.price < spotSymbols[0].price)).toBe(true);
  });

  it('creates recent trades with both buy and sell activity', () => {
    const trades = createRecentTrades(spotSymbols[0]);
    expect(trades).toHaveLength(8);
    expect(new Set(trades.map((trade) => trade.side))).toEqual(new Set(['buy', 'sell']));
  });

  it('fills a market buy and updates quote and base balances', () => {
    const result = executeMarketOrder({ side: 'buy', symbol: spotSymbols[0], amount: 0.01, account: defaultSpotAccount });
    expect(result.ok).toBe(true);
    expect(result.fill.status).toBe('filled');
    expect(result.account.balances.BTC).toBeCloseTo(0.19, 8);
    expect(result.account.balances.USDT).toBeLessThan(defaultSpotAccount.balances.USDT);
    expect(result.account.history).toHaveLength(1);
  });

  it('rejects an order when the selected balance is insufficient', () => {
    const result = executeMarketOrder({ side: 'sell', symbol: spotSymbols[0], amount: 2, account: defaultSpotAccount });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('BTC');
  });
});
