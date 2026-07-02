import { apiFetch } from './client';
import type { Order, CreateOrderPayload } from '../types';

export const createOrder = (payload: CreateOrderPayload): Promise<Order> =>
  apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const cancelOrder = (id: number, workStationId: number): Promise<Order> =>
  apiFetch<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'Canceled', workStationId }),
  });

export const fetchOrder = (id: number): Promise<Order> =>
  apiFetch<Order>(`/orders/${id}`);

export const fetchOrdersBySession = (sessionId: number): Promise<Order[]> =>
  apiFetch<Order[]>(`/orders/session/${sessionId}`);
