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
import { useState } from 'react';
import { toast } from 'sonner';
import { Position } from '@/types/type-table/position';

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

    router.delete(route('position.destroy', { position: id }), options);
};

export const columnPositions = (onEdit: (position: Position) => void): ColumnDef<Position>[] => [
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
        accessorKey: 'position_code',
        header: 'Kode Jabatan',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('position_code')}</span>,
    },
    {
        accessorKey: 'name',
        header: 'Jabatan',
        cell: ({ row }) => row.getValue('name') ?? '-',
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => {
            const position = row.original;

            const [open, setOpen] = useState(false);

            const handleUpdate = () => {
                updateStatus(position.id);
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
                        <DropdownMenuItem onClick={() => onEdit(position)} className="cursor-pointer text-gray-500">
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
                                    <AlertDialogTitle>Delete Position</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus data{' '}
                                        <span className="text-red-600 underline">Jabatan {position.name} </span>?
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
