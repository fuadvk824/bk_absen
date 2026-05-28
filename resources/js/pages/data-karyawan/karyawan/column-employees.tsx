import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCheck, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { EmployeeList } from '@/types/data-karyawan/employeelist';
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
import { useState } from 'react';

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

const updateStatus = (id: number, action: string) => {
    const options = {
        preserveScroll: true,
        onSuccess: handleToast,
    };

    if (action === 'update') {
        router.patch(route('employee.toggleStatus', { employee: id }), {}, options);
    } else if (action === 'delete') {
        router.delete(route('employee.destroy', { employee: id }), options);
    }
};

export const columnEmployees: ColumnDef<EmployeeList>[] = [
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
        accessorKey: 'employee_code',
        header: 'Kode Karyawan',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('employee_code')}</span>,
    },
    {
        accessorKey: 'nama_karyawan',
        header: 'Nama',
        cell: ({ row }) => row.getValue('nama_karyawan') ?? '-',
    },

    {
        accessorKey: 'jabatan',
        header: 'Jabatan',
        cell: ({ row }) => row.getValue('jabatan') ?? '-',
    },

    {
        accessorKey: 'tanggal_awal_kerja',
        header: 'Mulai Kerja',
        cell: ({ row }) => formatDate(row.getValue('tanggal_awal_kerja')) ?? '-',
    },

    {
        accessorKey: 'no_telepon',
        header: 'No. Telepon',
        cell: ({ row }) => row.getValue('no_telepon') ?? '-',
    },

    {
        accessorKey: 'tanggal_lahir',
        header: 'Tgl Lahir',
        cell: ({ row }) => formatDate(row.getValue('tanggal_lahir')) ?? '-',
    },

    {
        accessorKey: 'alamat',
        header: 'Alamat',
        cell: ({ row }) => <div className="max-w-56 truncate">{row.getValue('alamat') ?? '-'}</div>,
    },

    {
        accessorKey: 'name_shift',
        header: 'Jam Kerja',
        cell: ({ row }) => row.getValue('name_shift') ?? '-',
    },

    {
        accessorKey: 'status',
        header: 'Status',

        cell: ({ row }) => {
            const employee = row.original;
            const currentStatus = employee.status;

            const [open, setOpen] = useState(false);
            const [selectedStatus, setSelectedStatus] = useState(currentStatus);

            const disabledMap: Record<string, string[]> = {
                new: ['new'],
                magang: ['new', 'magang'],
                kontrak: ['new', 'magang', 'kontrak'],
                inactive: ['new', 'magang', 'kontrak', 'inactive'],
            };

            const disabledStatuses = disabledMap[currentStatus] || [];

            const updateEmployeeStatus = (status: string) => {
                router.patch(
                    route('employee.updateStatus', {
                        employee: employee.id,
                    }),
                    {
                        status,
                    },
                    {
                        preserveScroll: true,

                        onSuccess: (page) => {
                            handleToast(page);
                            setOpen(false);
                        },

                        onError: () => {
                            toast.error('Gagal mengubah status.');
                        },
                    },
                );
            };

            const handleSelect = (value: string) => {
                setSelectedStatus(value);
                setOpen(true);
            };

            return (
                <>
                    <Select value={currentStatus} onValueChange={handleSelect}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="new" disabled={disabledStatuses.includes('new')}>
                                New
                            </SelectItem>

                            <SelectItem value="magang" disabled={disabledStatuses.includes('magang')}>
                                Magang/Probation
                            </SelectItem>

                            <SelectItem value="kontrak" disabled={disabledStatuses.includes('kontrak')}>
                                Kontrak
                            </SelectItem>

                            <SelectItem value="inactive" disabled={disabledStatuses.includes('inactive')}>
                                Inactive
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <CheckCheck className="text-green-500" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>Ubah Status Karyawan</AlertDialogTitle>

                                <AlertDialogDescription>
                                    Apakah kamu yakin ingin mengubah status menjadi{' '}
                                    <span className="font-semibold">{selectedStatus}</span>?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                                <AlertDialogAction
                                    className="cursor-pointer bg-green-500 hover:bg-green-600"
                                    onClick={() => updateEmployeeStatus(selectedStatus)}
                                >
                                    Update Status
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            );
        },
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,

        cell: ({ row }) => {
            const employee = row.original;
            const [open, setOpen] = useState(false);

            const handleUpdate = (status: string) => {
                updateStatus(employee.id, status);
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
                                    route('employee.edit', {
                                        employee: employee.id,
                                    }),
                                )
                            }
                            className="text-grey-500 cursor-pointer"
                        >
                            <SquarePen className="text-grey-500" /> Edit/Detail
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
                                    <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus data karyawan ini?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="cursor-pointer bg-red-600"
                                        onClick={() => handleUpdate('delete')}
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
