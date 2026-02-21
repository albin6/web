import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
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
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminTeamsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { data: teams = [], isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: () => apiClient.getTeams(),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsCreateOpen(false);
            setFormData({ name: '', description: '' });
            toast.success('Team created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create team');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiClient.updateTeam(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setIsEditOpen(false);
            setSelectedTeam(null);
            toast.success('Team updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update team');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsDeleteOpen(false);
            setSelectedTeam(null);
            toast.success('Team deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete team');
        }
    });

    const filteredTeams = teams.filter((team: any) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTeam) {
            updateMutation.mutate({ id: selectedTeam.id, data: formData });
        }
    };

    const openEdit = (team: any) => {
        setSelectedTeam(team);
        setFormData({ name: team.name, description: team.description || '' });
        setIsEditOpen(true);
    };

    const openDelete = (team: any) => {
        setSelectedTeam(team);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Teams</h1>
                    <p className="text-muted-foreground">Create and manage organizational teams.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create Team
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Create Team</DialogTitle>
                                <DialogDescription>
                                    Add a new team to the organization.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Team Name</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Engineering, Marketing"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Optional description of the team's purpose"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creating...' : 'Create Team'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No teams found.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTeams.map((team: any) => (
                        <Card key={team.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{team.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {team.description || 'No description provided.'}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Team ID: {team.id.substring(0, 8)}...</span>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(team)}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => openDelete(team)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Team</DialogTitle>
                            <DialogDescription>
                                Update team details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Team Name</Label>
                                <Input
                                    id="edit-name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
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
                title="Delete Team"
                description={`Are you sure you want to delete "${selectedTeam?.name}"? This action cannot be undone and may affect members assigned to this team.`}
                onConfirm={() => selectedTeam && deleteMutation.mutate(selectedTeam.id)}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    );
}
