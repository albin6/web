import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import type { Task, TaskStatus } from '@/types/database';
import { format, formatDistanceToNow, isPast, isToday, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, Edit, Trash2, Timer, PlayCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TaskCardProps {
    task: Task;
    onStatusChange?: (taskId: string, status: TaskStatus) => void;
    onRequestDeadlineChange?: (task: Task) => void;
    isAdmin?: boolean;
    isReadOnly?: boolean;
    isDragging?: boolean;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onApprove?: (task: Task) => void;
}

export const TaskCard = ({
    task,
    onStatusChange,
    onRequestDeadlineChange,
    isAdmin = false,
    isReadOnly = false,
    isDragging = false,
    onEdit,
    onDelete,
    onApprove
}: TaskCardProps) => {
    const deadline = new Date(task.deadline);
    const today = new Date();

    const isOverdue = isPast(deadline) && !isToday(deadline) && task.status !== 'completed';
    const isDueToday = isToday(deadline);
    const diffInHours = differenceInHours(deadline, today);
    const isDueSoon = !isOverdue && !isDueToday && diffInHours > 0 && diffInHours <= 48;

    const getUrgencyColor = () => {
        if (task.status === 'completed') return 'text-muted-foreground';
        if (isOverdue) return 'text-destructive';
        if (isDueToday) return 'text-orange-500';
        if (isDueSoon) return 'text-amber-500';
        return 'text-muted-foreground';
    };

    const urgencyColor = getUrgencyColor();

    const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
        const statusFlow: Record<TaskStatus, TaskStatus | null> = {
            todo: 'in_progress',
            in_progress: 'in_review',
            in_review: isAdmin ? 'completed' : null,
            completed: null,
        };
        return statusFlow[currentStatus];
    };

    const getStatusButtonText = (nextStatus: TaskStatus | null): string => {
        if (!nextStatus) return '';
        if (nextStatus === 'in_progress') return 'Start Working';
        if (nextStatus === 'in_review') return 'Ready for Review';
        if (nextStatus === 'completed') return 'Mark as Completed';
        return `Move to ${nextStatus.replace('_', ' ')}`;
    };

    const nextStatus = getNextStatus(task.status);

    return (
        <Card
            className={cn(
                "mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-l-4 group relative",
                isDragging ? "opacity-50 shadow-lg scale-105" : "opacity-100",
                task.status === 'todo' && "border-l-blue-500/50 hover:border-l-blue-500",
                task.status === 'in_progress' && "border-l-yellow-500/50 hover:border-l-yellow-500",
                task.status === 'in_review' && "border-l-purple-500/50 hover:border-l-purple-500",
                task.status === 'completed' && "border-l-green-500/50 hover:border-l-green-500",
                "bg-card/50 backdrop-blur-sm"
            )}
        >
            {/* Status Glow / Indicator */}
            {isOverdue && task.status !== 'completed' && (
                <div className="absolute left-0 top-0 h-full w-1 bg-destructive/80 z-10" />
            )}

            <CardHeader className="pb-2 px-3 pt-3">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-sm leading-tight text-foreground/90 line-clamp-2">
                        {task.task_name}
                    </h4>

                    {!isReadOnly && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                                    onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            )}
                            {onDelete && isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pending approval indicator */}
                {task.pending_approval && (
                    <div className="mt-1 py-0.5 px-2 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 animate-pulse w-fit">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Pending Approval</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-3 pt-0 space-y-3">
                {/* Metadata Row: Deadline & Assignee */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                        urgencyColor,
                        task.status !== 'completed' && (isOverdue || isDueToday) ? "bg-muted/50 font-medium" : ""
                    )}>
                        <Calendar className={cn("h-3 w-3", isOverdue ? "animate-bounce" : "")} />
                        <span>{isDueToday ? 'Today' : format(deadline, 'MMM d')}</span>
                        {!isOverdue && !isDueToday && isDueSoon && (
                            <span className="text-[9px] font-semibold text-amber-600 ml-1">
                                {formatDistanceToNow(deadline, { addSuffix: true })}
                            </span>
                        )}
                    </div>

                    {task.assigned_user ? (
                        <div className="flex items-center gap-1.5" title={`Assigned to ${task.assigned_user.full_name}`}>
                            <Avatar className="h-5 w-5 border border-border">
                                <AvatarImage src={task.assigned_user.avatar_url || undefined} />
                                <AvatarFallback className="text-[9px]">
                                    {task.assigned_user.full_name?.slice(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="max-w-[80px] truncate opacity-80 hover:opacity-100">
                                {task.assigned_user.full_name?.split(' ')[0]}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 opacity-50">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[9px]"><Clock className="h-3 w-3" /></AvatarFallback>
                            </Avatar>
                            <span>Unassigned</span>
                        </div>
                    )}
                </div>

                {/* Tags for overdue/due soon */}
                <div className="flex flex-wrap gap-1">
                    {isOverdue && task.status !== 'completed' && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[9px] tracking-widest uppercase">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                        </Badge>
                    )}
                    {isDueToday && task.status !== 'completed' && (
                        <Badge className="bg-orange-600 hover:bg-orange-700 h-5 px-1.5 text-[9px] tracking-widest uppercase">
                            <Clock className="h-3 w-3 mr-1" />
                            Due Today
                        </Badge>
                    )}
                    {isDueSoon && task.status !== 'completed' && (
                        <Badge className="bg-amber-600 hover:bg-amber-700 h-5 px-1.5 text-[9px] tracking-widest uppercase">
                            <Clock className="h-3 w-3 mr-1" />
                            Due Soon
                        </Badge>
                    )}

                    {(task.status === 'completed' || task.status === 'in_review') && task.finish_time && (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 rounded h-5 text-[9px] uppercase font-bold tracking-wider">
                            <Timer className="h-3 w-3" />
                            {(() => {
                                const start = task.start_time ? new Date(task.start_time) : new Date(task.created_at);
                                const end = new Date(task.finish_time);
                                const days = differenceInDays(end, start);
                                const hours = differenceInHours(end, start);
                                const minutes = differenceInMinutes(end, start);
                                if (days > 0) return `${days}d`;
                                if (hours > 0) return `${hours}h`;
                                return `${minutes}m`;
                            })()}
                        </div>
                    )}

                    {task.start_time && !task.finish_time && (
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-1.5 rounded h-5 text-[9px] uppercase font-bold tracking-wider">
                            <PlayCircle className="h-3 w-3" />
                            Started
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
                    {/* Admin: Approve completion */}
                    {isAdmin && task.pending_approval && (
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                            onClick={(e) => { e.stopPropagation(); onApprove?.(task); }}
                        >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Approve Completion
                        </Button>
                    )}

                    {/* Admin: Direct Mark as Completed for reviewed tasks */}
                    {isAdmin && task.status === 'in_review' && !task.pending_approval && (
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                            onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'completed'); }}
                        >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Mark as Completed
                        </Button>
                    )}

                    {/* User: Update status */}
                    {!isAdmin && !isReadOnly && nextStatus && !task.pending_approval && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, nextStatus); }}
                            className="w-full h-8 text-xs"
                        >
                            {getStatusButtonText(nextStatus)}
                        </Button>
                    )}

                    {/* User: Request deadline change */}
                    {!isAdmin && !isReadOnly && task.status !== 'completed' && !task.pending_approval && !task.deadline_requested && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onRequestDeadlineChange?.(task); }}
                            className="w-full h-8 text-xs"
                        >
                            Request Extension
                        </Button>
                    )}

                    {/* Admin: Change status dropdown */}
                    {isAdmin && task.status !== 'completed' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] uppercase text-muted-foreground">
                                    Change Status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {(['todo', 'in_progress', 'in_review', 'completed'] as TaskStatus[]).map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={() => onStatusChange?.(task.id, status)}
                                        disabled={status === task.status}
                                    >
                                        <StatusBadge status={status} />
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
