import { apiFetch } from './client';
import type { Order, CreateOrderPayload } from '../types';

export const createOrder = (payload: CreateOrderPayload): Promise<Order> =>
  apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchOrder = (id: number): Promise<Order> =>
  apiFetch<Order>(`/orders/${id}`);
