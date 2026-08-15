import { describe, expect, it } from 'vitest';
import { cancelSimulatedOrder, executeMarketOrder, placeLimitOrder, spotSymbols, defaultSpotAccount } from '../src/spotTerminal.js';

describe('spot terminal regressions', () => {
  it('places a limit buy only when quote balance covers the reserved order value', () => {
    const result = placeLimitOrder({ side: 'buy', symbol: spotSymbols[0], price: 62000, amount: 0.02, account: defaultSpotAccount });
    expect(result.ok).toBe(true);
    expect(result.account.openOrders).toHaveLength(1);
    expect(result.account.balances.USDT).toBeLessThan(defaultSpotAccount.balances.USDT);
  });

  it('rejects a limit order with insufficient balance and does not mutate the account', () => {
    const result = placeLimitOrder({ side: 'sell', symbol: spotSymbols[0], price: 62000, amount: 1, account: defaultSpotAccount });
    expect(result.ok).toBe(false);
    expect(result.account).toBeUndefined();
  });

  it('cancels a simulated open order and releases its reserved balance', () => {
    const placed = placeLimitOrder({ side: 'buy', symbol: spotSymbols[0], price: 62000, amount: 0.02, account: defaultSpotAccount });
    const cancelled = cancelSimulatedOrder({ account: placed.account, orderId: placed.order.id });
    expect(cancelled.ok).toBe(true);
    expect(cancelled.account.openOrders).toHaveLength(0);
    expect(cancelled.account.balances.USDT).toBeCloseTo(defaultSpotAccount.balances.USDT, 8);
  });

  it('executes a market order with the current best price and records a fill', () => {
    const result = executeMarketOrder({ side: 'buy', symbol: spotSymbols[1], amount: 0.1, account: defaultSpotAccount, executionPrice: 1876.2 });
    expect(result.ok).toBe(true);
    expect(result.fill.price).toBe(1876.2);
    expect(result.account.history[0].status).toBe('filled');
  });
});
