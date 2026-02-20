import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Notification } from '@/types/notification';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Notification) => {
        setNotifications((prev) => {
            const updated = [notification, ...prev].slice(0, 50);
            return updated;
        });

        setTimeout(() => {
            removeNotification(notification.id);
        }, 5 * 60 * 1000);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, removeNotification, markAsRead, clearAll }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
