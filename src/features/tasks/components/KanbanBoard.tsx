import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
    defaultDropAnimationSideEffects,
    type DropAnimation,
    rectIntersection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types/database';
import { KanbanColumn } from './KanbanColumn';
import { SortableTaskCard } from './SortableTaskCard';
import { ListTodo, PlayCircle, FileCheck, CheckCircle } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onRequestDeadlineChange?: (task: Task) => void;
    isAdmin?: boolean;
    isReadOnly?: boolean;
    onApprove?: (task: Task) => void;
    onAddTask?: () => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export const KanbanBoard = ({
    tasks,
    onStatusChange,
    onEdit,
    onDelete,
    onRequestDeadlineChange,
    onApprove,
    onAddTask,
    isAdmin = false,
    isReadOnly = false,
}: KanbanBoardProps) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
    const scrollPosRef = useRef<number>(0);

    useLayoutEffect(() => {
        scrollPosRef.current = window.scrollY;
    });

    useEffect(() => {
        setLocalTasks(tasks);
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosRef.current);
        });
    }, [tasks]);

    const columns: { id: TaskStatus; title: string; icon: React.ReactNode }[] = [
        { id: 'todo', title: 'To Do', icon: <ListTodo className="h-5 w-5 text-muted-foreground" /> },
        { id: 'in_progress', title: 'In Progress', icon: <PlayCircle className="h-5 w-5 text-blue-500" /> },
        { id: 'in_review', title: 'In Review', icon: <FileCheck className="h-5 w-5 text-yellow-500" /> },
        { id: 'completed', title: 'Completed', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
    ];

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            todo: [],
            in_progress: [],
            in_review: [],
            completed: [],
        };

        localTasks.forEach((task) => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            } else {
                if (!grouped['completed']) grouped['completed'] = [];
                grouped['completed'].push(task);
            }
        });

        return grouped;
    }, [localTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const findContainer = (id: string) => {
        if (columns.some(col => col.id === id)) {
            return id as TaskStatus;
        }
        const task = localTasks.find(t => t.id === id);
        if (task) {
            return task.status;
        }
        return null;
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        if (isReadOnly) return;

        if (activeContainer === 'completed') {
            return;
        }

        if (!isAdmin && overContainer === 'completed') {
            return;
        }

        setLocalTasks((prevTasks) => {
            const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
            if (activeIndex === -1) return prevTasks;

            const newTasks = [...prevTasks];
            newTasks[activeIndex] = {
                ...prevTasks[activeIndex],
                status: overContainer
            };
            return newTasks;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;

        setActiveId(null);

        if (!over) {
            setLocalTasks(tasks);
            return;
        }

        const activeContainer = findContainer(activeId);
        const overId = over.id as string;
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer) {
            if (activeContainer === 'completed' && overContainer !== 'completed') {
                setLocalTasks(tasks);
                return;
            }

            if (!isAdmin && overContainer === 'completed') {
                setLocalTasks(tasks);
                return;
            }

            const finalTask = localTasks.find(t => t.id === activeId);
            const originalTask = tasks.find(t => t.id === activeId);

            if (finalTask && originalTask && finalTask.status !== originalTask.status) {
                onStatusChange(activeId, finalTask.status);
            }
        }
    };

    const activeTask = useMemo(
        () => tasks.find((t) => t.id === activeId),
        [activeId, tasks]
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="scroll-container-mobile">
                <div className="flex lg:grid lg:grid-cols-4 md:grid-cols-2 gap-4 md:gap-6 min-w-full">
                    {columns.map((col) => (
                        <div key={col.id} className="flex-shrink-0 min-w-[220px] max-w-[300px] w-auto lg:min-w-0 lg:max-w-none lg:w-auto">
                            <KanbanColumn
                                id={col.id}
                                title={col.title}
                                count={tasksByStatus[col.id].length}
                                tasks={tasksByStatus[col.id] || []}
                                onStatusChange={onStatusChange}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onApprove={onApprove}
                                onRequestDeadlineChange={onRequestDeadlineChange}
                                onAddTask={col.id === 'todo' ? onAddTask : undefined}
                                isAdmin={isAdmin}
                                isReadOnly={isReadOnly}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div className="min-w-[220px] max-w-[300px] opacity-90 cursor-grabbing transform rotate-2 scale-105 shadow-2xl pointer-events-none">
                        <SortableTaskCard
                            task={activeTask}
                            onStatusChange={() => { }}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onRequestDeadlineChange={() => { }}
                            onApprove={onApprove}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
