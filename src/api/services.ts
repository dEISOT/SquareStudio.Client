import { apiFetch } from './client';
import type { Service } from '../types';

export const fetchServices = (): Promise<Service[]> =>
  apiFetch<Service[]>('/services');
