import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://localhost:7096';

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

export interface SessionGreeting {
  sessionId: number;
  clientName: string;
  masterName: string;
  workStationId: number;
  loyaltyPoints: number;
  totalSessions: number;
  history: SessionHistoryOrder[];
}

export function useSignalR(
  workstationId: number | null,
  onSessionStarted: (greeting: SessionGreeting) => void,
  onSessionEnded: () => void,
  onWorkstationTaken?: () => void,
): { claimedWorkstations: number[]; notifySessionEndingSoon: (workstationId: number, sessionId: number | null) => Promise<void> } {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const workstationIdRef = useRef<number | null>(null);
  const onSessionStartedRef = useRef(onSessionStarted);
  const onSessionEndedRef = useRef(onSessionEnded);
  const onWorkstationTakenRef = useRef(onWorkstationTaken);
  onSessionStartedRef.current = onSessionStarted;
  onSessionEndedRef.current = onSessionEnded;
  onWorkstationTakenRef.current = onWorkstationTaken;

  const [claimedWorkstations, setClaimedWorkstations] = useState<number[]>([]);

  const refreshClaimed = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    const ids = await conn.invoke<number[]>('GetClaimedWorkstations').catch(() => [] as number[]);
    setClaimedWorkstations(ids);
  }, []);

  const joinWorkstation = useCallback(async (id: number) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    if (workstationIdRef.current !== null && workstationIdRef.current !== id) {
      await conn.invoke('LeaveWorkstationGroup', workstationIdRef.current).catch(() => {});
    }
    const ok = await conn.invoke<boolean>('JoinWorkstationGroup', id).catch(() => false);
    if (ok) {
      workstationIdRef.current = id;
    } else {
      onWorkstationTakenRef.current?.();
    }
  }, []);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/orders`, { skipNegotiation: false })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on('SessionStarted', (greeting: SessionGreeting) => {
      onSessionStartedRef.current(greeting);
    });

    conn.on('SessionEnded', () => {
      onSessionEndedRef.current();
    });

    conn.on('WorkstationStatusChanged', (wsId: number, isClaimed: boolean) => {
      setClaimedWorkstations((prev) =>
        isClaimed ? [...prev.filter((x) => x !== wsId), wsId] : prev.filter((x) => x !== wsId)
      );
    });

    connectionRef.current = conn;

    conn.start().then(async () => {
      await refreshClaimed();
      if (workstationId !== null) {
        void joinWorkstation(workstationId);
      }
    }).catch(() => {});

    conn.onreconnected(async () => {
      await refreshClaimed();
      if (workstationIdRef.current !== null) {
        void joinWorkstation(workstationIdRef.current);
      }
    });

    return () => {
      conn.stop().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workstationId !== null) {
      void joinWorkstation(workstationId);
    }
  }, [workstationId, joinWorkstation]);

  const notifySessionEndingSoon = useCallback(async (wsId: number, sessionId: number | null) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke('NotifySessionEndingSoon', wsId, sessionId).catch(() => {});
  }, []);

  return { claimedWorkstations, notifySessionEndingSoon };
}
