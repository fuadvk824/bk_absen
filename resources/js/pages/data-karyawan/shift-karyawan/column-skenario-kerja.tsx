import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2, UserRoundCheck } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shift } from '@/types/kategori-masterdata/shiftList';
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
import { formatRupiah } from '@/lib/formatRupiah';

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

    router.delete(route('shift.destroy', { shift: id }), options);
};

export const columnSkenarioKerja: ColumnDef<Shift>[] = [
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
    },
    {
        accessorKey: 'shift_code',
        header: 'Kode Shift',
    },
    {
        accessorKey: 'name_shift',
        header: 'Nama Shift',
    },
    {
        accessorKey: 'toleransi_late',
        header: 'Toleransi (Menit)',
    },
    {
        accessorKey: 'denda_alpha',
        header: 'Denda Alpha',
        cell: ({ row }) => {
            return formatRupiah(row.original.denda_alpha);
        },
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const shift = row.original;

            const [open, setOpen] = useState(false);

            const handleUpdate = () => {
                updateStatus(shift.id);
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
                        <DropdownMenuItem
                            onClick={() =>
                                router.visit(
                                    route('assign.edit', {
                                        shift: shift.id,
                                    }),
                                )
                            }
                            className="cursor-pointer text-green-500"
                        >
                            <UserRoundCheck className="text-green-500" /> Assign
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                router.visit(
                                    route('shift.edit', {
                                        shift: shift.id,
                                    }),
                                )
                            }
                            className="cursor-pointer text-gray-500"
                        >
                            <SquarePen className="text-gray-500" /> Edit
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
                                    <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus data{' '}
                                        <span className="text-red-600 underline">{shift.name_shift}</span>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600" onClick={() => handleUpdate()}>
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
