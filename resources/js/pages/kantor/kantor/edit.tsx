import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import type { Office } from '@/types/type-table/office';
import OfficeForm from './form';
import { toast } from 'sonner';

interface Props {
    office: Office;
}

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

export default function Edit({ office }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: office.name ?? '',
        image: null,
        phone: office.phone ?? '',
        address: office.address ?? '',
        city: office.city ?? '',
        province: office.province ?? '',
        poscode: office.poscode ?? '',

        latitude: office.latitude ?? null,
        longitude: office.longitude ?? null,
        radius_meter: office.radius_meter ?? 20,

        status: office.status ?? 'active',
        timezone: office.timezone ?? '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route('office.update', { office: office.id }), {
            forceFormData: true,
            onSuccess: handleToast,
            onError: () => {
                toast.error('Gagal mengubah kantor');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Kantor', href: route('office.index') },
                { title: 'Edit', href: route('office.edit', { office: office.id }) },
            ]}
        >
            <Head title="Edit Kantor" />

            <OfficeForm
                data={data as Office}
                existingImage={office.image_url}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Ubah"
            />
        </AppLayout>
    );
}
