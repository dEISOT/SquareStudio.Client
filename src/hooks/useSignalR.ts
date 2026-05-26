import { useEffect, useRef, useCallback } from 'react';
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
  history: SessionHistoryOrder[];
}

export function useSignalR(
  workstationId: number | null,
  onSessionStarted: (greeting: SessionGreeting) => void,
  onSessionEnded: () => void,
) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const workstationIdRef = useRef<number | null>(null);
  const onSessionStartedRef = useRef(onSessionStarted);
  const onSessionEndedRef = useRef(onSessionEnded);
  onSessionStartedRef.current = onSessionStarted;
  onSessionEndedRef.current = onSessionEnded;

  const joinWorkstation = useCallback(async (id: number) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    if (workstationIdRef.current !== null && workstationIdRef.current !== id) {
      await conn.invoke('LeaveWorkstationGroup', workstationIdRef.current).catch(() => {});
    }
    await conn.invoke('JoinWorkstationGroup', id).catch(() => {});
    workstationIdRef.current = id;
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

    connectionRef.current = conn;

    conn.start().then(() => {
      if (workstationId !== null) {
        void joinWorkstation(workstationId);
      }
    }).catch(() => {});

    conn.onreconnected(() => {
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
}
