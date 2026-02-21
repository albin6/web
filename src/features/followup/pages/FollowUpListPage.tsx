import { useState } from 'react';
import { useFollowUpsList } from '../hooks/useFollowups';
import { useNavigate } from 'react-router-dom';
import { FollowUpStage } from '@/types/followup';
import { StageBadge } from '../components/StageBadge';
import { CreateFollowUpDialog } from '../components/CreateFollowUpDialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, PhoneCall } from 'lucide-react';
import { format } from 'date-fns';

export default function FollowUpListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [stageFilter, setStageFilter] = useState<FollowUpStage | undefined>();

    const { data, isLoading, error } = useFollowUpsList({
        page,
        limit,
        stage: stageFilter,
    });

    const followUps = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Follow-Ups</h1>
                    <p className="text-muted-foreground mt-1">Track student follow-ups and their progress</p>
                </div>
                <CreateFollowUpDialog />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <Select
                    value={stageFilter || 'all'}
                    onValueChange={(value) => {
                        setStageFilter(value === 'all' ? undefined : (value as FollowUpStage));
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        <SelectItem value={FollowUpStage.CONTACT_PENDING}>Contact Pending</SelectItem>
                        <SelectItem value={FollowUpStage.CONTACT_COMPLETED}>Contact Completed</SelectItem>
                        <SelectItem value={FollowUpStage.MEETING_SCHEDULED}>Meeting Scheduled</SelectItem>
                        <SelectItem value={FollowUpStage.MEETING_COMPLETED}>Meeting Completed</SelectItem>
                        <SelectItem value={FollowUpStage.SELECTED}>Selected</SelectItem>
                        <SelectItem value={FollowUpStage.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                </Select>

                {stageFilter && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setStageFilter(undefined); setPage(1); }}
                    >
                        Clear Filter
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">All Follow-Ups</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading follow-ups...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">
                            Failed to load follow-ups. Please try again.
                        </div>
                    ) : followUps.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 p-12 text-muted-foreground">
                            <PhoneCall className="h-8 w-8 opacity-40" />
                            <p className="font-medium">No follow-ups found</p>
                            <p className="text-sm">Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold text-foreground">ID</TableHead>
                                        <TableHead className="font-semibold text-foreground">Student</TableHead>
                                        <TableHead className="font-semibold text-foreground">Email</TableHead>
                                        <TableHead className="font-semibold text-foreground">Assigned To</TableHead>
                                        <TableHead className="font-semibold text-foreground">Stage</TableHead>
                                        <TableHead className="font-semibold text-foreground">Created</TableHead>
                                        <TableHead className="font-semibold text-foreground">Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {followUps.map((followUp) => (
                                        <TableRow
                                            key={followUp.id}
                                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                                            onClick={() => navigate(`/followups/${followUp.id}`)}
                                        >
                                            <TableCell className="font-medium text-muted-foreground">#{followUp.id}</TableCell>
                                            <TableCell className="font-medium">{followUp.student.full_name}</TableCell>
                                            <TableCell className="text-muted-foreground">{followUp.student.email}</TableCell>
                                            <TableCell>{followUp.assigned_user.name}</TableCell>
                                            <TableCell>
                                                <StageBadge stage={followUp.stage} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                                {format(new Date(followUp.created_at), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                                {format(new Date(followUp.updated_at), 'MMM d, yyyy')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <div className="flex items-center px-3 text-sm">
                            {page} / {pagination.total_pages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= pagination.total_pages}
                            className="gap-1"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
