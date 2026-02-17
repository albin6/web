import { ModeToggle } from '@/components/mode-toggle';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
// We can reuse sidebar content or create a mobile specific one
// For simplicity, let's create a mobile menu reusing the logic or just links
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: Settings, label: 'Settings', href: '/settings' },
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
        <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-50 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64">
                        <div className="space-y-4 py-4">
                            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
                            <div className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <Button
                                        key={item.href}
                                        variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                                        className={cn("w-full justify-start", location.pathname === item.href && "bg-muted")}
                                        asChild
                                        onClick={() => setOpen(false)}
                                    >
                                        <Link to={item.href}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </Button>
                                ))}
                                <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <h1 className="text-xl font-bold">MyApp</h1>
            </div>
            <div className="flex items-center gap-4">
                <NotificationBell />
                <ModeToggle />
            </div>
        </div>
    );
}
