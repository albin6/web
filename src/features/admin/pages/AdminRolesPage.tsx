import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Shield, Layout } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AdminRolesPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [formData, setFormData] = useState({
        role_name: '',
        can_manage_tasks: false,
        can_view_analytics: false,
        can_manage_members_limited: false
    });

    const { data: teams = [], isLoading: teamsLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: () => apiClient.getTeams(),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.createCustomRole(selectedTeamId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-roles', selectedTeamId] });
            setIsCreateOpen(false);
            resetForm();
            toast.success('Custom role created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create role');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ teamId, roleId, data }: { teamId: string, roleId: string, data: any }) =>
            apiClient.updateCustomRole(teamId, roleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-roles', selectedRole.team_id] });
            setIsEditOpen(false);
            setSelectedRole(null);
            toast.success('Custom role updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update role');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ teamId, roleId }: { teamId: string, roleId: string }) =>
            apiClient.deleteCustomRole(teamId, roleId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['custom-roles', variables.teamId] });
            setIsDeleteOpen(false);
            setSelectedRole(null);
            toast.success('Custom role deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete role');
        }
    });

    const resetForm = () => {
        setFormData({
            role_name: '',
            can_manage_tasks: false,
            can_view_analytics: false,
            can_manage_members_limited: false
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRole) {
            updateMutation.mutate({
                teamId: selectedRole.team_id,
                roleId: selectedRole.id,
                data: formData
            });
        }
    };

    const openCreate = (teamId: string) => {
        setSelectedTeamId(teamId);
        resetForm();
        setIsCreateOpen(true);
    };

    const openEdit = (role: any) => {
        setSelectedRole(role);
        setFormData({
            role_name: role.role_name,
            can_manage_tasks: role.can_manage_tasks,
            can_view_analytics: role.can_view_analytics,
            can_manage_members_limited: role.can_manage_members_limited
        });
        setIsEditOpen(true);
    };

    const openDelete = (role: any) => {
        setSelectedRole(role);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Roles</h1>
                <p className="text-muted-foreground">Define custom roles and permissions for each team.</p>
            </div>

            {teamsLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No teams found. Create a team first to manage roles.</p>
                    <Button variant="link" asChild>
                        <a href="/admin/teams">Go to Teams</a>
                    </Button>
                </div>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4 border-none">
                    {teams.map((team: any) => (
                        <AccordionItem key={team.id} value={team.id} className="border rounded-lg px-4 bg-card">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-primary/10 rounded">
                                        <Layout className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{team.name}</div>
                                        <div className="text-xs text-muted-foreground">Manage roles for this team</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                                <RolesList
                                    teamId={team.id}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                    onCreate={() => openCreate(team.id)}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create Custom Role</DialogTitle>
                            <DialogDescription>
                                Set permissions for the new role.
                            </DialogDescription>
                        </DialogHeader>
                        <RoleFormFields formData={formData} setFormData={setFormData} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Custom Role</DialogTitle>
                            <DialogDescription>
                                Update role permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <RoleFormFields formData={formData} setFormData={setFormData} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Custom Role"
                description={`Are you sure you want to delete the role "${selectedRole?.role_name}"? If users are assigned to this role, they will be reverted to default team member permissions.`}
                onConfirm={() => selectedRole && deleteMutation.mutate({
                    teamId: selectedRole.team_id,
                    roleId: selectedRole.id
                })}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    );
}

function RolesList({ teamId, onEdit, onDelete, onCreate }: any) {
    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['custom-roles', teamId],
        queryFn: () => apiClient.getCustomRoles(teamId),
    });

    if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">Loading roles...</div>;

    return (
        <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Custom Roles</h4>
                <Button size="sm" variant="ghost" className="h-8 gap-1 text-primary" onClick={onCreate}>
                    <Plus className="h-3 w-3" /> Add Role
                </Button>
            </div>

            {roles.length === 0 ? (
                <div className="text-center py-6 border rounded border-dashed text-sm text-muted-foreground italic">
                    No custom roles defined for this team.
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {roles.map((role: any) => (
                        <Card key={role.id} className="shadow-sm">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        {role.role_name}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(role)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(role)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${role.can_manage_tasks ? 'bg-green-500' : 'bg-muted'}`} />
                                    <span className={role.can_manage_tasks ? 'text-foreground' : 'text-muted-foreground'}>Manage Tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${role.can_view_analytics ? 'bg-green-500' : 'bg-muted'}`} />
                                    <span className={role.can_view_analytics ? 'text-foreground' : 'text-muted-foreground'}>View Analytics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${role.can_manage_members_limited ? 'bg-green-500' : 'bg-muted'}`} />
                                    <span className={role.can_manage_members_limited ? 'text-foreground' : 'text-muted-foreground'}>Limited Member Management</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function RoleFormFields({ formData, setFormData }: any) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="role_name">Role Name</Label>
                <Input
                    id="role_name"
                    required
                    value={formData.role_name}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                    placeholder="e.g. Project Manager, Data Analyst"
                />
            </div>
            <div className="space-y-3 pt-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="can_manage_tasks"
                            checked={formData.can_manage_tasks}
                            onCheckedChange={(checked) => setFormData({ ...formData, can_manage_tasks: !!checked })}
                        />
                        <Label htmlFor="can_manage_tasks" className="text-sm font-normal cursor-pointer">
                            Can Manage Tasks (Create, edit, delete within team)
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="can_view_analytics"
                            checked={formData.can_view_analytics}
                            onCheckedChange={(checked) => setFormData({ ...formData, can_view_analytics: !!checked })}
                        />
                        <Label htmlFor="can_view_analytics" className="text-sm font-normal cursor-pointer">
                            Can View Analytics (Access reports and performance data)
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="can_manage_members_limited"
                            checked={formData.can_manage_members_limited}
                            onCheckedChange={(checked) => setFormData({ ...formData, can_manage_members_limited: !!checked })}
                        />
                        <Label htmlFor="can_manage_members_limited" className="text-sm font-normal cursor-pointer">
                            Limited Member Management (Invite and assign roles)
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );
}
