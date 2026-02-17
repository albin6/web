import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Users, Settings, LogOut, ClipboardList } from 'lucide-react';
import { authService } from '@/features/auth/services/authService';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: ClipboardList, label: 'Follow-Ups', href: '/followups' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            authService.logout(refreshToken).finally(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            });
        } else {
            localStorage.removeItem('access_token');
            navigate('/login');
        }
    };

    return (
        <div className="pb-12 min-h-screen border-r bg-background w-64 hidden md:block fixed left-0 top-0 pt-16">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Menu
                    </h2>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                                className={cn("w-full justify-start", location.pathname === item.href && "bg-muted")}
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
