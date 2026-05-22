import { apiFetch } from './client';
import type { KioskSettings } from '../types';

export const fetchKioskSettings = (): Promise<KioskSettings> =>
  apiFetch<KioskSettings>('/settings/kiosk');
