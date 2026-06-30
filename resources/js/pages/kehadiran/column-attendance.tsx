import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import type { AttendanceList } from '@/types/kehadiran/attendanceList';

import { Button } from '@/components/ui/button';
import { Check, File, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AttendancePhotoDialog from './attendance-photo-dialog';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

const updateApproval = (id: number, status: 'approved' | 'rejected') => {
    router.put(
        route('attendance.approval', { attendance: id }),
        { statusAprv: status },
        {
            preserveScroll: true,
            onSuccess: handleToast,
        },
    );
};

export const columnAttendances: ColumnDef<AttendanceList>[] = [
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
        accessorKey: 'nama_karyawan',
        header: 'Karyawan',
        cell: ({ row }) => <span className="font-medium">{row.getValue('nama_karyawan')}</span>,
    },

    {
        accessorKey: 'check_in',
        header: 'Check-in',
        cell: ({ row }) => {
            const checkIn = row.getValue<string>('check_in') ?? '-';
            const tanggal = row.original.tanggal ?? '-';
            const attendance = row.original;

            return (
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium">{checkIn}</span>
                        <span className="text-xs text-muted-foreground">{tanggal}</span>
                    </div>
                    <AttendancePhotoDialog
                        title="Detail Check In"
                        image={attendance.gambar_checkin}
                        office={attendance.office}
                        latitude={attendance.latitude_checkin}
                        longitude={attendance.longitude_checkin}
                        distance={attendance.distance_checkin}
                    />
                </div>
            );
        },
    },

    {
        accessorKey: 'gambar_checkin',
        header: 'Foto Masuk',
        cell: ({ row }) => {
            const image = row.getValue<string>('gambar_checkin');
            if (!image) return '-';

            return <img src={image} alt="Checkin" className="h-16 w-16 rounded border object-cover" />;
        },
    },

    {
        accessorKey: 'status_checkin',
        header: 'Status Masuk',
        cell: ({ row }) => {
            const attendance = row.original;
            const status = attendance.status_checkin ?? '-';

            return (
                <div className="flex flex-col gap-2">
                    <span className="text-xs">{status}</span>

                    <div className={`${attendance.statusAprv == 'onTime' ? 'hidden' : 'flex items-center gap-2'}`}>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="default">
                                    <File className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader className="gap-0">
                                    <AlertDialogTitle>Detail Keterlambatan</AlertDialogTitle>
                                    <AlertDialogDescription>Alasan keterlambatan beserta bukti</AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="flex flex-col gap-3 text-sm">
                                    <div>
                                        <span className="font-semibold">Alasan:</span>
                                        <p>{attendance.late_reason ?? '-'}</p>
                                    </div>

                                    <div>
                                        <span className="font-semibold">Bukti:</span>
                                        {attendance.late_proof ? (
                                            <img
                                                src={attendance.late_proof}
                                                alt="Bukti Terlambat"
                                                className="mt-2 max-h-40 rounded border object-cover"
                                            />
                                        ) : (
                                            <p>-</p>
                                        )}
                                    </div>
                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={attendance.statusAprv !== 'pending'}
                                >
                                    <Check className="h-4 w-4 text-white" />
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Keterlambatan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Yakin ingin approve <span className="font-semibold">{attendance.nama_karyawan}</span>
                                        ?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-green-600"
                                        onClick={() => updateApproval(attendance.id, 'approved')}
                                    >
                                        Approve
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive" disabled={attendance.statusAprv !== 'pending'}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Keterlambatan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Yakin ingin reject <span className="font-semibold">{attendance.nama_karyawan}</span>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600"
                                        onClick={() => updateApproval(attendance.id, 'rejected')}
                                    >
                                        Reject
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <span className={`rounded-md border px-3.5 py-2.5 text-xs font-medium`}>
                            {attendance.statusAprv}
                        </span>
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'check_out',
        header: 'Check-out',
        cell: ({ row }) => {
            const checkOut = row.getValue<string>('check_out') ?? '-';
            const tanggal = row.original.tanggal ?? '-';
            const attendance = row.original;

            return (
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium">{checkOut}</span>
                        <span className="text-xs text-muted-foreground">{tanggal}</span>
                    </div>

                    <AttendancePhotoDialog
                        title="Detail Check Out"
                        image={attendance.gambar_checkout}
                        office={attendance.office}
                        latitude={attendance.latitude_checkout}
                        longitude={attendance.longitude_checkout}
                        distance={attendance.distance_checkout}
                    />
                </div>
            );
        },
    },

    {
        accessorKey: 'gambar_checkout',
        header: 'Foto Pulang',
        cell: ({ row }) => {
            const image = row.getValue<string>('gambar_checkout');
            if (!image) return '-';

            return <img src={image} alt="Checkout" className="h-16 w-16 rounded border object-cover" />;
        },
    },

    {
        accessorKey: 'status_checkout',
        header: 'Status Pulang',
        cell: ({ row }) => {
            const status_checkout = row.getValue<string>('status_checkout') ?? '-';
            const early_reason = row.original.early_reason ?? '-';

            return (
                <div className="flex flex-col text-xs">
                    <span className="font-medium">{status_checkout}</span>
                    <span className="text-muted-foreground">Alasan pulang cepat:</span>
                    <span className="rounded-md border p-2 text-muted-foreground">{early_reason}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'total_waktu',
        header: 'Total Waktu',
        cell: ({ row }) => {
            const total = row.getValue<number>('total_waktu');

            if (!total) return '0';

            const jam = Math.floor(total / 60);
            const menit = total % 60;

            return `${jam} Jam ${menit} Menit`;
        },
    },

    {
        accessorKey: 'name_shift',
        header: 'Tipe Shift',
        cell: ({ row }) => row.getValue('name_shift') ?? '-',
    },

    {
        accessorKey: 'checkin_time',
        header: 'Jadwal CheckIn',
        cell: ({ row }) => row.getValue('checkin_time') ?? '-',
    },

    {
        accessorKey: 'checkout_time',
        header: 'Jadwal Checkout',
        cell: ({ row }) => row.getValue('checkout_time') ?? '-',
    },
];
