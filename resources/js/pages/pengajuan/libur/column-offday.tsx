import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCheck, X } from 'lucide-react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OffdayList } from '@/types/pengajuan/offdaylist';

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
import { Checkbox } from '@/components/ui/checkbox';

const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

type OffdayColumnProps = {
    selectedKeys: Set<string>;
    onToggle: (key: string, checked: boolean) => void;
    onToggleAll: (checked: boolean) => void;
    allSelected: boolean;
    someSelected: boolean;
};

const updateStatus = (item: OffdayList, status: 'approved' | 'rejected') => {
    router.patch(
        route('offday.updateGroupStatus'),
        {
            employee_id: item.employee_id,
            period_start: item.period_start,
            current_status: item.status,
            status,
        },
        {
            preserveScroll: true,

            onSuccess: (page) => {
                const flash = page.props.flash as {
                    success?: string;
                    error?: string;
                };

                if (flash?.success) toast.success(flash.success);
                if (flash?.error) toast.error(flash.error);
            },

            onError: (errors) => {
                toast.error(String(Object.values(errors)[0] ?? 'Terjadi kesalahan.'));
            },
        },
    );
};

const getCoworkerDateKey = (item: OffdayList, date: string): string | null => {
    if (item.office_id == null || item.department_id == null || item.position_id == null) {
        return null;
    }

    return [item.office_id, item.department_id, item.position_id, date].join('|');
};

const getDuplicateDates = (data: OffdayList[]) => {
    const employeeGroups = new Map<string, Set<number>>();

    data.forEach((item) => {
        item.request_details.forEach((detail) => {
            const key = getCoworkerDateKey(item, detail.date);

            if (!key) return;

            if (!employeeGroups.has(key)) {
                employeeGroups.set(key, new Set<number>());
            }

            employeeGroups.get(key)!.add(item.employee_id);
        });
    });

    return new Set([...employeeGroups.entries()].filter(([, employeeIds]) => employeeIds.size > 1).map(([key]) => key));
};

export const columnOffday = ({
    selectedKeys,
    onToggle,
    onToggleAll,
    allSelected,
    someSelected,
}: OffdayColumnProps): ColumnDef<OffdayList>[] => [
    {
        id: 'select',
        header: () => (
            <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Pilih semua pengajuan pending di halaman ini"
            />
        ),

        cell: ({ row }) => {
            const item = row.original;
            const key = `${item.employee_id}-${item.period_start}`;
            const isPending = item.status === 'pending';

            return (
                <Checkbox
                    checked={isPending ? selectedKeys.has(key) : true}
                    disabled={!isPending}
                    onCheckedChange={(checked) => onToggle(key, checked === true)}
                    aria-label={
                        isPending
                            ? `Pilih pengajuan ${item.employee_name}`
                            : `Pengajuan ${item.employee_name} sudah diproses`
                    }
                    className={!isPending ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                />
            );
        },

        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'employee_name',
        header: 'Nama Karyawan',
        cell: ({ row }) => <span className="font-medium">{row.original.employee_name}</span>,
    },
    {
        accessorKey: 'since',
        header: 'Tanggal Pengajuan',
        cell: ({ row }) => {
            const since = row.original.since;

            if (!since) return '-';

            const [date, time] = since.split(' ');
            const [year, month, day] = date.split('-');

            return (
                <div className="flex flex-col">
                    <span className="text-xs font-medium">{time}</span>
                    <span className="text-xs text-muted-foreground">{`${day}-${month}-${year}`}</span>
                </div>
            );
        },
    },
    {
        id: 'dates',
        header: 'Tanggal-Tanggal Libur',

        cell: ({ row, table }) => {
            const item = row.original;

            const allData = table.getPrePaginationRowModel().rows.map((tableRow) => tableRow.original);

            const duplicateDates = getDuplicateDates(allData);

            return (
                <div className="flex flex-wrap gap-2">
                    {item.request_details.map((detail, index) => {
                        const duplicateKey = getCoworkerDateKey(item, detail.date);

                        const isDuplicate = duplicateKey !== null && duplicateDates.has(duplicateKey);

                        const isMasukToLibur =
                            detail.status_start_date.toLowerCase() === 'masuk' &&
                            detail.status_end_date.toLowerCase() === 'libur';

                        const isLiburToMasuk =
                            detail.status_start_date.toLowerCase() === 'libur' &&
                            detail.status_end_date.toLowerCase() === 'masuk';

                        return (
                            <span
                                key={`${detail.date}-${index}`}
                                className={`inline-flex flex-col items-start gap-1 rounded-md border px-2 py-1.5 text-xs ${
                                    isDuplicate
                                        ? 'border-red-500 bg-red-500 text-white'
                                        : isMasukToLibur
                                          ? 'border-black bg-black text-white'
                                          : isLiburToMasuk
                                            ? 'border-black bg-white text-black'
                                            : 'bg-muted'
                                }`}
                                title={
                                    isDuplicate
                                        ? 'Tanggal libur sama dengan rekan kerja di office, department, dan position yang sama'
                                        : undefined
                                }
                            >
                                <span className="font-medium">{formatDate(detail.date)}</span>

                                <span className="text-[10px] leading-tight">
                                    {detail.status_start_date || '-'}
                                    {' → '}
                                    {detail.status_end_date || '-'}
                                </span>
                            </span>
                        );
                    })}
                </div>
            );
        },
    },

    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;

            const color =
                status === 'approved'
                    ? 'bg-green-500 text-black'
                    : status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-black';

            return <span className={`rounded-md px-2 py-1 text-xs capitalize ${color}`}>{status}</span>;
        },
    },

    {
        id: 'actions',
        header: 'Aksi',
        enableHiding: false,

        cell: ({ row }) => {
            const item = row.original;
            const isPending = item.status === 'pending';

            const [approveOpen, setApproveOpen] = useState(false);
            const [rejectOpen, setRejectOpen] = useState(false);

            return (
                <div className="flex items-center gap-2">
                    <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!isPending}
                                className="cursor-pointer text-green-600"
                            >
                                <CheckCheck className="mr-1 h-4 w-4" />
                                Approve
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <CheckCheck className="text-green-600" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>Approve Pengajuan Offday</AlertDialogTitle>

                                <AlertDialogDescription>
                                    Apakah kamu yakin ingin menyetujui seluruh pengajuan offday milik{' '}
                                    <span className="font-semibold">{item.employee_name}</span> pada periode{' '}
                                    <span className="font-semibold">
                                        {formatDate(item.period_start)} – {formatDate(item.period_end)}
                                    </span>
                                    ? Total {item.total_requests} pengajuan akan diproses.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>

                                <AlertDialogAction
                                    className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => {
                                        setApproveOpen(false);
                                        updateStatus(item, 'approved');
                                    }}
                                >
                                    Ya, Approve
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!isPending}
                                className="cursor-pointer text-red-600"
                            >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <X className="text-red-600" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>Reject Pengajuan Offday</AlertDialogTitle>

                                <AlertDialogDescription>
                                    Apakah kamu yakin ingin menolak seluruh pengajuan offday milik{' '}
                                    <span className="font-semibold">{item.employee_name}</span> pada periode{' '}
                                    <span className="font-semibold">
                                        {formatDate(item.period_start)} – {formatDate(item.period_end)}
                                    </span>
                                    ? Total {item.total_requests} pengajuan akan ditolak.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>

                                <AlertDialogAction
                                    className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => {
                                        setRejectOpen(false);
                                        updateStatus(item, 'rejected');
                                    }}
                                >
                                    Ya, Reject
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
    },
];
