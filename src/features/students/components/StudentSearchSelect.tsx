import { useState } from 'react';
import { studentService } from '../services/studentService';
import { useDebounce } from '@/lib/useDebounce';
import type { Student } from '@/types/api';
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

interface StudentSearchSelectProps {
    value?: number;
    onValueChange: (value: number | undefined) => void;
    placeholder?: string;
}

export function StudentSearchSelect({
    value,
    onValueChange,
    placeholder = 'Select student...',
}: StudentSearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: students = [], isLoading } = useQuery<Student[]>({
        queryKey: ['students-search', debouncedSearch],
        queryFn: () => studentService.search(debouncedSearch, 10),
        enabled: debouncedSearch.length > 0,
    });

    const selectedStudent = students.find((s) => s.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedStudent ? (
                        <div className="flex flex-col items-start">
                            <span className="text-base">{selectedStudent.full_name}</span>
                            <span className="text-sm text-muted-foreground">
                                {selectedStudent.phone}
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
                        placeholder="Search students..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>
                        {isLoading ? 'Searching...' : 'No students found.'}
                    </CommandEmpty>
                    <CommandGroup>
                        {students.map((student) => (
                            <CommandItem
                                key={student.id}
                                value={student.id.toString()}
                                onSelect={() => {
                                    onValueChange(student.id === value ? undefined : student.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === student.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                <div className="flex flex-col">
                                    <span className="text-base font-medium">{student.full_name}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {student.phone}
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
