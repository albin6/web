import { useParams } from 'react-router-dom';
import { useFollowUpDetails, useContactLogs, useMeetings, useCompleteMeeting, useRestartFollowUp } from '../hooks/useFollowups';
import { FollowUpStage } from '@/types/followup';
import { StageBadge } from '../components/StageBadge';
import { FollowUpTimeline } from '../components/FollowUpTimeline';
import { ContactLogForm } from '../components/ContactLogForm';
import { MeetingScheduleForm } from '../components/MeetingScheduleForm';
import { OutcomeSubmissionForm } from '../components/OutcomeSubmissionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, CheckCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function FollowUpDetailPage() {
    const { id } = useParams<{ id: string }>();
    const followUpId = Number(id);

    const { data: followUpData, isLoading: loadingFollowUp, error: followUpError } = useFollowUpDetails(followUpId);
    const { data: contactLogsData } = useContactLogs(followUpId);
    const { data: meetingsData } = useMeetings(followUpId);
    const completeMeetingMutation = useCompleteMeeting();
    const restartMutation = useRestartFollowUp();

    if (loadingFollowUp) {
        return <div className="p-8 text-center">Loading follow-up details...</div>;
    }

    if (followUpError || !followUpData?.data) {
        return (
            <div className="p-8 text-center text-destructive">
                Failed to load follow-up details. You may not have permission to view this.
            </div>
        );
    }

    const followUp = followUpData.data;
    const contactLogs = contactLogsData?.data || [];
    const meetings = meetingsData?.data || [];
    const scheduledMeeting = meetings.find((m) => m.status === 'SCHEDULED');
    const completedMeeting = meetings.find((m) => m.status === 'COMPLETED');

    const handleCompleteMeeting = (meetingId: number) => {
        completeMeetingMutation.mutate({ meetingId, followUpId });
    };

    const handleRestart = () => {
        restartMutation.mutate(followUpId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/followups">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Follow-Up #{followUp.id}</h1>
                    <p className="text-muted-foreground">Track progress and manage follow-up actions</p>
                </div>
                <StageBadge stage={followUp.stage} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{followUp.student.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <p>{followUp.student.email}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <p>{followUp.student.phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned User */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned To</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">{followUp.assigned_user.name}</p>
                            <p className="text-sm text-muted-foreground">{followUp.assigned_user.email}</p>
                            <Badge variant="outline">{followUp.assigned_user.role}</Badge>
                        </CardContent>
                    </Card>

                    {/* Actions based on stage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>Available actions for current stage</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-3">
                            {followUp.stage === FollowUpStage.CONTACT_PENDING && (
                                <ContactLogForm followUpId={followUpId} />
                            )}

                            {followUp.stage === FollowUpStage.CONTACT_COMPLETED && (
                                <MeetingScheduleForm followUpId={followUpId} />
                            )}

                            {followUp.stage === FollowUpStage.MEETING_SCHEDULED && scheduledMeeting && (
                                <Button onClick={() => handleCompleteMeeting(scheduledMeeting.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Complete Meeting
                                </Button>
                            )}

                            {followUp.stage === FollowUpStage.MEETING_COMPLETED && completedMeeting && (
                                <OutcomeSubmissionForm meetingId={completedMeeting.id} followUpId={followUpId} />
                            )}

                            {followUp.stage === FollowUpStage.REJECTED && (
                                <Button onClick={handleRestart} variant="outline">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restart Follow-Up
                                </Button>
                            )}

                            {(followUp.stage === FollowUpStage.SELECTED || followUp.stage === FollowUpStage.REJECTED) && (
                                <p className="text-sm text-muted-foreground py-2">
                                    This follow-up has reached a terminal stage.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Logs */}
                    {contactLogs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Logs</CardTitle>
                                <CardDescription>History of contact attempts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {contactLogs.map((log) => (
                                        <div key={log.id} className="flex gap-3">
                                            {log.successful ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={log.successful ? 'default' : 'secondary'}>
                                                        {log.successful ? 'Successful' : 'Unsuccessful'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                                                    </span>
                                                </div>
                                                {log.notes && (
                                                    <p className="text-sm mt-2 text-muted-foreground">{log.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Meetings */}
                    {meetings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Meetings</CardTitle>
                                <CardDescription>Scheduled and completed meetings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {meetings.map((meeting) => (
                                        <div key={meeting.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <Badge variant={meeting.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                                    {meeting.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(meeting.scheduled_at), 'MMM d, yyyy h:mm a')}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Meeting Link</p>
                                                    <a
                                                        href={meeting.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {meeting.meeting_link}
                                                    </a>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Created By</p>
                                                    <p className="text-sm">{meeting.creator.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Timeline */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                            <CardDescription>Progress through stages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FollowUpTimeline currentStage={followUp.stage} />
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Timestamps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Created</p>
                                <p>{format(new Date(followUp.created_at), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-muted-foreground">Last Updated</p>
                                <p>{format(new Date(followUp.updated_at), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
