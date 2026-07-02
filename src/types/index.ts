export interface Category {
  id: number;
  name: string;
}

export interface ProductVariant {
  name: string;
  price?: number | null;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  price: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
  categoryId: number;
  categoryName: string;
  isPublished: boolean;
  variants: ProductVariant[];
}

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  cost: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
  categoryId?: number | null;
  categoryName: string;
  masterIds: number[];
}

export interface Workstation {
  id: number;
  name: string;
  description?: string | null;
}

export interface OrderItemRequest {
  positionId?: number;
  serviceId?: number;
  quantity: number;
  size?: string;
}

export interface CreateOrderPayload {
  workStationId: number;
  customer: string;
  note?: string;
  sessionId?: number;
  items: OrderItemRequest[];
}

export interface OrderItemDto {
  id: number;
  orderId: number;
  positionId?: number | null;
  positionName?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  size?: string | null;
}

export type OrderStatus = 'Pending' | 'InProgress' | 'Canceled' | 'Done';

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createTime: string;
  customer: string;
  note?: string | null;
  workStationId: number;
  workStationName: string;
  orderItems: OrderItemDto[];
}

export interface KioskSettings {
  idleTimeoutSec: number;
  wifiSsid: string;
  wifiPassword: string;
}

export interface Ad {
  id: number;
  name: string;
  imageUrl: string;
}

export interface AdSlide {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  bg: string;
  fg: string;
}

export interface CartItem {
  productId?: number;
  serviceId?: number;
  qty: number;
  selectedSize?: string;
}

/** Stable string key for a cart line — used as React key and for lookups */
export function cartKey(item: CartItem): string {
  if (item.serviceId != null) return `svc:${item.serviceId}`;
  return item.selectedSize ? `${item.productId}:${item.selectedSize}` : String(item.productId);
}

export interface SessionHistoryItem {
  name: string;
  qty: number;
  price: number;
}

export interface SessionHistoryOrder {
  id: number;
  date: string;
  total: number;
  items: SessionHistoryItem[];
}

export interface ActiveSession {
  sessionId: number;
  name: string;
  loyaltyPoints: number;
  totalSessions: number;
  history: SessionHistoryOrder[];
}
