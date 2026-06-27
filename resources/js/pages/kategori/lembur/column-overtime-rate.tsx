import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';

import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

import type { OvertimeRate } from '@/types/type-table/overtime-rate';
import { formatRupiah } from '@/lib/formatRupiah';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

const deleteOvertimeRate = (id: number) => {
    router.delete(
        route('overtime-rate.destroy', {
            overtimeRate: id,
        }),
        {
            preserveScroll: true,
            onSuccess: handleToast,
        },
    );
};

export const columnOvertimeRates = (onEdit: (overtimeRate: OvertimeRate) => void): ColumnDef<OvertimeRate>[] => [
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
        accessorKey: 'name',
        header: 'Nama Lembur',
    },

    {
        accessorKey: 'rate_per_hour',
        header: 'Bonus / Jam',

        cell: ({ row }) => <span>{formatRupiah(row.getValue('rate_per_hour'))}</span>,
    },

    {
        accessorKey: 'effective_from',
        header: 'Berlaku Mulai',
    },

    {
        accessorKey: 'is_active',
        header: 'Status',

        cell: ({ row }) => (
            <span
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                    row.original.is_active ? 'bg-green-500 text-black' : 'bg-red-500 text-black'
                }`}
            >
                {row.original.is_active ? 'Aktif' : 'Nonaktif'}
            </span>
        ),
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,

        cell: ({ row }) => {
            const overtimeRate = row.original;

            const [open, setOpen] = useState(false);

            const handleDelete = () => {
                deleteOvertimeRate(overtimeRate.id);
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
                        <DropdownMenuItem onClick={() => onEdit(overtimeRate)} className="cursor-pointer text-gray-500">
                            <SquarePen className="text-gray-500" />
                            Edit
                        </DropdownMenuItem>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    disabled
                                    className="cursor-pointer text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="text-red-600" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <Trash2 className="text-red-600" />
                                    </AlertDialogMedia>

                                    <AlertDialogTitle>Delete Overtime Rate</AlertDialogTitle>

                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus tarif lembur{' '}
                                        <span className="text-red-600 underline">{overtimeRate.name}</span>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                                    <AlertDialogAction className="cursor-pointer bg-red-600" onClick={handleDelete}>
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
