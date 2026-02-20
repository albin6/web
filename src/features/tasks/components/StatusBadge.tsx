import { Badge } from '@/components/ui/badge';
import type { TaskStatus, RequestStatus } from '@/types/database';
import { Circle, Clock, Eye, CheckCircle, CheckCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface StatusBadgeProps {
    status: TaskStatus | RequestStatus;
    showIcon?: boolean;
}

const taskStatusConfig: Record<TaskStatus, { label: string; className: string; icon: React.ReactNode }> = {
    todo: { label: 'To Do', className: 'bg-slate-500 hover:bg-slate-600', icon: <Circle className="h-3 w-3" /> },
    in_progress: { label: 'In Progress', className: 'bg-blue-500 hover:bg-blue-600', icon: <Clock className="h-3 w-3" /> },
    in_review: { label: 'In Review', className: 'bg-amber-500 hover:bg-amber-600', icon: <Eye className="h-3 w-3" /> },
    completed: { label: 'Completed', className: 'bg-emerald-500 hover:bg-emerald-600', icon: <CheckCheck className="h-3 w-3" /> },
};

const requestStatusConfig: Record<RequestStatus, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', className: 'bg-amber-500 hover:bg-amber-600', icon: <AlertCircle className="h-3 w-3" /> },
    approved: { label: 'Approved', className: 'bg-green-500 hover:bg-green-600', icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { label: 'Rejected', className: 'bg-destructive hover:bg-destructive/90', icon: <Circle className="h-3 w-3" /> },
};

export const StatusBadge = ({ status, showIcon = true }: StatusBadgeProps) => {
    const isTaskStatus = status in taskStatusConfig;
    const config = isTaskStatus
        ? taskStatusConfig[status as TaskStatus]
        : requestStatusConfig[status as RequestStatus];

    if (!config) return null;

    return (
        <Badge className={cn("gap-1.5", config.className)}>
            {showIcon && config.icon}
            {config.label}
        </Badge>
    );
};
