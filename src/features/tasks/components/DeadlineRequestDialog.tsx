import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/database';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const requestSchema = z.object({
    requested_deadline: z.date(),
    reason: z.string().min(10, 'Please provide a reason (at least 10 characters)').max(500, 'Reason is too long'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface DeadlineRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    onSuccess: () => void;
}

export const DeadlineRequestDialog = ({
    open,
    onOpenChange,
    task,
    onSuccess,
}: DeadlineRequestDialogProps) => {
    const [loading, setLoading] = useState(false);

    const form = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            reason: '',
        },
    });

    const onSubmit = async (values: RequestFormValues) => {
        if (!task) return;

        setLoading(true);
        try {
            await apiClient.createDeadlineRequest({
                task_id: task.id,
                requested_deadline: values.requested_deadline.toISOString(),
                reason: values.reason,
            });

            toast.success('Request Sent', {
                description: 'Your deadline extension request has been sent for approval.',
            });

            form.reset();
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error sending request:', error);
            toast.error('Error', {
                description: error.response?.data?.error || 'Failed to send request. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Deadline Extension</DialogTitle>
                    <DialogDescription>
                        Propose a new deadline and provide a reason for the extension request.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="requested_deadline"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>New Deadline</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Explain why you need more time..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Request'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
