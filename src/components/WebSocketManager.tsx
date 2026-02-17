import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWebSocket } from '@/lib/useWebSocket';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/types/notification';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export function WebSocketManager() {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    // Get token from localStorage - only once on mount
    const [token] = useState(() => localStorage.getItem('access_token'));

    const handleMessage = useCallback((notification: Notification) => {
        // Add to context
        addNotification(notification);

        // Show toast
        toast(notification.title, {
            description: notification.message,
            duration: 5000,
            action: {
                label: 'View',
                onClick: () => {
                    if (notification.type === 'FOLLOWUP_ASSIGNED') {
                        const followupId = notification.data.followup_id;
                        navigate(`/followups/${followupId}`);
                    }
                },
            },
        });
    }, [addNotification, navigate]);

    const { isConnected, error } = useWebSocket({
        url: WS_URL,
        token,
        onMessage: handleMessage,
        enabled: !!token,
    });

    useEffect(() => {
        if (error) {
            console.error('[WebSocketManager] Connection error:', error);
        }
    }, [error]);

    useEffect(() => {
        console.log('[WebSocketManager] Connection status:', isConnected ? 'Connected' : 'Disconnected');
    }, [isConnected]);

    return null; // This is a logic-only component
}
