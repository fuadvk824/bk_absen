import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
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

import { SalaryList } from '@/types/kategori-masterdata/salaryList';
import { formatRupiah } from '@/lib/formatRupiah';

import { toast } from 'sonner';
import { useState } from 'react';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

const deleteSalary = (id: number) => {
    const options = {
        preserveScroll: true,
        onSuccess: handleToast,
    };

    router.delete(route('salary.destroy', { salary: id }), options);
};

export const columnSalary = (onEdit: (salary: SalaryList) => void): ColumnDef<SalaryList>[] => [
    {
        accessorKey: 'employee_name',
        header: 'Karyawan',
    },

    {
        accessorKey: 'daily_salary',
        header: 'Daily Salary',
        cell: ({ row }) => {
            return formatRupiah(row.original.daily_salary);
        },
    },

    {
        accessorKey: 'effective_from',
        header: 'Effective From',
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,

        cell: ({ row }) => {
            const salary = row.original;

            const [open, setOpen] = useState(false);

            const handleDelete = () => {
                deleteSalary(salary.id);
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
                        <DropdownMenuItem onClick={() => onEdit(salary)} className="cursor-pointer text-gray-500">
                            <SquarePen className="text-gray-500" />
                            Edit
                        </DropdownMenuItem>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
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

                                    <AlertDialogTitle>Delete Salary</AlertDialogTitle>

                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menghapus data salary karyawan{' '}
                                        <span className="text-red-600 underline">{salary.employee_name}</span>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                                    <AlertDialogAction className="cursor-pointer bg-red-600" onClick={() => handleDelete()}>
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
