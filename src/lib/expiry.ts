import { listOrders, saveOrder } from '../store.ts';
import type { Order } from '../types.ts';

const EXPIRY_MS = 30 * 60 * 1000;

export function isExpired(order: Order): boolean {
  if (order.status !== 'pending') return false;
  return Date.now() - new Date(order.createdAt).getTime() > EXPIRY_MS;
}

export function expireStaleOrders(): Order[] {
  const expired: Order[] = [];
  for (const order of listOrders()) {
    if (isExpired(order)) {
      order.status = 'expired';
      saveOrder(order);
      expired.push(order);
    }
  }
  return expired;
}
