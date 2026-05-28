 

import { Button } from '@/components/ui/button';
import { Payroll } from '@/types/payroll/payrollList';
import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';

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

import { ArrowBigDownDash, Eye, Lock, Receipt } from 'lucide-react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

const updatePayrollStatus = (id: number) => {
    router.patch(
        route('payroll.lock', id),
        {},
        {
            preserveScroll: true,
            onSuccess: handleToast,
        },
    );
};

export const columnPayrolls = (
    onShowDetail: (payroll: Payroll) => void,
): ColumnDef<Payroll>[] => [
    {
        accessorKey: 'employee.name',
        header: 'Karyawan',

        cell: ({ row }) => {
            const employee = row.original.employee;

            return (
                <div>
                    <div className="font-medium">{employee.name}</div>

                    <div className="text-xs text-muted-foreground">
                        {employee.employee_code}
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'month',
        header: 'Bulan',
    },

    {
        accessorKey: 'year',
        header: 'Tahun',
    },

    {
        accessorKey: 'basic_salary',
        header: 'Gaji Pokok',

        cell: ({ row }) =>
            Number(row.getValue('basic_salary')).toLocaleString('id-ID'),
    },

    {
        accessorKey: 'total_additions',
        header: 'Tambahan',

        cell: ({ row }) =>
            Number(row.getValue('total_additions')).toLocaleString('id-ID'),
    },

    {
        accessorKey: 'total_deductions',
        header: 'Potongan',

        cell: ({ row }) =>
            Number(row.getValue('total_deductions')).toLocaleString('id-ID'),
    },

    {
        accessorKey: 'net_salary',
        header: 'Gaji Bersih',

        cell: ({ row }) => (
            <span className="font-semibold">
                Rp {Number(row.getValue('net_salary')).toLocaleString('id-ID')}
            </span>
        ),
    },

    {
        id: 'actions',

        header: 'Aksi',

        cell: ({ row }) => {
            const payroll = row.original;

            const isPaid = payroll.is_locked === 'lunas';

            return (
                <div className="flex gap-2">
                    <Button
                        className="hover:scale-105"
                        size="sm"
                        variant="outline"
                        onClick={() => onShowDetail(payroll)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            window.open(
                                `/payroll/${payroll.id}/download`,
                                '_blank',
                            );
                        }}
                        className="hover:scale-105"
                    >
                        <ArrowBigDownDash className="h-4 w-4" />
                        Download
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                disabled={isPaid}
                                className="hover:scale-105"
                            >
                                <Lock className="h-4 w-4" />

                                {payroll.is_locked === 'bayar'
                                    ? 'Bayar'
                                    : 'Lunas'}
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <Receipt className="text-green-600" />
                                </AlertDialogMedia>

                                <AlertDialogTitle>
                                    Konfirmasi Payroll
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                    Apakah kamu yakin ingin mengubah status payroll
                                    menjadi <b>Lunas</b>?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    className="bg-green-600! hover:bg-black!"
                                    onClick={() =>
                                        updatePayrollStatus(payroll.id)
                                    }
                                >
                                    Ya, Bayar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
    },
];