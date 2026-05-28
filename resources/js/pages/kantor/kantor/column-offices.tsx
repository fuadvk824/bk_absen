 
import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OfficeList } from '@/types/kantor/officeList';
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

export const columnOffices: ColumnDef<OfficeList>[] = [
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
        accessorKey: 'image_url',
        header: 'Image',
        cell: ({ row }) => {
            const image = row.original.image_url ?? null;

            return image ? (
                <div className="group relative">
                    <img
                        src={image}
                        alt={row.original.name}
                        className="h-12 w-12 rounded border object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                </div>
            ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                    No Image
                </div>
            );
        },
    },

    {
        accessorKey: 'office_code',
        header: 'Kode Kantor',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('office_code')}</span>,
    },
    {
        accessorKey: 'name',
        header: 'Nama Kantor',
        cell: ({ row }) => row.getValue('name') ?? '-',
    },

    {
        accessorKey: 'address',
        header: 'Alamat',
        cell: ({ row }) => <div className="max-w-56 truncate">{row.getValue('address') ?? '-'}</div>,
    },

    {
        accessorKey: 'city',
        header: 'Kota',
        cell: ({ row }) => row.getValue('city') ?? '-',
    },

    {
        accessorKey: 'province',
        header: 'Provinsi',
        cell: ({ row }) => row.getValue('province') ?? '-',
    },

    {
        accessorKey: 'poscode',
        header: 'Kode Pos',
        cell: ({ row }) => row.getValue('poscode') ?? '-',
    },

    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue<'active' | 'inactive'>('status');

            return (
                <span
                    className={`rounded-md px-2 py-1 text-xs text-black ${
                        status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {status}
                </span>
            );
        },
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => {
            const office = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.visit(
                                    route('office.edit', {
                                        office: office.id,
                                    }),
                                )
                            }
                            className='cursor-pointer text-gray-500'
                        >
                            <SquarePen className='text-gray-500'/>Edit
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
                                    <AlertDialogTitle>Delete Office</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus data{' '}
                                        <span className="text-red-600 underline">{office.name} </span>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="cursor-pointer bg-red-600"
                                        onClick={() =>
                                            router.delete(
                                                route('office.destroy', {
                                                    office: office.id,
                                                }),
                                            )
                                        }
                                    >
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
