import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Shift } from '@/types/kategori-masterdata/shiftList';
import ShiftForm from './form';
import { toast } from 'sonner';

interface Props {
    shift: Shift;
}

const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

export default function Edit({ shift }: Props) {
    const mappedDetails = days.map((day) => {
        const existing = shift.shift_details?.find((d) => d.day_of_week === day);
        return (
            existing ?? {
                day_of_week: day,
                is_active: false,
                checkin_time: null,
                checkout_time: null,
                breaktime_start: null,
                breaktime_end: null,
            }
        );
    });

    const { data, setData, put, processing, errors } = useForm({
        name_shift: shift.name_shift ?? '',
        toleransi_late: shift.toleransi_late ?? 0,
        denda_alpha: shift.denda_alpha ?? 0,
        shift_details: mappedDetails,
    });

    const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route('shift.update', { shift: shift.id }), {
            preserveScroll: true,
            onSuccess: handleToast,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Shift', href: route('shift.index') },
                {
                    title: 'Edit',
                    href: route('shift.edit', {
                        shift: shift.id,
                    }),
                },
            ]}
        >
            <Head title="Edit Shift" />

            <ShiftForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Ubah"
            />
        </AppLayout>
    );
}
