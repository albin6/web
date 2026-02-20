import { Outlet } from 'react-router-dom';
import { Workflow } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary/5 border-r p-12 gap-8">
                <div className="flex items-center gap-3">
                    <Workflow className="h-12 w-12 text-primary" />
                    <span className="text-4xl font-bold tracking-tight">Task Flow</span>
                </div>
                <p className="text-muted-foreground text-center max-w-sm text-lg leading-relaxed">
                    Manage your team's tasks, track student follow-ups, and stay on top of what matters.
                </p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <Workflow className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-bold">Task Flow</span>
                </div>
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
