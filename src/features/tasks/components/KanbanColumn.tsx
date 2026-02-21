import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '@/types/database';
import { SortableTaskCard } from './SortableTaskCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    count: number;
    tasks: Task[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onRequestDeadlineChange?: (task: Task) => void;
    isAdmin?: boolean;
    isReadOnly?: boolean;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onApprove?: (task: Task) => void;
    onAddTask?: () => void;
}

export const KanbanColumn = ({
    id,
    title,
    count,
    tasks,
    onStatusChange,
    onRequestDeadlineChange,
    isAdmin = false,
    isReadOnly = false,
    onEdit,
    onDelete,
    onApprove,
    onAddTask
}: KanbanColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id
    });

    return (
        <div className="flex flex-col h-full min-h-[500px] bg-muted/40 rounded-xl border border-border/50 overflow-hidden shadow-sm transition-all hover:bg-muted/50">
            <div className={cn(
                "px-4 py-3 border-b flex items-center justify-between sticky top-0 bg-secondary/30 backdrop-blur-sm z-10",
                id === 'todo' && "border-l-4 border-l-blue-500",
                id === 'in_progress' && "border-l-4 border-l-yellow-500",
                id === 'in_review' && "border-l-4 border-l-purple-500",
                id === 'completed' && "border-l-4 border-l-green-500",
            )}>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs tracking-tight text-foreground/80 uppercase">{title}</h3>
                    <span className="bg-background/80 text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm">
                        {count}
                    </span>
                </div>
                {onAddTask && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-background/80"
                        onClick={onAddTask}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Task List */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent min-h-[150px] transition-colors",
                    isOver ? "bg-accent/20" : "bg-transparent"
                )}
            >

                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={onStatusChange}
                            onRequestDeadlineChange={onRequestDeadlineChange}
                            isAdmin={isAdmin}
                            isReadOnly={isReadOnly}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onApprove={onApprove}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 text-sm italic py-8 border-2 border-dashed border-muted-foreground/10 rounded-lg mx-2">
                        <span className="opacity-70">No tasks</span>
                    </div>
                )}
            </div>
        </div>
    );
};
