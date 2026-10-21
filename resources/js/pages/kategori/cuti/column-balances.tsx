import type { ColumnDef } from '@tanstack/react-table';

export interface LeaveBalanceList {
    id: number;
    employee_id: number;
    employee: {
        id: number;
        name: string;
        nip: string | null;
    } | null;
    leave_category_id: number;
    total_quota: number;
    used_days: number;
    remaining_days: number;
    year: number;
}

export const columnBalance: ColumnDef<LeaveBalanceList>[] = [
    {
        id: 'nomor',
        header: () => <div className="flex w-10! items-center justify-center">No.</div>,
        cell: ({ row }) => <div className="w-10! text-center">{row.index + 1}.</div>,
    },
   
    {
        accessorKey: 'employee.name',
        header: 'Nama Karyawan',
        cell: ({ row }) => <span>{row.original.employee?.name ?? '-'}</span>,
    },
    {
        accessorKey: 'total_quota',
        header: 'Kuota (hari)',
        cell: ({ row }) => <div>{row.original.total_quota}</div>,
    },
    {
        accessorKey: 'used_days',
        header: 'Terpakai (hari)',
        cell: ({ row }) => <div>{row.original.used_days}</div>,
    },
    {
        accessorKey: 'remaining_days',
        header: 'Sisa Cuti (hari)',
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.remaining_days <= 0 ? 'text-red-600' : ''}`}>
                {row.original.remaining_days}
            </div>
        ),
    },
];
