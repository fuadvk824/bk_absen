import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CheckCheck, MoreHorizontal, X } from 'lucide-react';
import { LeaveSubmitList } from '@/types/pengajuan/leavesubmitList';

const updateStatus = (id: number, status: string) => {
    router.patch(
        route('leavesubmit.updateStatus', { leavesubmit: id }),
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

export const columnLeave: ColumnDef<LeaveSubmitList>[] = [
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
    },
    {
        accessorKey: 'leave_category',
        header: 'Kategori',
    },
    {
        accessorKey: 'start_date',
        header: 'Mulai',
    },
    {
        accessorKey: 'end_date',
        header: 'Selesai',
    },
    {
        accessorKey: 'total_days',
        header: 'Hari',
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

            return <span className={`rounded-md px-2 py-1 text-xs ${color}`}>{status}</span>;
        },
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,

        cell: ({ row }) => {
            const leavesubmit = row.original;
            const [open, setOpen] = useState(false);

            const handleUpdate = (status: string) => {
                updateStatus(leavesubmit.id, status);
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
                                    disabled={leavesubmit.status === 'approved'}
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
                                    <AlertDialogTitle>Approve leavesubmit</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menyetujui pengajuan cuti ini?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                                    <AlertDialogAction
                                        className="cursor-pointer bg-green-600! hover:bg-black!"
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
                                    disabled={leavesubmit.status === 'rejected'}
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
                                    <AlertDialogTitle>Reject leavesubmit</AlertDialogTitle>
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
