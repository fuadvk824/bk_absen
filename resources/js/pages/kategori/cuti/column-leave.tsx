import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Square, SquarePen, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LeaveList } from '@/types/kategori-masterdata/leaveList';

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
import { useState } from 'react';
import { toast } from 'sonner';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

const updateStatus = (id: number) => {
    const options = {
        preserveScroll: true,
        onSuccess: handleToast,
    };

    router.delete(route('leave.destroy', { leave: id }), options);
};

export const columnLeaves = (onEdit: (leave: LeaveList) => void): ColumnDef<LeaveList>[] => [
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
        accessorKey: 'leave_code',
        header: 'Kode Cuti',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('leave_code')}</span>,
    },
    {
        accessorKey: 'leave_name',
        header: 'Kategori Cuti',
        cell: ({ row }) => row.getValue('leave_name') ?? '-',
    },
    {
        accessorKey: 'max_days',
        header: 'Maksimal',
        cell: ({ row }) => row.getValue('max_days') ?? '-',
    },
    {
        accessorKey: 'masa_bakti',
        header: 'Masa Bakti',
        cell: ({ row }) => row.getValue('masa_bakti') ?? '-',
    },
    {
        accessorKey: 'reset',
        header: 'Reset Cuti',
        cell: ({ row }) => row.getValue('reset') ?? '-',
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => {
            const leave = row.original;

            const [open, setOpen] = useState(false);

            const handleUpdate = () => {
                updateStatus(leave.id);
                setOpen(false);
            };
            return (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(leave)} className="cursor-pointer text-gray-500\">
                            <SquarePen className='text-gray-500'/> Edit
                        </DropdownMenuItem>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="text-red-600" /> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <Trash2 className="text-red-600" />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Delete Cuti</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus data cuti{' '}
                                        <span className="text-red-600 underline"> {leave.leave_name} </span>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="cursor-pointer bg-red-600" onClick={() => handleUpdate()}>
                                        Delete
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
