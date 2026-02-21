import { ModeToggle } from '@/components/mode-toggle';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Workflow, Home, Users, ClipboardList, PhoneCall, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: ClipboardList, label: 'Tasks', href: '/tasks' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: PhoneCall, label: 'Follow-Ups', href: '/followups' },
];

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

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
        <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur-sm z-50 flex items-center px-4 justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0">
                        <div className="flex items-center gap-2 px-6 py-5 border-b">
                            <Workflow className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg">Task Flow</span>
                        </div>
                        <nav className="flex flex-col gap-1 p-3 pt-4">
                            {navItems.map((item) => (
                                <Button
                                    key={item.href}
                                    variant="ghost"
                                    className={cn(
                                        'w-full justify-start gap-3 h-11 font-medium',
                                        location.pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                                    )}
                                    asChild
                                    onClick={() => setOpen(false)}
                                >
                                    <Link to={item.href}>
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </Button>
                            ))}
                            <div className="mt-4 pt-4 border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 h-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
                <Link to="/dashboard" className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-primary hidden md:block" />
                    <h1 className="text-lg font-bold tracking-tight">Task Flow</h1>
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <ModeToggle />
            </div>
        </div>
    );
}
