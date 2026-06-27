import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { ShiftDetail } from '@/types/kategori-masterdata/shiftList';
import ShiftForm from './form';
import { toast } from 'sonner';

const defaultDays = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

const generateDefaultDetails = (): ShiftDetail[] => {
    return defaultDays.map((day) => ({
        day_of_week: day,
        is_active: day !== 'minggu' ? true : false,
        checkin_time: '08:00',
        checkout_time: '17:00',
        breaktime_start: '12:00',
        breaktime_end: '13:00',
    }));
};

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name_shift: '',
        toleransi_late: 0,
        denda_alpha: 0,
        shift_details: generateDefaultDetails(),
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
        post(route('shift.store'), {
           onSuccess: handleToast,
        });
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Shift', href: route('shift.index') },
                { title: 'Tambah', href: route('shift.create') },
            ]}
        >
            <Head title="Tambah Shift" />

            <ShiftForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Tambah"
            />
        </AppLayout>
    );
}
