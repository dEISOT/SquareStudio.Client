import { apiFetch } from './client';
import type { Workstation } from '../types';

export const fetchWorkstations = (): Promise<Workstation[]> =>
  apiFetch<Workstation[]>('/workstations');
