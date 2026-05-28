import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import type { Office } from '@/types/type-table/office';
import OfficeForm from './form';

interface Props {
    office: Office;
}

export default function Edit({ office }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: office.name ?? '',
        image: null,
        phone: office.phone ?? '',
        address: office.address ?? '',
        city: office.city ?? '',
        province: office.province ?? '',
        poscode: office.poscode ?? '',
        status: office.status ?? 'active',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('office.update', { office: office.id }), {
            forceFormData: true,
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
 