import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubmitOutcome } from '../hooks/useFollowups';
import { OutcomeStatus } from '@/types/followup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { FileCheck } from 'lucide-react';

const outcomeSchema = z
    .object({
        status: z.nativeEnum(OutcomeStatus),
        remarks: z.string().min(1, 'Remarks are required').max(1000, 'Max 1000 characters'),
        recording_url: z.string().url('Must be a valid URL'),
        next_follow_up_at: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.status === OutcomeStatus.REJECTED) {
                return data.next_follow_up_at && data.next_follow_up_at.length > 0;
            }
            return true;
        },
        {
            message: 'Next follow-up date is required for rejected outcomes',
            path: ['next_follow_up_at'],
        }
    )
    .refine(
        (data) => {
            if (data.next_follow_up_at) {
                const date = new Date(data.next_follow_up_at);
                return date > new Date();
            }
            return true;
        },
        {
            message: 'Next follow-up date must be in the future',
            path: ['next_follow_up_at'],
        }
    );

type OutcomeFormValues = z.infer<typeof outcomeSchema>;

interface OutcomeSubmissionFormProps {
    meetingId: number;
    followUpId: number;
}

export function OutcomeSubmissionForm({ meetingId, followUpId }: OutcomeSubmissionFormProps) {
    const [open, setOpen] = useState(false);
    const submitOutcomeMutation = useSubmitOutcome();

    const form = useForm<OutcomeFormValues>({
        resolver: zodResolver(outcomeSchema),
        defaultValues: {
            status: OutcomeStatus.SELECTED,
            remarks: '',
            recording_url: '',
            next_follow_up_at: '',
        },
    });

    const watchStatus = form.watch('status');

    const onSubmit = async (data: OutcomeFormValues) => {
        await submitOutcomeMutation.mutateAsync({
            meetingId,
            followUpId,
            data: {
                status: data.status,
                remarks: data.remarks,
                recording_url: data.recording_url,
                next_follow_up_at: data.next_follow_up_at
                    ? new Date(data.next_follow_up_at).toISOString()
                    : undefined,
            },
        });
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Submit Outcome
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Submit Meeting Outcome</DialogTitle>
                    <DialogDescription>Submit the final decision for this follow-up.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Decision</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={OutcomeStatus.SELECTED} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Selected - Approve for program
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={OutcomeStatus.REJECTED} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Rejected - Needs more preparation
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide detailed remarks about the decision..."
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>{field.value?.length || 0}/1000 characters</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="recording_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recording URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://drive.google.com/recording123"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Link to meeting recording</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchStatus === OutcomeStatus.REJECTED && (
                            <FormField
                                control={form.control}
                                name="next_follow_up_at"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Next Follow-Up Date</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormDescription>When to follow up again (required for rejection)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitOutcomeMutation.isPending}>
                                {submitOutcomeMutation.isPending ? 'Submitting...' : 'Submit Outcome'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
