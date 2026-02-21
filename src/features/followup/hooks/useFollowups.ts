import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupService } from '../services/followupService';
import type {
    GetFollowUpsParams,
    CreateFollowUpRequest,
    AddContactLogRequest,
    ScheduleMeetingRequest,
    SubmitOutcomeRequest,
} from '@/types/followup';
import { toast } from 'sonner';

export const followupKeys = {
    all: ['followups'] as const,
    lists: () => [...followupKeys.all, 'list'] as const,
    list: (params: GetFollowUpsParams) => [...followupKeys.lists(), params] as const,
    details: () => [...followupKeys.all, 'detail'] as const,
    detail: (id: number) => [...followupKeys.details(), id] as const,
    contacts: (id: number) => [...followupKeys.all, 'contacts', id] as const,
    meetings: (id: number) => [...followupKeys.all, 'meetings', id] as const,
    reminders: () => ['reminders', 'upcoming'] as const,
};

export function useFollowUpsList(params: GetFollowUpsParams = {}) {
    return useQuery({
        queryKey: followupKeys.list(params),
        queryFn: () => followupService.getFollowUps(params),
    });
}

export function useFollowUpDetails(id: number) {
    return useQuery({
        queryKey: followupKeys.detail(id),
        queryFn: () => followupService.getFollowUpDetails(id),
        enabled: !!id,
    });
}

export function useCreateFollowUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFollowUpRequest) => followupService.createFollowUp(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success(response.message || 'Follow-up created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create follow-up');
        },
    });
}

export function useRestartFollowUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => followupService.restartFollowUp(id),
        onSuccess: (response, id) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success(response.message || 'Follow-up restarted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to restart follow-up');
        },
    });
}

export function useContactLogs(followUpId: number) {
    return useQuery({
        queryKey: followupKeys.contacts(followUpId),
        queryFn: () => followupService.getContactLogs(followUpId),
        enabled: !!followUpId,
    });
}

export function useAddContactLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ followUpId, data }: { followUpId: number; data: AddContactLogRequest }) =>
            followupService.addContactLog(followUpId, data),
        onSuccess: (response, { followUpId }) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.detail(followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.contacts(followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success(response.message || 'Contact log added successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add contact log');
        },
    });
}

export function useMeetings(followUpId: number) {
    return useQuery({
        queryKey: followupKeys.meetings(followUpId),
        queryFn: () => followupService.getMeetings(followUpId),
        enabled: !!followUpId,
    });
}

export function useScheduleMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ followUpId, data }: { followUpId: number; data: ScheduleMeetingRequest }) =>
            followupService.scheduleMeeting(followUpId, data),
        onSuccess: (response, { followUpId }) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.detail(followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.meetings(followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success(response.message || 'Meeting scheduled successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to schedule meeting');
        },
    });
}

export function useCompleteMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ meetingId }: { meetingId: number; followUpId: number }) =>
            followupService.completeMeeting(meetingId),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.detail(variables.followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.meetings(variables.followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            toast.success(response.message || 'Meeting marked as completed');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to complete meeting');
        },
    });
}

export function useSubmitOutcome() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            meetingId,
            data,
        }: {
            meetingId: number;
            followUpId: number;
            data: SubmitOutcomeRequest;
        }) => followupService.submitOutcome(meetingId, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: followupKeys.detail(variables.followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.meetings(variables.followUpId) });
            queryClient.invalidateQueries({ queryKey: followupKeys.lists() });
            queryClient.invalidateQueries({ queryKey: followupKeys.reminders() });
            toast.success(response.message || 'Outcome submitted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit outcome');
        },
    });
}

export function useUpcomingReminders() {
    return useQuery({
        queryKey: followupKeys.reminders(),
        queryFn: () => followupService.getUpcomingReminders(),
    });
}
