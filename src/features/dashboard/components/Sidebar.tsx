import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, ClipboardList, PhoneCall } from 'lucide-react';
import { authService } from '@/features/auth/services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users2, ShieldCheck, UserCircle2 } from 'lucide-react';

const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: ClipboardList, label: 'Tasks', href: '/tasks' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: PhoneCall, label: 'Follow-Ups', href: '/followups' },
];

const adminItems = [
    { icon: LayoutDashboard, label: 'Admin Overview', href: '/admin' },
    { icon: Users2, label: 'Manage Teams', href: '/admin/teams' },
    { icon: ShieldCheck, label: 'Manage Roles', href: '/admin/roles' },
    { icon: UserCircle2, label: 'Manage Users', href: '/admin/users' },
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
        <aside className="pb-12 min-h-screen border-r bg-background w-64 hidden md:flex flex-col fixed left-0 top-0 pt-16">
            <nav className="flex flex-col gap-1 p-3 pt-4 flex-1">
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</p>
                {sidebarItems.map((item) => (
                    <Button
                        key={item.href}
                        variant="ghost"
                        className={cn(
                            'w-full justify-start gap-3 h-10 font-medium',
                            location.pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                        )}
                        asChild
                    >
                        <Link to={item.href}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                ))}

                {useAuth().isAdmin && (
                    <>
                        <p className="px-3 mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
                        {adminItems.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start gap-3 h-10 font-medium',
                                    (location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))) && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                                )}
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </>
                )}
            </nav>
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
