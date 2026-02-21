import type { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserPlus } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        // Mark as read
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.type === 'FOLLOWUP_ASSIGNED') {
            navigate(`/followups/${notification.data.followup_id}`);
        }
    };

    const getNotificationIcon = () => {
        switch (notification.type) {
            case 'FOLLOWUP_ASSIGNED':
                return <UserPlus className="w-5 h-5 text-blue-500" />;
            default:
                return <UserPlus className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent/50",
                !notification.read && "bg-muted"
            )}
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </button>
    );
}
