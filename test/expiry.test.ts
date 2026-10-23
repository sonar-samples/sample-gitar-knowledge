import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { expireStaleOrders, isExpired } from '../src/lib/expiry.ts';
import { getOrder, resetStore, saveOrder } from '../src/store.ts';
import type { Order } from '../src/types.ts';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

const order = (id: string, createdAt: string, status: Order['status'] = 'pending'): Order => ({
  id,
  items: [{ sku: 'A-1', quantity: 1 }],
  status,
  createdAt,
});

beforeEach(() => resetStore());

describe('expiry', () => {
  it('treats pending orders older than 30 minutes as expired', () => {
    assert.equal(isExpired(order('a', minutesAgo(45))), true);
    assert.equal(isExpired(order('b', minutesAgo(5))), false);
    assert.equal(isExpired(order('c', minutesAgo(45), 'shipped')), false);
  });

  it('marks stale pending orders as expired', () => {
    saveOrder(order('old', minutesAgo(60)));
    saveOrder(order('new', minutesAgo(1)));
    const expired = expireStaleOrders();
    assert.deepEqual(expired.map((o) => o.id), ['old']);
    assert.equal(getOrder('old')?.status, 'expired');
    assert.equal(getOrder('new')?.status, 'pending');
  });
});
