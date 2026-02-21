import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateFollowUp } from '../hooks/useFollowups';
import { Button } from '@/components/ui/button';
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
import { Plus } from 'lucide-react';
import { StudentSearchSelect } from '@/features/students/components/StudentSearchSelect';
import { UserSearchSelect } from '@/features/auth/components/UserSearchSelect';

const createFollowUpSchema = z.object({
    student_id: z.string().min(1, 'Please select a student'),
    assigned_to: z.string().min(1, 'Please select a user'),
});

type CreateFollowUpFormValues = z.infer<typeof createFollowUpSchema>;

export function CreateFollowUpDialog() {
    const [open, setOpen] = useState(false);
    const createFollowUpMutation = useCreateFollowUp();

    const form = useForm<CreateFollowUpFormValues>({
        resolver: zodResolver(createFollowUpSchema),
        defaultValues: {
            student_id: '',
            assigned_to: '',
        },
    });

    const onSubmit = async (data: CreateFollowUpFormValues) => {
        await createFollowUpMutation.mutateAsync(data);
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Follow-Up
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Follow-Up</DialogTitle>
                    <DialogDescription>
                        Assign a new follow-up to a team member. Initial stage will be Contact Pending.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student</FormLabel>
                                    <FormControl>
                                        <StudentSearchSelect
                                            value={field.value || undefined}
                                            onValueChange={(value) => field.onChange(value || '')}
                                        />
                                    </FormControl>
                                    <FormDescription>Search and select the student to follow up with</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="assigned_to"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign To</FormLabel>
                                    <FormControl>
                                        <UserSearchSelect
                                            value={field.value || undefined}
                                            onValueChange={(value) => field.onChange(value || '')}
                                        />
                                    </FormControl>
                                    <FormDescription>Search and select the user who will handle this</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createFollowUpMutation.isPending}>
                                {createFollowUpMutation.isPending ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
