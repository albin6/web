import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
    const { notifications } = useNotifications();
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto">
                <NotificationDropdown />
            </PopoverContent>
        </Popover>
    );
}
