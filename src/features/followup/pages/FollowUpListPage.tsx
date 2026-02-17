import { useState } from 'react';
import { useFollowUpsList } from '../hooks/useFollowups';
import { useNavigate } from 'react-router-dom';
import { FollowUpStage } from '@/types/followup';
import { StageBadge } from '../components/StageBadge';
import { CreateFollowUpDialog } from '../components/CreateFollowUpDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function FollowUpListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [stageFilter, setStageFilter] = useState<FollowUpStage | undefined>();
    const [assignedToFilter, setAssignedToFilter] = useState<number | undefined>();

    const { data, isLoading, error } = useFollowUpsList({
        page,
        limit,
        stage: stageFilter,
        assigned_to: assignedToFilter,
    });

    const followUps = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Follow-Ups</h1>
                    <p className="text-muted-foreground">Track student follow-ups and their progress</p>
                </div>
                <CreateFollowUpDialog />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter follow-ups by stage or assigned user</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="w-64">
                        <Select
                            value={stageFilter || 'all'}
                            onValueChange={(value) => {
                                setStageFilter(value === 'all' ? undefined : (value as FollowUpStage));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
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
                    </div>

                    <div className="w-64">
                        <Input
                            type="number"
                            placeholder="Filter by Assigned User ID"
                            value={assignedToFilter || ''}
                            onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined;
                                setAssignedToFilter(value);
                                setPage(1);
                            }}
                        />
                    </div>

                    {(stageFilter || assignedToFilter) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStageFilter(undefined);
                                setAssignedToFilter(undefined);
                                setPage(1);
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading follow-ups...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">
                            Failed to load follow-ups. Please try again.
                        </div>
                    ) : followUps.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No follow-ups found. Create one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {followUps.map((followUp) => (
                                    <TableRow
                                        key={followUp.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/followups/${followUp.id}`)}
                                    >
                                        <TableCell className="font-medium">#{followUp.id}</TableCell>
                                        <TableCell>{followUp.student.full_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{followUp.student.email}</TableCell>
                                        <TableCell>{followUp.assigned_user.name}</TableCell>
                                        <TableCell>
                                            <StageBadge stage={followUp.stage} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(followUp.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(followUp.updated_at), 'MMM d, yyyy')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-2 px-3">
                            Page {page} of {pagination.total_pages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= pagination.total_pages}
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
