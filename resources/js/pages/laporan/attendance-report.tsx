import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface Option {
    id: number;
    name: string;
}
 
interface Props {
    offices: Option[];
}
export default function AttendanceReport({ offices }: Props) {
    const [filters, setFilters] = useState({
        office_id: 'all',
        start_date: '',
        end_date: '',
    });

    const handleExport = () => {
        const params = {
            office_id: filters.office_id !== 'all' ? filters.office_id : undefined,
            start_date: filters.start_date || undefined,
            end_date: filters.end_date || undefined,
        };

        window.open(route('laporan.attendance.export', params), '_blank');
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Export Rekap Presensi',
                    href: route('laporan.attendance.report'),
                },
            ]}
        >
            <Head title="Export Rekap Presensi" />

            <div className="p-6">
                <div className=" space-y-6 rounded-xl border p-6">
                    <h1 className="text-xl font-semibold">Export Rekap Presensi</h1>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label>Kantor</Label>

                            <Select
                                value={filters.office_id}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        office_id: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kantor" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua Kantor</SelectItem>

                                    {offices.map((office) => (
                                        <SelectItem key={office.id} value={String(office.id)}>
                                            {office.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tanggal Awal</Label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />

                                        {filters.start_date
                                            ? format(new Date(filters.start_date), 'dd/MM/yyyy')
                                            : 'Pilih Tanggal'}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align='start'>
                                    <Calendar
                                        mode="single"
                                        selected={filters.start_date ? new Date(filters.start_date) : undefined}
                                        onSelect={(date) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                start_date: date ? format(date, 'yyyy-MM-dd') : '',
                                            }))
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>Tanggal Akhir</Label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />

                                        {filters.end_date
                                            ? format(new Date(filters.end_date), 'dd/MM/yyyy')
                                            : 'Pilih Tanggal'}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align='start'>
                                    <Calendar
                                        mode="single"
                                        selected={filters.end_date ? new Date(filters.end_date) : undefined}
                                        onSelect={(date) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                end_date: date ? format(date, 'yyyy-MM-dd') : '',
                                            }))
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button onClick={handleExport} className="w-fit">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
