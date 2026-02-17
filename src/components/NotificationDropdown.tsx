import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export function NotificationDropdown() {
    const { notifications, markAsRead, clearAll } = useNotifications();

    const handleMarkAllAsRead = () => {
        notifications.forEach((notification) => {
            if (!notification.read) {
                markAsRead(notification.id);
            }
        });
    };

    return (
        <div className="w-80 max-w-[calc(100vw-2rem)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                {notifications.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs h-auto py-1 px-2"
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Body */}
            <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                            <svg
                                className="w-8 h-8 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer (optional - for future "View all" link) */}
            {notifications.length > 0 && (
                <div className="p-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="w-full text-xs"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
