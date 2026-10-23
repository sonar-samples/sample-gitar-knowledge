export type OrderStatus = 'pending' | 'shipped' | 'cancelled' | 'expired';

export interface OrderItem {
  sku: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  cancelledAt?: string;
}
