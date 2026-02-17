import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScheduleMeeting } from '../hooks/useFollowups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Calendar } from 'lucide-react';

const meetingScheduleSchema = z.object({
    scheduled_at: z.string().refine(
        (val) => {
            const date = new Date(val);
            return date > new Date();
        },
        { message: 'Meeting must be scheduled in the future' }
    ),
    meeting_link: z.string().url('Must be a valid URL'),
    participant_ids: z.string().refine(
        (val) => {
            const ids = val.split(',').map((id) => id.trim()).filter(Boolean);
            return ids.length >= 1 && ids.every((id) => !isNaN(Number(id)));
        },
        { message: 'Enter at least one valid participant ID (comma-separated)' }
    ),
});

type MeetingScheduleFormValues = z.infer<typeof meetingScheduleSchema>;

interface MeetingScheduleFormProps {
    followUpId: number;
}

export function MeetingScheduleForm({ followUpId }: MeetingScheduleFormProps) {
    const [open, setOpen] = useState(false);
    const scheduleMeetingMutation = useScheduleMeeting();

    const form = useForm<MeetingScheduleFormValues>({
        resolver: zodResolver(meetingScheduleSchema),
        defaultValues: {
            scheduled_at: '',
            meeting_link: '',
            participant_ids: '',
        },
    });

    const onSubmit = async (data: MeetingScheduleFormValues) => {
        const participantIds = data.participant_ids
            .split(',')
            .map((id) => Number(id.trim()))
            .filter(Boolean);

        await scheduleMeetingMutation.mutateAsync({
            followUpId,
            data: {
                scheduled_at: new Date(data.scheduled_at).toISOString(),
                meeting_link: data.meeting_link,
                participant_ids: participantIds,
            },
        });
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                    <DialogDescription>
                        Set up a meeting with the student and invite participants.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="scheduled_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting Date & Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormDescription>Must be a future date and time</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="meeting_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting Link</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://meet.google.com/abc-defg-hij"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Video conference link (Google Meet, Zoom, etc.)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="participant_ids"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Participant User IDs</FormLabel>
                                    <FormControl>
                                        <Input placeholder="2, 3, 4" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Comma-separated user IDs (at least one required)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={scheduleMeetingMutation.isPending}>
                                {scheduleMeetingMutation.isPending ? 'Scheduling...' : 'Schedule'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
