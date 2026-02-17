import { useEffect, useRef, useState, useCallback } from 'react';
import type { Notification } from '@/types/notification';

interface UseWebSocketProps {
    url: string;
    token: string | null;
    onMessage?: (notification: Notification) => void;
    enabled?: boolean;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
}

export function useWebSocket({
    url,
    token,
    onMessage,
    enabled = true,
}: UseWebSocketProps): UseWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttempts = useRef(0);

    const onMessageRef = useRef(onMessage);
    const isConnectingRef = useRef(false);

    // Update ref when onMessage changes
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        if (!enabled || !token) {
            console.log('[WebSocket] Skipping connection - not enabled or no token');
            return;
        }

        // Prevent multiple simultaneous connection attempts
        if (isConnectingRef.current) {
            console.log('[WebSocket] Already connecting, skipping duplicate attempt');
            return;
        }

        // Clear any existing connection
        if (wsRef.current) {
            console.log('[WebSocket] Closing existing connection before reconnecting');
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = true;

        try {
            setIsConnecting(true);
            setError(null);

            const wsUrl = `${url}?token=${token}`;
            console.log('[WebSocket] Creating new connection');
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('[WebSocket] Connected');
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                reconnectAttempts.current = 0;
                isConnectingRef.current = false;
            };

            ws.onmessage = (event) => {
                try {
                    const notification: Notification = JSON.parse(event.data);
                    console.log('[WebSocket] Received notification:', notification);
                    onMessageRef.current?.(notification);
                } catch (err) {
                    console.error('[WebSocket] Failed to parse message:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('[WebSocket] Error:', event);
                setError(new Error('WebSocket connection error'));
                isConnectingRef.current = false;
            };

            ws.onclose = (event) => {
                console.log('[WebSocket] Disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                isConnectingRef.current = false;
                wsRef.current = null;

                // Reconnect with exponential backoff
                if (enabled && token) {
                    const backoffDelay = Math.min(
                        1000 * Math.pow(2, reconnectAttempts.current),
                        30000
                    );
                    reconnectAttempts.current++;

                    console.log(
                        `[WebSocket] Reconnecting in ${backoffDelay}ms (attempt #${reconnectAttempts.current})`
                    );

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, backoffDelay);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('[WebSocket] Connection failed:', err);
            setError(err as Error);
            setIsConnecting(false);
            isConnectingRef.current = false;
        }
    }, [enabled, token, url]);

    useEffect(() => {
        console.log('[WebSocket] useEffect triggered - enabled:', enabled, 'token:', !!token);
        connect();

        return () => {
            console.log('[WebSocket] Cleanup - closing connection and clearing timeout');
            isConnectingRef.current = false;

            // Clear reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Close connection and remove handlers to prevent reconnect
            if (wsRef.current) {
                wsRef.current.onclose = null; // Important: Prevent triggering reconnect loop
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    return { isConnected, isConnecting, error };
}
