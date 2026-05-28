
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
    close: () => void;
}

export default function GeneratePayrollDialog({ close }: Props) {
    const { data, setData, post, processing } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        dates: [] as string[],
    });

    const months = [
        { value: 1, label: '26 Des - 25 Jan' },
        { value: 2, label: '26 Jan - 25 Feb' },
        { value: 3, label: '26 Feb - 25 Mar' },
        { value: 4, label: '26 Mar - 25 Apr' },
        { value: 5, label: '26 Apr - 25 Mei' },
        { value: 6, label: '26 Mei - 25 Jun' },
        { value: 7, label: '26 Jun - 25 Jul' },
        { value: 8, label: '26 Jul - 25 Ags' },
        { value: 9, label: '26 Ags - 25 Sep' },
        { value: 10, label: '26 Sep - 25 Okt' },
        { value: 11, label: '26 Okt - 25 Nov' },
        { value: 12, label: '26 Nov - 25 Des' },
    ];

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 20 }, (_, i) => currentYear - 2 + i);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('payroll.generate'), {
            preserveScroll: true,
            onSuccess: () => {
                close();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
                <Label>Bulan</Label>

                <Select
                    value={String(data.month)}
                    onValueChange={(value) => setData('month', Number(value))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>

                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem
                                key={month.value}
                                value={String(month.value)}
                            >
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Tahun</Label>

                <Select
                    value={String(data.year)}
                    onValueChange={(value) => setData('year', Number(value))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>

                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Pilih Tanggal Merah (Opsional)</Label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left"
                        >
                            {data.dates.length > 0
                                ? `${data.dates.length} tanggal dipilih`
                                : 'Pilih tanggal'}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="multiple"
                            selected={data.dates.map((d) => new Date(d))}
                            onSelect={(dates) => {
                                setData(
                                    'dates',
                                    (dates || []).map((date) =>
                                        format(date, 'yyyy-MM-dd'),
                                    ),
                                );
                            }}
                        />
                    </PopoverContent>
                </Popover>

                {data.dates.length > 0 && (
                    <div className="text-xs text-red-500">
                        {data.dates.join(' || ')}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={processing}
                className="w-full cursor-pointer"
            >
                {processing ? 'Generating...' : 'Generate Payroll'}
            </Button>
        </form>
    );
}