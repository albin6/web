import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddContactLog } from '../hooks/useFollowups';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Phone } from 'lucide-react';

const contactLogSchema = z.object({
    successful: z.boolean(),
    notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

type ContactLogFormValues = z.infer<typeof contactLogSchema>;

interface ContactLogFormProps {
    followUpId: number;
}

export function ContactLogForm({ followUpId }: ContactLogFormProps) {
    const [open, setOpen] = useState(false);
    const addContactLogMutation = useAddContactLog();

    const form = useForm<ContactLogFormValues>({
        resolver: zodResolver(contactLogSchema),
        defaultValues: {
            successful: false,
            notes: '',
        },
    });

    const onSubmit = async (data: ContactLogFormValues) => {
        await addContactLogMutation.mutateAsync({
            followUpId,
            data: {
                successful: data.successful,
                notes: data.notes || undefined,
            },
        });
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Phone className="w-4 h-4 mr-2" />
                    Add Contact Log
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Contact Attempt</DialogTitle>
                    <DialogDescription>
                        Log your contact attempt with the student. If successful, the stage will automatically
                        transition to Contact Completed.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="successful"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Successful Contact</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Check if you successfully reached the student
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes about the contact attempt..."
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        {field.value?.length || 0}/500 characters
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addContactLogMutation.isPending}>
                                {addContactLogMutation.isPending ? 'Submitting...' : 'Submit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
