import type { Router } from '../app.ts';
import { nowIso } from '../lib/clock.ts';
import { expireStaleOrders } from '../lib/expiry.ts';
import { sendError } from '../lib/http.ts';
import { getOrder, nextId, saveOrder } from '../store.ts';
import type { Order, OrderItem } from '../types.ts';

function parseItems(body: unknown): OrderItem[] | null {
  const items = (body as { items?: unknown } | undefined)?.items;
  if (!Array.isArray(items) || items.length === 0) return null;
  const valid = items.every(
    (i) => typeof i?.sku === 'string' && Number.isInteger(i?.quantity) && i.quantity > 0,
  );
  return valid ? (items as OrderItem[]) : null;
}

export function registerOrderRoutes(router: Router): void {
  router.get('/orders/:id', ({ params }, res) => {
    const order = getOrder(params.id);
    if (!order) return sendError(res, 404, 'order_not_found', 'Order not found');
    res.json(order);
  });

  router.post('/orders', ({ body }, res) => {
    const items = parseItems(body);
    if (!items) return sendError(res, 400, 'invalid_order', 'items must be a non-empty list of { sku, quantity }');
    const order: Order = { id: nextId(), items, status: 'pending', createdAt: nowIso() };
    saveOrder(order);
    res.status(201).json(order);
  });

  router.post('/orders/expire', (_ctx, res) => {
    const expired = expireStaleOrders();
    res.json({ expired: expired.map((o) => o.id) });
  });
}
