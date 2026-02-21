import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, MoreHorizontal, Shield, ShieldCheck, ChevronLeft, ChevronRight, UserMinus, CheckCircle2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import UserStatusBadge from '../components/UserStatusBadge';
import RoleBadge from '../components/RoleBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSearchParams } from 'react-router-dom';

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Pagination and Filter state from URL
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortDir = searchParams.get('sort_dir') || 'desc';

    const offset = (page - 1) * limit;

    const { data, isLoading } = useQuery({
        queryKey: ['users', { search, role, status, sortBy, sortDir, limit, offset }],
        queryFn: () => apiClient.getUsers({
            search,
            role: role === 'all' ? undefined : role,
            status: status === 'all' ? undefined : status,
            sort_by: sortBy,
            sort_dir: sortDir,
            limit,
            offset
        }),
    });

    const { data: teams = [] } = useQuery({
        queryKey: ['teams'],
        queryFn: () => apiClient.getTeams(),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => apiClient.approveUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User approved');
        }
    });

    const promoteMutation = useMutation({
        mutationFn: (id: string) => apiClient.promoteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User promoted to Admin');
        }
    });

    const demoteMutation = useMutation({
        mutationFn: (id: string) => apiClient.demoteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User demoted to regular user');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDeleteOpen(false);
            toast.success('User deleted successfully');
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.adminCreateUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsCreateOpen(false);
            toast.success('User created and credentials emailed');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create user');
        }
    });

    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'all' || (key === 'page' && value === '1')) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    };

    const users = data?.users || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                    <p className="text-muted-foreground">View and manage all user accounts.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" /> Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <CreateUserForm
                            teams={teams}
                            onSubmit={(data) => createMutation.mutate(data)}
                            onCancel={() => setIsCreateOpen(false)}
                            isPending={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 max-w-sm flex-1">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => updateParams({ search: e.target.value, page: '1' })}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={role} onValueChange={(v) => updateParams({ role: v, page: '1' })}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={(v) => updateParams({ status: v, page: '1' })}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={`${sortBy}-${sortDir}`} onValueChange={(v) => {
                                const [col, dir] = v.split('-');
                                updateParams({ sort_by: col, sort_dir: dir });
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Teams</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="h-16">
                                                <div className="h-8 bg-muted animate-pulse rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm italic">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.full_name || 'Anonymous'}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            <TableCell>
                                                <UserStatusBadge isApproved={user.is_approved} />
                                            </TableCell>
                                            <TableCell className="max-w-[150px]">
                                                <span className="text-xs truncate block" title={user.custom_roles}>
                                                    {user.custom_roles || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <UserActions
                                                    user={user}
                                                    onApprove={() => approveMutation.mutate(user.id)}
                                                    onPromote={() => promoteMutation.mutate(user.id)}
                                                    onDemote={() => demoteMutation.mutate(user.id)}
                                                    onDelete={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} users
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => updateParams({ page: (page - 1).toString() })}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <div className="flex items-center text-sm font-medium px-2">
                                Page {page} of {totalPages || 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => updateParams({ page: (page + 1).toString() })}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete User"
                description={`Are you sure you want to delete "${selectedUser?.full_name || selectedUser?.email}"? This will permanently remove their access and all associated data.`}
                onConfirm={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    );
}

function UserActions({ user, onApprove, onPromote, onDemote, onDelete }: any) {
    const isAdmin = user.role === 'admin';
    const isApproved = user.is_approved;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {!isApproved && (
                    <DropdownMenuItem onClick={onApprove}>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Approve User
                    </DropdownMenuItem>
                )}

                {!isAdmin ? (
                    <DropdownMenuItem onClick={onPromote}>
                        <ShieldCheck className="h-4 w-4 mr-2 text-purple-500" /> Promote to Admin
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={onDemote}>
                        <Shield className="h-4 w-4 mr-2 text-orange-500" /> Demote to User
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <UserMinus className="h-4 w-4 mr-2" /> Delete Account
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function CreateUserForm({ teams, onSubmit, onCancel, isPending }: {
    teams: any[],
    onSubmit: (data: any) => void,
    onCancel: () => void,
    isPending: boolean
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        team_id: 'none',
        role_id: 'none',
        password: ''
    });

    const { data: teamRoles = [] } = useQuery({
        queryKey: ['custom-roles', formData.team_id],
        queryFn: () => apiClient.getCustomRoles(formData.team_id),
        enabled: formData.team_id !== 'none',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = { ...formData };
        if (payload.team_id === 'none') {
            delete payload.team_id;
            delete payload.role_id;
        } else if (payload.role_id === 'none') {
            delete payload.role_id;
        }
        if (payload.password === '') delete payload.password;
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                    Fill in the details to create a new user account. A welcome email with credentials will be sent.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="create-name">Full Name</Label>
                    <Input
                        id="create-name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="create-email">Email Address</Label>
                    <Input
                        id="create-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="create-role">System Role</Label>
                        <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                            <SelectTrigger id="create-role">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="create-team">Initial Team</Label>
                        <Select value={formData.team_id} onValueChange={(v) => setFormData({ ...formData, team_id: v, role_id: 'none' })}>
                            <SelectTrigger id="create-team">
                                <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Team</SelectItem>
                                {teams.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {formData.team_id !== 'none' && (
                    <div className="grid gap-2">
                        <Label htmlFor="create-team-role">Team Role (Optional)</Label>
                        <Select value={formData.role_id} onValueChange={(v) => setFormData({ ...formData, role_id: v })}>
                            <SelectTrigger id="create-team-role">
                                <SelectValue placeholder="Select a team-specific role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Default Member</SelectItem>
                                {teamRoles.map((r: any) => (
                                    <SelectItem key={r.id} value={r.id}>{r.role_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="create-password">Custom Password (Optional)</Label>
                    <Input
                        id="create-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Leave blank to auto-generate"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create User'}
                </Button>
            </DialogFooter>
        </form>
    );
}
