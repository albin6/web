import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/database';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const createTaskSchema = (selfAssignment: boolean) => z.object({
    task_name: z.string().min(1, 'Task name is required').max(200, 'Task name is too long'),
    assigned_user_id: selfAssignment ? z.string().optional() : z.string().min(1, 'Please select a team member'),
    deadline: z.date(), // Removed required_error to satisfy TS
});

type TaskFormValues = z.infer<ReturnType<typeof createTaskSchema>>;

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    onSuccess: () => void;
    teamId?: string;
    forcedUserId?: string;
    userTeams?: any[];
    selfAssignment?: boolean;
    currentUserId?: string;
}

export const CreateTaskDialog = ({
    open,
    onOpenChange,
    task,
    onSuccess,
    teamId,
    forcedUserId,
    userTeams,
    selfAssignment = false,
    currentUserId,
}: CreateTaskDialogProps) => {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(teamId);
    const [loading, setLoading] = useState(false);

    // Define schema based on props
    const schema = createTaskSchema(selfAssignment);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            task_name: '',
            assigned_user_id: selfAssignment ? currentUserId : (forcedUserId || ''),
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                task_name: task.task_name,
                assigned_user_id: task.assigned_user_id,
                deadline: new Date(task.deadline),
            });
        } else {
            form.reset({
                task_name: '',
                assigned_user_id: selfAssignment ? currentUserId : (forcedUserId || ''),
            });
        }
    }, [task, form, forcedUserId, selfAssignment, currentUserId]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                let users = [];
                const effectiveTeamId = selectedTeamId || teamId;

                if (effectiveTeamId) {
                    users = await apiClient.getAssignableUsers(effectiveTeamId);
                } else if (userTeams && userTeams.length > 0) {
                    users = await apiClient.getAssignableUsers(userTeams[0].team_id);
                    if (!selectedTeamId) setSelectedTeamId(userTeams[0].team_id);
                } else {
                    users = await apiClient.getUsers();
                }

                const formattedUsers = users.map((u: any) => ({
                    id: u.user_id || u.id,
                    full_name: u.full_name,
                    email: u.email,
                    is_approved: u.is_approved !== undefined ? u.is_approved : true
                })).filter((u: any) => u.is_approved);

                const filteredUsers = selfAssignment
                    ? formattedUsers
                    : formattedUsers.filter((u: any) => u.id !== currentUserId);

                setTeamMembers(filteredUsers.length > 0 ? filteredUsers : formattedUsers);
            } catch (error) {
                console.error('Error fetching team members:', error);
            }
        };

        if (open) {
            fetchTeamMembers();
        }
    }, [open, teamId, selectedTeamId, userTeams, selfAssignment, currentUserId]);

    const onSubmit = async (values: TaskFormValues) => {
        setLoading(true);
        try {
            if (task) {
                await apiClient.updateTask(task.id, {
                    task_name: values.task_name,
                    assigned_user_id: values.assigned_user_id,
                    deadline: values.deadline.toISOString(),
                });

                toast.success('Task Updated');
            } else {
                const assignedUserId = selfAssignment ? currentUserId : values.assigned_user_id;

                if (!assignedUserId) {
                    toast.error('Please select a user to assign the task to');
                    setLoading(false);
                    return;
                }

                await apiClient.createTask({
                    task_name: values.task_name,
                    assigned_user_id: assignedUserId,
                    deadline: values.deadline.toISOString(),
                    team_id: selectedTeamId || teamId || (userTeams && userTeams.length > 0 ? userTeams[0].team_id : undefined),
                });

                toast.success('Task Created');
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error saving task:', error);
            toast.error(error.response?.data?.error || 'Failed to save task.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="task_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter task name..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {userTeams && userTeams.length > 1 && !teamId && (
                            <div className="space-y-2">
                                <FormLabel>Team</FormLabel>
                                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userTeams.map((team) => (
                                            <SelectItem key={team.team_id} value={team.team_id}>
                                                {team.team_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!selfAssignment && (
                            <FormField
                                control={form.control}
                                name="assigned_user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign To</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team member" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teamMembers.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.full_name || member.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Deadline</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return date < today;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
