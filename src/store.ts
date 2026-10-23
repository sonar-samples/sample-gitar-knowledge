import type { Order } from './types.ts';

const orders = new Map<string, Order>();
let seq = 0;

export function nextId(): string {
  seq += 1;
  return `ord_${String(seq).padStart(4, '0')}`;
}

export function saveOrder(order: Order): Order {
  orders.set(order.id, order);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function listOrders(): Order[] {
  return [...orders.values()];
}

export function resetStore(): void {
  orders.clear();
  seq = 0;
}
