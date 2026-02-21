import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import StatCard from '../components/StatCard';
import { Users, UserCheck, Layout, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import UserStatusBadge from '../components/UserStatusBadge';
import { toast } from 'sonner';

export default function AdminOverviewPage() {
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => apiClient.getAdminStats(),
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users', { status: 'pending' }],
        queryFn: () => apiClient.getUsers({ status: 'pending', limit: 5 }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => apiClient.approveUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User approved successfully');
        },
        onError: () => {
            toast.error('Failed to approve user');
        }
    });

    const pendingUsers = usersData?.users || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-muted-foreground">Monitor system activity and pending actions.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={statsLoading ? '...' : stats?.total_users || 0}
                    icon={Users}
                />
                <StatCard
                    title="Pending Approvals"
                    value={statsLoading ? '...' : stats?.pending_approvals || 0}
                    icon={UserCheck}
                    description={stats?.pending_approvals ? `${stats.pending_approvals} users waiting` : 'All caught up'}
                />
                <StatCard
                    title="Total Teams"
                    value={statsLoading ? '...' : stats?.total_teams || 0}
                    icon={Layout}
                />
                <StatCard
                    title="Total Tasks"
                    value={statsLoading ? '...' : stats?.total_tasks || 0}
                    icon={CheckCircle2}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Pending Approvals</CardTitle>
                        <CardDescription>
                            Review and approve new user registrations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {usersLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No pending approvals found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingUsers.map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.full_name || 'Anonymous'}</span>
                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserStatusBadge isApproved={false} />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => approveMutation.mutate(user.id)}
                                                disabled={approveMutation.isPending}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-primary" asChild>
                                    <Link to="/admin/users?status=pending">
                                        View all pending <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link to="/admin/users">Add New User</Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link to="/admin/teams">Create New Team</Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link to="/admin/roles">Manage Permissions</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
