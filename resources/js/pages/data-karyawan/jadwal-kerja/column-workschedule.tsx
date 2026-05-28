import { ColumnDef } from '@tanstack/react-table';
import { Shift, WorkSchedule } from '@/types/data-karyawan/work-schedule-list';

import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { toast } from 'sonner';
import { CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface PeriodDate {
    date: string;
    day: number;
    month: number;
    year: number;
    day_name: string;
}

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

export const columnWorkSchedules = (periodDates: PeriodDate[], shifts: Shift[]): ColumnDef<WorkSchedule>[] => {
    const now = new Date();

    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
    ).padStart(2, '0')}`;

    const baseColumns: ColumnDef<WorkSchedule>[] = [
       
        {
            accessorKey: 'employee_name',
            header: 'Nama Karyawan',
            cell: ({ row }) => row.original.name,
            meta: {
                sticky: 'left',
            },
        },
    ];

    const dayColumns: ColumnDef<WorkSchedule>[] = [];

    const updateSchedule = async (id: number, value: string) => {
        let payload: any = {};

        if (value === 'off') {
            payload = {
                is_off: true,
                shift_id: null,
            };
        } else {
            payload = {
                is_off: false,
                shift_id: Number(value),
            };
        }

        router.patch(route('workschedule.updateDay', id), payload, {
            preserveScroll: true,
            onSuccess: handleToast,
        });
    };

    periodDates.forEach((period) => {
        const isToday = todayString === period.date;

        dayColumns.push({
            id: `day_${period.date}`,

            header: () => {
                const [year, month, day] = period.date.split('-').map(Number);

                const dateObj = new Date(year, month - 1, day);

                const fullDate = dateObj.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });

                return (
                    <div
                        className={`px-3 py-1 text-center text-[10px] leading-tight font-semibold ${
                            isToday ? 'rounded bg-black text-white' : ''
                        }`}
                    >
                        <div>{period.day_name}</div>

                        <div>{fullDate}</div>
                    </div>
                );
            },

            cell: ({ row }) => {
                const day = row.original.dayMap?.[period.date];

                const [selectedValue, setSelectedValue] = useState(
                    day?.is_off ? 'off' : day?.shift_id ? day.shift_id.toString() : '',
                );

                const [pendingValue, setPendingValue] = useState('');

                const [open, setOpen] = useState(false);

                if (!day) {
                    return <div>-</div>;
                }

                const selectedShiftName =
                    pendingValue === 'off' ? 'Libur' : shifts.find((s) => s.id.toString() === pendingValue)?.name_shift;

                const handleConfirm = async () => {
                    await updateSchedule(day.id, pendingValue);

                    setSelectedValue(pendingValue);

                    setOpen(false);
                };

                return (
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogTrigger asChild>
                            <div>
                                <Select
                                    value={selectedValue}
                                    onValueChange={(value) => {
                                        setPendingValue(value);
                                        setOpen(true);
                                    }}
                                >
                                    <SelectTrigger className="h-6">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="off">Libur</SelectItem>

                                        {shifts.map((s: Shift) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name_shift}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AlertDialogTrigger>

                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <CheckCheck className="text-green-600" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>Update Shift</AlertDialogTitle>

                                <AlertDialogDescription>
                                    Apakah kamu yakin ingin mengganti shift menjadi{' '}
                                    <span className="font-semibold">{selectedShiftName}</span> ?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setPendingValue('');
                                    }}
                                >
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction className="bg-green-600! hover:bg-black!" onClick={handleConfirm}>
                                    Ya, Update
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            },
        });
    });

    return [...baseColumns, ...dayColumns];
};
