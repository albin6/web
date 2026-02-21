import { useState } from 'react';
import { userService } from '@/features/auth/services/userService';
import { useDebounce } from '@/lib/useDebounce';
import type { User } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSearchSelectProps {
    value?: string;
    onValueChange: (value: string | undefined) => void;
    placeholder?: string;
}

const roleColors = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    HEAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    LEAD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    MEMBER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function UserSearchSelect({
    value,
    onValueChange,
    placeholder = 'Select user...',
}: UserSearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['users-search', debouncedSearch],
        queryFn: () => userService.search(debouncedSearch, 10),
        enabled: debouncedSearch.length > 0,
    });

    const selectedUser = users.find((u) => u.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedUser ? (
                        <div className="flex items-center gap-2">
                            <span>{selectedUser.name}</span>
                            <span
                                className={cn(
                                    'text-xs px-2 py-0.5 rounded-full',
                                    roleColors[selectedUser.role]
                                )}
                            >
                                {selectedUser.role}
                            </span>
                        </div>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search users..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>
                        {isLoading ? 'Searching...' : 'No users found.'}
                    </CommandEmpty>
                    <CommandGroup>
                        {users.map((user) => (
                            <CommandItem
                                key={user.id}
                                value={user.id.toString()}
                                onSelect={() => {
                                    onValueChange(user.id === value ? undefined : user.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === user.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                <div className="flex items-center gap-2">
                                    <span>{user.name}</span>
                                    <span
                                        className={cn(
                                            'text-xs px-2 py-0.5 rounded-full',
                                            roleColors[user.role]
                                        )}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
