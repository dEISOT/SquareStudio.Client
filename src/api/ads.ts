import { apiFetch } from './client';
import type { Ad } from '../types';

export function fetchPublishedAds(): Promise<Ad[]> {
  return apiFetch<Ad[]>('/ads/published');
}
