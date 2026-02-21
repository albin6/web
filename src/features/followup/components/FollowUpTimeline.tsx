import { FollowUpStage } from '@/types/followup';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUpTimelineProps {
    currentStage: FollowUpStage;
}

const stages = [
    { stage: FollowUpStage.CONTACT_PENDING, label: 'Contact Pending' },
    { stage: FollowUpStage.CONTACT_COMPLETED, label: 'Contact Completed' },
    { stage: FollowUpStage.MEETING_SCHEDULED, label: 'Meeting Scheduled' },
    { stage: FollowUpStage.MEETING_COMPLETED, label: 'Meeting Completed' },
];

const terminalStages = [
    { stage: FollowUpStage.SELECTED, label: 'Selected', color: 'text-green-600' },
    { stage: FollowUpStage.REJECTED, label: 'Rejected', color: 'text-red-600' },
];

export function FollowUpTimeline({ currentStage }: FollowUpTimelineProps) {
    const currentStageIndex = stages.findIndex((s) => s.stage === currentStage);
    const isTerminal = terminalStages.some((s) => s.stage === currentStage);
    const terminalStageInfo = terminalStages.find((s) => s.stage === currentStage);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-4">Progress Timeline</h3>

            {/* Main stages */}
            <div className="relative">
                {stages.map((stageInfo, index) => {
                    const isPast = currentStageIndex > index;
                    const isCurrent = currentStageIndex === index && !isTerminal;
                    const isFuture = currentStageIndex < index || isTerminal;

                    return (
                        <div key={stageInfo.stage} className="relative pb-8 last:pb-0">
                            {/* Connector line */}
                            {index < stages.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute left-4 top-8 w-0.5 h-8',
                                        isPast ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                                    )}
                                />
                            )}

                            {/* Stage item */}
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {isPast ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    ) : isCurrent ? (
                                        <Circle className="w-8 h-8 text-blue-500 fill-blue-500" />
                                    ) : (
                                        <Circle className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                                    )}
                                </div>
                                <div className="ml-4 flex-1">
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            isCurrent && 'text-blue-600 dark:text-blue-400',
                                            isPast && 'text-green-600 dark:text-green-400',
                                            isFuture && 'text-gray-400 dark:text-gray-600'
                                        )}
                                    >
                                        {stageInfo.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Terminal stages (if reached) */}
                {isTerminal && terminalStageInfo && (
                    <div className="relative pt-4">
                        {/* Connector line from last stage */}
                        <div className="absolute left-4 -top-4 w-0.5 h-8 bg-gray-300 dark:bg-gray-700" />

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckCircle2 className={cn('w-8 h-8', terminalStageInfo.color)} />
                            </div>
                            <div className="ml-4 flex-1">
                                <p className={cn('text-sm font-medium', terminalStageInfo.color)}>
                                    {terminalStageInfo.label}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
