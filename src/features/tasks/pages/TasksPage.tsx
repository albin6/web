import { useEffect, useState, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { DeadlineRequestDialog } from '../components/DeadlineRequestDialog';
import type { Task, TaskStatus } from '@/types/database';
import { apiClient } from '@/lib/api-client';
import { wsClient, type WebSocketMessage } from '@/lib/websocket-client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { KanbanBoard } from '../components/KanbanBoard';
import { PerformanceChart } from '../components/PerformanceChart';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '../components/CreateTaskDialog';


const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userTeams, setUserTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selfAssignMode, setSelfAssignMode] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [confirmReviewOpen, setConfirmReviewOpen] = useState(false);
    const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ taskId: string; status: TaskStatus } | null>(null);
    const { user } = useAuth();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const fetchData = async (showLoading = true) => {
        if (!user) return;
        try {
            if (showLoading) setLoading(true);

            const teamsData = await apiClient.getUserTeams();
            setUserTeams(teamsData);

            const [assignedTasks, createdTasks, deadlineRequests, users] = await Promise.all([
                apiClient.getTasks({ assigned_user_id: user.id }),
                apiClient.getTasks({ created_by: user.id }),
                apiClient.getDeadlineRequests({ status: 'pending' }),
                apiClient.getUsers()
            ]);

            const userMap = new Map(users.map((u: any) => [u.id, u]));

            const allTasksMap = new Map();
            [...assignedTasks, ...createdTasks].forEach(task => {
                allTasksMap.set(task.id, task);
            });
            const allTasks: Task[] = Array.from(allTasksMap.values());

            const requestedTaskIds = new Set(deadlineRequests.map((r: any) => r.task_id));
            const tasksWithRequestStatus = allTasks.map((t: any) => ({
                ...t,
                deadline_requested: requestedTaskIds.has(t.id),
                assigned_user: userMap.get(t.assigned_user_id),
                created_by_user: userMap.get(t.created_by)
            }));

            setTasks(tasksWithRequestStatus);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error('Error', {
                description: 'Failed to load dashboard data',
            });
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const unsubscribe = wsClient.onMessage((message: WebSocketMessage) => {
            switch (message.type) {
                case 'task_assigned':
                case 'task_updated':
                case 'task_status_changed':
                case 'deadline_approved':
                case 'deadline_rejected':
                    fetchData(false);
                    break;
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user?.id]);

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            if (task.status === 'todo' && status === 'in_review') {
                toast.error('Invalid Status Change', {
                    description: 'Please move to "In Progress" first before moving to "In Review"',
                });
                return;
            }

            if (task.status === 'in_progress' && status === 'in_review') {
                setPendingStatusChange({ taskId, status });
                setConfirmReviewOpen(true);
                return;
            }

            if ((status as string) === 'completed') {
                setPendingStatusChange({ taskId, status });
                setConfirmCompleteOpen(true);
                return;
            }

            setTasks(prevTasks =>
                prevTasks.map(t =>
                    t.id === taskId
                        ? {
                            ...t,
                            status,
                            start_time: status === 'in_progress' && !t.start_time ? new Date().toISOString() : t.start_time,
                            finish_time: status === 'completed' ? new Date().toISOString() : t.finish_time,
                            pending_approval: status === 'in_review'
                        }
                        : t
                )
            );

            await apiClient.updateTaskStatus(taskId, status);

            toast.success('Status Updated', {
                description: (status as string) === 'completed'
                    ? 'Task marked as completed!'
                    : status === 'in_progress'
                        ? 'Task started'
                        : status === 'in_review'
                            ? 'Task moved to review'
                            : 'Task status updated',
            });

            fetchData(false);
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error('Error', {
                description: error.response?.data?.error || 'Failed to update task status',
            });
        }
    };

    const handleRequestDeadlineChange = (task: Task) => {
        setSelectedTask(task);
        setRequestDialogOpen(true);
    };

    const confirmMoveToReview = async () => {
        if (!pendingStatusChange) return;

        const { taskId, status } = pendingStatusChange;

        try {
            await apiClient.updateTaskStatus(taskId, status);

            toast.success('Task Moved to Review', {
                description: 'Your task has been submitted for review',
            });

            fetchData(false);
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error('Error', {
                description: error.response?.data?.error || 'Failed to update task status',
            });
        } finally {
            setConfirmReviewOpen(false);
            setPendingStatusChange(null);
        }
    };

    const confirmComplete = async () => {
        if (!pendingStatusChange) return;

        const { taskId, status } = pendingStatusChange;

        try {
            // Optimistically update UI
            setTasks(prevTasks =>
                prevTasks.map(t =>
                    t.id === taskId
                        ? { ...t, status, finish_time: new Date().toISOString() }
                        : t
                )
            );

            await apiClient.updateTaskStatus(taskId, status);

            toast.success('Task Completed', {
                description: 'Great job! Task marked as completed.',
            });

            fetchData(false);
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error('Error', {
                description: error.response?.data?.error || 'Failed to update task status',
            });
            fetchData(false); // Revert/Sync on error
        } finally {
            setConfirmCompleteOpen(false);
            setPendingStatusChange(null);
        }
    };

    const { leadTasks, teammateTasks } = useMemo(() => {
        const leadTasks: Task[] = [];
        const teammateTasks: Task[] = [];

        tasks.forEach(task => {
            if (task.status === 'completed' && task.finish_time) {
                if (!isSameDay(new Date(task.finish_time), new Date())) {
                    return;
                }
            }

            if (task.assigned_user_id === user?.id) {
                leadTasks.push(task);
            } else if (task.created_by === user?.id) {
                teammateTasks.push(task);
            }
        });

        return { leadTasks, teammateTasks };
    }, [tasks, user?.id]);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setCreateDialogOpen(true);
    };

    const handleDeleteTask = async (_taskId: string) => {
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">
                        View and manage your assigned tasks
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="font-semibold flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                <span>New Task</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-1">
                            <DropdownMenuItem
                                onClick={() => { setSelfAssignMode(true); setCreateDialogOpen(true); }}
                                className="cursor-pointer py-2.5"
                            >
                                <div className="flex items-start gap-3">
                                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">For Myself</span>
                                        <span className="text-[10px] text-muted-foreground leading-tight">Create a personal task</span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => { setSelfAssignMode(false); setCreateDialogOpen(true); }}
                                className="cursor-pointer py-2.5"
                            >
                                <div className="flex items-start gap-3">
                                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">For Teammate</span>
                                        <span className="text-[10px] text-muted-foreground leading-tight">Assign to team member</span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <PerformanceChart tasks={tasks} />


            <Tabs defaultValue="tasks" className="w-full mt-6">
                <TabsList className="w-full justify-start gap-8 bg-transparent border-b rounded-none h-auto p-0 pb-2">
                    <TabsTrigger
                        value="tasks"
                        className="rounded-none bg-transparent px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all"
                    >
                        Tasks
                    </TabsTrigger>
                    <TabsTrigger
                        value="teammate-tasks"
                        className="rounded-none bg-transparent px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all"
                    >
                        Teammate Tasks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-6">
                    <KanbanBoard
                        tasks={leadTasks}
                        onStatusChange={handleStatusChange}
                        onRequestDeadlineChange={handleRequestDeadlineChange}
                        onAddTask={() => { setSelfAssignMode(true); setCreateDialogOpen(true); }}
                        isAdmin={false}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                </TabsContent>

                <TabsContent value="teammate-tasks" className="mt-6">
                    <KanbanBoard
                        tasks={teammateTasks}
                        onStatusChange={handleStatusChange}
                        onRequestDeadlineChange={handleRequestDeadlineChange}
                        isAdmin={false}
                        isReadOnly={true}
                        onEdit={handleEditTask}
                    />
                </TabsContent>
            </Tabs>

            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                    setCreateDialogOpen(open);
                    if (!open) setEditingTask(null);
                }}
                task={editingTask}
                onSuccess={() => fetchData(false)}
                userTeams={userTeams}
                selfAssignment={selfAssignMode}
                currentUserId={user?.id}
            />

            <DeadlineRequestDialog
                open={requestDialogOpen}
                onOpenChange={setRequestDialogOpen}
                task={selectedTask}
                onSuccess={() => fetchData(false)}
            />

            <AlertDialog open={confirmReviewOpen} onOpenChange={setConfirmReviewOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ready for Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to move this task to "In Review"? This indicates that you've completed your work and it's ready for admin review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setConfirmReviewOpen(false);
                            setPendingStatusChange(null);
                            fetchData(false);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmMoveToReview}>
                            Yes, Move to Review
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Complete Task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this task as completed? This action will record the finish time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setConfirmCompleteOpen(false);
                            setPendingStatusChange(null);
                            fetchData(false);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmComplete}>
                            Yes, Mark Completed
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
};

export default TasksPage;
