import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import StudentsPage from '@/features/students/pages/StudentsPage';
import FollowUpListPage from '@/features/followup/pages/FollowUpListPage';
import FollowUpDetailPage from '@/features/followup/pages/FollowUpDetailPage';
import TasksPage from '@/features/tasks/pages/TasksPage';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import AdminRoute from '@/layouts/AdminRoute';
import AdminOverviewPage from '@/features/admin/pages/AdminOverviewPage';
import AdminTeamsPage from '@/features/admin/pages/AdminTeamsPage';
import AdminRolesPage from '@/features/admin/pages/AdminRolesPage';
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketManager } from '@/components/WebSocketManager';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/followups" element={<FollowUpListPage />} />
                    <Route path="/followups/:id" element={<FollowUpDetailPage />} />

                    {/* Admin Routes */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminOverviewPage />} />
                      <Route path="/admin/teams" element={<AdminTeamsPage />} />
                      <Route path="/admin/roles" element={<AdminRolesPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                    </Route>
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* WebSocket Manager - only connects when authenticated */}
              <WebSocketManager />

              {/* Toast notifications */}
              <Toaster />
            </BrowserRouter>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;