import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { Checkbox } from '@/components/ui/checkbox';
import type { EasterEggView } from '@/types/type-table/easter-egg-view';

export const columnEasterEggViews: ColumnDef<EasterEggView>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Pilih semua baris"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Pilih baris"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'user_id',
        header: 'User ID',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.user_id}</span>,
    },
    {
        accessorKey: 'user_name',
        header: 'Nama Pengguna',
        cell: ({ row }) => row.original.user_name || '-',
    },
    {
        accessorKey: 'viewed_at',
        header: 'Waktu Dilihat',
        cell: ({ row }) => {
            const value = row.original.viewed_at;

            if (!value) return '-';

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) return '-';

            return (
                <span className="text-xs text-muted-foreground">
                    {format(date, 'dd MMM yyyy, HH:mm:ss', {
                        locale: localeId,
                    })}
                </span>
            );
        },
    },
    {
        accessorKey: 'app_version',
        header: 'Versi Aplikasi',
        cell: ({ row }) => row.original.app_version || '-',
    },
    {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => row.original.platform || '-',
    },
];
