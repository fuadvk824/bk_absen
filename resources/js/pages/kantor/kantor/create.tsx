import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import type { Office } from '@/types/type-table/office';
import OfficeForm from './form';
import { toast } from 'sonner';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        image: null as File | null,
        phone: '',
        address: '',
        city: '',
        province: '',
        poscode: '',

        latitude: null,
        longitude: null,
        radius_meter: 20,

        status: 'active',
        timezone: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('office.store'), {
            forceFormData: true,
            onSuccess: handleToast,
            onError: () => {
                toast.error('Gagal menambahkan kantor');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Kantor', href: route('office.index') },
                { title: 'Tambah', href: route('office.create') },
            ]}
        >
            <Head title="Tambah Kantor" />

            <OfficeForm
                data={data as Office}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Tambah"
            />
        </AppLayout>
    );
}
