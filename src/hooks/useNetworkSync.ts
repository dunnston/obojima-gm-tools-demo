import { useEffect, useRef, useState, useCallback } from 'react';
import { isNetworkClient, isTauriEnvironment } from '@/lib/storage';

// Sync message types
export interface SyncMessage {
  type: 'update' | 'delete' | 'connected' | 'ping' | 'pong';
  table?: string;
  id?: string;
  data?: any;
  timestamp: number;
  clientId?: string;
}

// Callback types for handling sync events
export interface SyncCallbacks {
  onUpdate?: (table: string, id: string, data: any) => void;
  onDelete?: (table: string, id: string) => void;
  onConnect?: (clientId: string) => void;
  onDisconnect?: () => void;
}

// Hook state
export interface NetworkSyncState {
  isConnected: boolean;
  clientId: string | null;
  lastSync: Date | null;
  error: string | null;
}

// Global state for sync callbacks (allows components to subscribe)
let globalCallbacks: SyncCallbacks[] = [];

export function subscribeToSync(callbacks: SyncCallbacks): () => void {
  globalCallbacks.push(callbacks);
  return () => {
    globalCallbacks = globalCallbacks.filter(cb => cb !== callbacks);
  };
}

// Notify all subscribers of an update
function notifyUpdate(table: string, id: string, data: any) {
  globalCallbacks.forEach(cb => cb.onUpdate?.(table, id, data));
}

function notifyDelete(table: string, id: string) {
  globalCallbacks.forEach(cb => cb.onDelete?.(table, id));
}

/**
 * Hook for managing WebSocket connection for real-time sync.
 * This hook connects to the embedded server's WebSocket endpoint
 * when running as a network client.
 */
export function useNetworkSync(callbacks?: SyncCallbacks): NetworkSyncState & {
  broadcast: (type: 'update' | 'delete', table: string, id: string, data?: any) => void;
} {
  const [state, setState] = useState<NetworkSyncState>({
    isConnected: false,
    clientId: null,
    lastSync: null,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  // Broadcast a message to the server
  const broadcast = useCallback((
    type: 'update' | 'delete',
    table: string,
    id: string,
    data?: any
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: SyncMessage = {
        type,
        table,
        id,
        data,
        timestamp: Date.now(),
        clientId: state.clientId || undefined,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }, [state.clientId]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Only connect if we're a network client
    if (!isNetworkClient()) {
      return;
    }

    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

      console.log('[NetworkSync] Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[NetworkSync] WebSocket connected');
        reconnectAttemptsRef.current = 0;
        setState(prev => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: SyncMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'connected':
              console.log('[NetworkSync] Received client ID:', message.data?.clientId);
              setState(prev => ({
                ...prev,
                clientId: message.data?.clientId || null,
              }));
              callbacks?.onConnect?.(message.data?.clientId);
              break;

            case 'update':
              if (message.table && message.id) {
                console.log('[NetworkSync] Received update:', message.table, message.id);
                setState(prev => ({ ...prev, lastSync: new Date() }));
                callbacks?.onUpdate?.(message.table, message.id, message.data);
                notifyUpdate(message.table, message.id, message.data);
              }
              break;

            case 'delete':
              if (message.table && message.id) {
                console.log('[NetworkSync] Received delete:', message.table, message.id);
                setState(prev => ({ ...prev, lastSync: new Date() }));
                callbacks?.onDelete?.(message.table, message.id);
                notifyDelete(message.table, message.id);
              }
              break;

            case 'ping':
              // Respond with pong
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              }
              break;
          }
        } catch (err) {
          console.error('[NetworkSync] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[NetworkSync] WebSocket error:', event);
        setState(prev => ({
          ...prev,
          error: 'Connection error',
        }));
      };

      ws.onclose = (event) => {
        console.log('[NetworkSync] WebSocket closed:', event.code, event.reason);
        wsRef.current = null;

        setState(prev => ({
          ...prev,
          isConnected: false,
        }));

        callbacks?.onDisconnect?.();

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts && isNetworkClient()) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`[NetworkSync] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setState(prev => ({
            ...prev,
            error: 'Unable to connect. Please refresh the page.',
          }));
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[NetworkSync] Error creating WebSocket:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to create connection',
      }));
    }
  }, [callbacks]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      clientId: null,
    }));
  }, []);

  // Connect on mount if we're a network client
  useEffect(() => {
    if (isNetworkClient()) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!state.isConnected) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [state.isConnected]);

  return {
    ...state,
    broadcast,
  };
}

/**
 * Hook for desktop app to broadcast changes to network clients.
 * This should be used in the Tauri app to notify the server of changes.
 */
export function useDesktopBroadcast() {
  const broadcast = useCallback(async (
    type: 'update' | 'delete',
    table: string,
    id: string,
    data?: any
  ) => {
    if (!isTauriEnvironment()) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('broadcast_sync_message', {
        table,
        id,
        data: data || {},
        msgType: type,
      });
    } catch (err) {
      console.error('[DesktopBroadcast] Error broadcasting:', err);
    }
  }, []);

  return { broadcast };
}

/**
 * Higher-order hook that combines both network sync and desktop broadcast.
 * Automatically uses the appropriate method based on environment.
 */
export function useSyncBroadcast() {
  const networkSync = useNetworkSync();
  const desktopBroadcast = useDesktopBroadcast();

  const broadcast = useCallback((
    type: 'update' | 'delete',
    table: string,
    id: string,
    data?: any
  ) => {
    if (isTauriEnvironment()) {
      desktopBroadcast.broadcast(type, table, id, data);
    } else if (isNetworkClient()) {
      networkSync.broadcast(type, table, id, data);
    }
  }, [networkSync.broadcast, desktopBroadcast.broadcast]);

  return {
    isConnected: networkSync.isConnected,
    clientId: networkSync.clientId,
    lastSync: networkSync.lastSync,
    error: networkSync.error,
    broadcast,
  };
}
