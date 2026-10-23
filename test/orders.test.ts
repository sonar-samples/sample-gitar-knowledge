import { afterEach, before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.ts';
import { resetClock, setClock } from '../src/lib/clock.ts';
import { resetStore } from '../src/store.ts';

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

const post = (path: string, body: unknown) =>
  fetch(base + path, { method: 'POST', body: JSON.stringify(body) });

describe('health', () => {
  it('reports ok with the frozen time', async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok', time: '2026-01-15T12:00:00.000Z' });
  });
});

describe('orders', () => {
  it('creates and fetches an order', async () => {
    const created = await post('/orders', { items: [{ sku: 'A-1', quantity: 2 }] });
    assert.equal(created.status, 201);
    const order = (await created.json()) as { id: string; createdAt: string; status: string };
    assert.equal(order.status, 'pending');
    assert.equal(order.createdAt, '2026-01-15T12:00:00.000Z');

    const fetched = await fetch(`${base}/orders/${order.id}`);
    assert.equal(fetched.status, 200);
    assert.deepEqual(await fetched.json(), order);
  });

  it('rejects an invalid order with the error envelope', async () => {
    const res = await post('/orders', { items: [] });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'invalid_order');
  });

  it('returns 404 for an unknown order', async () => {
    const res = await fetch(`${base}/orders/nope`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), {
      error: { code: 'order_not_found', message: 'Order not found' },
    });
  });
});
