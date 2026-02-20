import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type {
    FollowUp,
    ContactLog,
    Meeting,
    MeetingOutcome,
    Reminder,
    CreateFollowUpRequest,
    AddContactLogRequest,
    ScheduleMeetingRequest,
    SubmitOutcomeRequest,
    ApiResponse,
    PaginatedResponse,
    GetFollowUpsParams,
} from '@/types/followup';

export const followupService = {
    getFollowUps: async (params: GetFollowUpsParams): Promise<PaginatedResponse<FollowUp>> => {
        const response = await api.get(ENDPOINTS.FOLLOWUPS.LIST, { params });
        return response.data;
    },

    getFollowUpDetails: async (id: number): Promise<ApiResponse<FollowUp>> => {
        const response = await api.get(ENDPOINTS.FOLLOWUPS.DETAILS(id));
        return response.data;
    },

    createFollowUp: async (data: CreateFollowUpRequest): Promise<ApiResponse<FollowUp>> => {
        const response = await api.post(ENDPOINTS.FOLLOWUPS.CREATE, data);
        return response.data;
    },

    restartFollowUp: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.post(ENDPOINTS.FOLLOWUPS.RESTART(id));
        return response.data;
    },

    getContactLogs: async (followUpId: number): Promise<ApiResponse<ContactLog[]>> => {
        const response = await api.get(ENDPOINTS.FOLLOWUPS.CONTACTS.LIST(followUpId));
        return response.data;
    },

    addContactLog: async (
        followUpId: number,
        data: AddContactLogRequest
    ): Promise<ApiResponse<null>> => {
        const response = await api.post(ENDPOINTS.FOLLOWUPS.CONTACTS.CREATE(followUpId), data);
        return response.data;
    },

    getMeetings: async (followUpId: number): Promise<ApiResponse<Meeting[]>> => {
        const response = await api.get(ENDPOINTS.FOLLOWUPS.MEETINGS.LIST(followUpId));
        return response.data;
    },

    scheduleMeeting: async (
        followUpId: number,
        data: ScheduleMeetingRequest
    ): Promise<ApiResponse<Meeting>> => {
        const response = await api.post(ENDPOINTS.FOLLOWUPS.MEETINGS.CREATE(followUpId), data);
        return response.data;
    },

    completeMeeting: async (meetingId: number): Promise<ApiResponse<null>> => {
        const response = await api.patch(ENDPOINTS.MEETINGS.COMPLETE(meetingId));
        return response.data;
    },

    submitOutcome: async (
        meetingId: number,
        data: SubmitOutcomeRequest
    ): Promise<ApiResponse<MeetingOutcome>> => {
        const response = await api.post(ENDPOINTS.MEETINGS.OUTCOME(meetingId), data);
        return response.data;
    },

    getUpcomingReminders: async (): Promise<ApiResponse<Reminder[]>> => {
        const response = await api.get(ENDPOINTS.REMINDERS.UPCOMING);
        return response.data;
    },
};
