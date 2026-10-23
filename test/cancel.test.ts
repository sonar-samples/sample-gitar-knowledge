import { afterEach, before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.ts';
import { resetClock, setClock } from '../src/lib/clock.ts';
import { getOrder, resetStore, saveOrder } from '../src/store.ts';

let server: Server;
let base: string;

before(async () => {
  server = createApp();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

beforeEach(() => {
  resetStore();
  setClock(() => new Date('2026-01-15T12:00:00.000Z'));
});

afterEach(() => {
  resetClock();
});

const seed = (id: string, status: 'pending' | 'shipped') =>
  saveOrder({ id, items: [{ sku: 'A-1', quantity: 1 }], status, createdAt: '2026-01-15T11:00:00.000Z' });

describe('POST /orders/:id/cancel', () => {
  it('cancels a pending order and records cancelledAt', async () => {
    seed('ord_x', 'pending');
    const res = await fetch(`${base}/orders/ord_x/cancel`, { method: 'POST' });
    assert.equal(res.status, 200);
    assert.equal(getOrder('ord_x')?.status, 'cancelled');
    assert.equal(getOrder('ord_x')?.cancelledAt, '2026-01-15T12:00:00.000Z');
  });

  it('returns 404 for an unknown order', async () => {
    const res = await fetch(`${base}/orders/missing/cancel`, { method: 'POST' });
    assert.equal(res.status, 404);
  });

  it('returns 409 for a shipped order', async () => {
    seed('ord_y', 'shipped');
    const res = await fetch(`${base}/orders/ord_y/cancel`, { method: 'POST' });
    assert.equal(res.status, 409);
  });
});
