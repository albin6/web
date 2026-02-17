import { Outlet } from 'react-router-dom';
import { Sidebar } from '../features/dashboard/components/Sidebar';
import { Navbar } from '../features/dashboard/components/Navbar';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex pt-16">
                <Sidebar />
                <main className="flex-1 px-4 py-8 md:ml-64 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
