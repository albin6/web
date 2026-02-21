import { FollowUpStage } from '@/types/followup';
import { cn } from '@/lib/utils';

interface StageBadgeProps {
    stage: FollowUpStage;
    className?: string;
}

const stageConfig = {
    [FollowUpStage.CONTACT_PENDING]: {
        label: 'Contact Pending',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    [FollowUpStage.CONTACT_COMPLETED]: {
        label: 'Contact Completed',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    [FollowUpStage.MEETING_SCHEDULED]: {
        label: 'Meeting Scheduled',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    },
    [FollowUpStage.MEETING_COMPLETED]: {
        label: 'Meeting Completed',
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    },
    [FollowUpStage.SELECTED]: {
        label: 'Selected',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    [FollowUpStage.REJECTED]: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
};

export function StageBadge({ stage, className }: StageBadgeProps) {
    const config = stageConfig[stage];

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
}
