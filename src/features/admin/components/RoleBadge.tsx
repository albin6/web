import { Badge } from '@/components/ui/badge';
import type { AppRole } from '@/types/database';

interface RoleBadgeProps {
    role: AppRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
    const isAdmin = role === 'admin';
    return (
        <Badge variant={isAdmin ? 'default' : 'outline'} className={isAdmin ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none uppercase text-[10px]' : 'uppercase text-[10px]'}>
            {role}
        </Badge>
    );
}
