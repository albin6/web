import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute() {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    if (!user || !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
