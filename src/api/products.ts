import { apiFetch } from './client';
import type { Product } from '../types';

export const fetchPublishedProducts = (): Promise<Product[]> =>
  apiFetch<Product[]>('/products/published');
