import type { SessionGreeting } from '../hooks/useSignalR';

export async function fetchActiveSession(workStationId: number): Promise<SessionGreeting | null> {
  const res = await fetch(
    `${(import.meta.env.VITE_API_URL as string | undefined) ?? 'https://localhost:7096'}/sessions/workstation/${workStationId}/active`,
  );
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<SessionGreeting>;
}
