// Follow-up tracking types

export const FollowUpStage = {
    CONTACT_PENDING: 'CONTACT_PENDING',
    CONTACT_COMPLETED: 'CONTACT_COMPLETED',
    MEETING_SCHEDULED: 'MEETING_SCHEDULED',
    MEETING_COMPLETED: 'MEETING_COMPLETED',
    SELECTED: 'SELECTED',
    REJECTED: 'REJECTED',
} as const;

export type FollowUpStage = (typeof FollowUpStage)[keyof typeof FollowUpStage];

export const MeetingStatus = {
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
} as const;

export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];

export const OutcomeStatus = {
    SELECTED: 'SELECTED',
    REJECTED: 'REJECTED',
} as const;

export type OutcomeStatus = (typeof OutcomeStatus)[keyof typeof OutcomeStatus];

export interface StudentBasic {
    id: string;
    full_name: string;
    email: string;
    phone: string;
}

export interface AssignedUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface FollowUp {
    id: number;
    student_id: string;
    student: StudentBasic;
    assigned_to: string;
    assigned_user: AssignedUser;
    stage: FollowUpStage;
    created_at: string;
    updated_at: string;
}

export interface ContactLog {
    id: number;
    follow_up_id: number;
    successful: boolean;
    notes?: string;
    created_at: string;
    created_by: string;
}

export interface MeetingParticipant {
    id: number;
    user_id: string;
    meeting_id: number;
    user?: AssignedUser;
}

export interface Meeting {
    id: number;
    follow_up_id: number;
    follow_up?: {
        id: number;
        student: StudentBasic;
    };
    scheduled_at: string;
    meeting_link: string;
    status: MeetingStatus;
    created_by: string;
    creator: AssignedUser;
    participants?: MeetingParticipant[];
    created_at: string;
    updated_at: string;
}

export interface MeetingOutcome {
    id: number;
    meeting_id: number;
    status: OutcomeStatus;
    remarks: string;
    recording_url: string;
    next_follow_up_at?: string;
    created_at: string;
}

export interface Reminder {
    id: number;
    follow_up_id: number;
    follow_up: {
        id: number;
        student: StudentBasic;
    };
    remind_at: string;
    sent: boolean;
    sent_at?: string;
    created_at: string;
    updated_at: string;
}

// API Request types
export interface CreateFollowUpRequest {
    student_id: string;
    assigned_to: string;
}

export interface AddContactLogRequest {
    successful: boolean;
    notes?: string;
}

export interface ScheduleMeetingRequest {
    scheduled_at: string;
    meeting_link: string;
    participant_ids: string[];
}

export interface SubmitOutcomeRequest {
    status: OutcomeStatus;
    remarks: string;
    recording_url: string;
    next_follow_up_at?: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

// Query Parameters
export interface GetFollowUpsParams {
    stage?: FollowUpStage;
    assigned_to?: string;
    page?: number;
    limit?: number;
}
