export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type AppRole = 'admin' | 'user';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    is_approved: boolean;
    requested_role?: string;
    requested_team_id?: string;
    is_head_anywhere?: boolean;
    is_lead_anywhere?: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserRole {
    id: string;
    user_id: string;
    role: AppRole;
    created_at: string;
}

export interface Task {
    id: string;
    task_name: string;
    assigned_user_id: string;
    status: TaskStatus;
    start_time: string | null;
    finish_time: string | null;
    deadline: string;
    created_by: string;
    pending_approval: boolean;
    team_id: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    assigned_user?: Profile;
    deadline_requested?: boolean;
}

export interface DeadlineRequest {
    id: string;
    task_id: string;
    requested_by: string;
    current_deadline: string;
    requested_deadline: string;
    reason: string;
    status: RequestStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    // Joined data
    task?: Task;
    requester?: Profile;
}

// Team-related interfaces
export interface Team {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface TeamRole {
    id: string;
    team_id: string;
    role_name: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface CustomRole {
    id: string;
    team_id: string;
    role_name: string;
    can_manage_tasks: boolean;
    can_view_analytics: boolean;
    can_manage_members_limited: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: string;
    user_id: string;
    team_id: string;
    role_id: string | null;
    custom_role_id: string | null;
    position: string | null;
    is_head: boolean;
    is_lead: boolean;
    joined_at: string;
}

export interface TeamMemberDetail extends TeamMember {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role_name: string | null;
    custom_role?: CustomRole;
}

export interface TeamWithMembers extends Team {
    members: TeamMemberDetail[];
}

export interface UserTeamMembership {
    team_id: string;
    team_name: string;
    is_head: boolean;
    is_lead: boolean;
    role_name: string | null;
    can_manage_tasks: boolean;
    can_view_analytics: boolean;
    can_manage_members_limited: boolean;
}

export interface AssignableUser {
    user_id: string;
    email: string;
    full_name: string | null;
    is_head: boolean;
    is_lead: boolean;
}
