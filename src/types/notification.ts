export interface Notification {
    id: string;
    type: 'FOLLOWUP_ASSIGNED';
    title: string;
    message: string;
    data: FollowUpAssignedData;
    created_at: string;
    read?: boolean;
}

export interface FollowUpAssignedData {
    followup_id: number;
    student_name: string;
    assigned_by: string;
}
