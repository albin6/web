import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/types/database';

interface SortableTaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onRequestDeadlineChange?: (task: Task) => void;
    onApprove?: (task: Task) => void;
    isAdmin?: boolean;
    isReadOnly?: boolean;
}

export const SortableTaskCard = ({
    task,
    onStatusChange,
    onEdit,
    onDelete,
    onRequestDeadlineChange,
    onApprove,
    isAdmin = false,
    isReadOnly = false,
}: SortableTaskCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.05 : 1,
        cursor: isDragging ? 'grabbing' : (isReadOnly ? 'default' : 'grab'),
        touchAction: isReadOnly ? 'auto' : 'none',
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...(!isReadOnly ? listeners : {})} className="mb-3">
            <TaskCard
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestDeadlineChange={onRequestDeadlineChange}
                onApprove={onApprove ? () => onApprove(task) : undefined}
                isAdmin={isAdmin}
                isReadOnly={isReadOnly}
            />
        </div>
    );
};
