import { Badge } from '@/components/ui/badge';

interface UserStatusBadgeProps {
    isApproved: boolean;
}

export default function UserStatusBadge({ isApproved }: UserStatusBadgeProps) {
    return (
        <Badge variant={isApproved ? 'secondary' : 'outline'} className={isApproved ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none'}>
            {isApproved ? 'Approved' : 'Pending'}
        </Badge>
    );
}
