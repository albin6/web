import { useUpcomingReminders } from '../hooks/useFollowups';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UpcomingRemindersPanel() {
    const { data, isLoading, error } = useUpcomingReminders();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Upcoming Reminders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Upcoming Reminders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">Failed to load reminders</p>
                </CardContent>
            </Card>
        );
    }

    const reminders = data?.data || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Upcoming Reminders
                </CardTitle>
                <CardDescription>Follow-ups requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
                {reminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming reminders</p>
                ) : (
                    <div className="space-y-3">
                        {reminders.map((reminder) => (
                            <Link
                                key={reminder.id}
                                to={`/followups/${reminder.follow_up_id}`}
                                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{reminder.follow_up.student.full_name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Follow-up ID: #{reminder.follow_up_id}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(reminder.remind_at), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
