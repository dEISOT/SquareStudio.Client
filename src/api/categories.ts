import { apiFetch } from './client';
import type { Category } from '../types';

export const fetchCategories = (): Promise<Category[]> =>
  apiFetch<Category[]>('/categories');
