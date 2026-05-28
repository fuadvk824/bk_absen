import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCheck, MoreHorizontal, X } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OvertimeList } from '@/types/pengajuan/overtimeList';
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
import { toast } from 'sonner';
import { useState } from 'react';

const updateStatus = (id: number, status: string) => {
    router.patch(
        route('overtime.updateStatus', { overtime: id }),
        { status },
        {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as {
                    success?: string;
                    error?: string;
                };

                if (flash.success) toast.success(flash.success);
                if (flash.error) toast.error(flash.error);
            },
        },
    );
};

export const columnOvertime: ColumnDef<OvertimeList>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
        ),
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: 'employee_name',
        header: 'Nama Karyawan',
        cell: ({ row }) => <span className="font-medium">{row.getValue('employee_name') ?? '-'}</span>,
    },

    {
        accessorKey: 'date',
        header: 'Tanggal',
        cell: ({ row }) => row.getValue('date') ?? '-',
    },

    {
        accessorKey: 'waktu',
        header: 'Waktu',
        cell: ({ row }) => row.getValue('waktu') ?? '-',
    },

    {
        accessorKey: 'reason',
        header: 'Pekerjaan',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('reason') ?? '-'}</span>,
    },

    {
        accessorKey: 'created_at',
        header: 'Waktu Pengajuan',
        cell: ({ row }) => row.getValue('created_at') ?? '-',
    },

    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue<string>('status');

            const color =
                status === 'approved'
                    ? 'bg-green-500 text-black'
                    : status === 'rejected'
                      ? 'bg-red-500 text-black'
                      : 'bg-yellow-500 text-black';

            return <span className={`rounded-md px-2 py-1 text-xs capitalize ${color}`}>{status}</span>;
        },
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,

        cell: ({ row }) => {
            const overtime = row.original;
            const [open, setOpen] = useState(false);

            const handleUpdate = (status: string) => {
                updateStatus(overtime.id, status);
                setOpen(false);
            };

            return (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer text-green-600"
                                    disabled={overtime.status === 'approved'}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <CheckCheck /> Approved
                                </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <CheckCheck className="text-green-600!" />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Approve Overtime</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menyetujui pengajuan lembur ini?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                                    <AlertDialogAction
                                        className="cursor-pointer bg-green-600!"
                                        onClick={() => handleUpdate('approved')}
                                    >
                                        Approve
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    disabled={overtime.status === 'rejected'}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <X /> Rejected
                                </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <X className="text-red-600" />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Reject Overtime</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menolak pengajuan lembur ini?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                                    <AlertDialogAction
                                        className="cursor-pointer bg-red-600"
                                        onClick={() => handleUpdate('rejected')}
                                    >
                                        Reject
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
