import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    initialValue: string;
    onSearch: (value: string) => void;
}

export function WorkScheduleSearch({ initialValue, onSearch }: Props) {
    const [value, setValue] = useState(initialValue);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (newValue: string) => {
        setValue(newValue);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const trimmed = newValue.trim();

        if (trimmed.length > 0 && trimmed.length < 3) {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            onSearch(newValue);
        }, 500);
    };

    return (
        <Input
            placeholder="Cari nama karyawan (min. 3 huruf)..."
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="h-7 p-4 placeholder:text-xs"
        />
    );
}
