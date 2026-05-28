
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import type { Office } from '@/types/type-table/office';
import OfficeForm from './form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        image: null as File | null,
        phone: '',
        address: '',
        city: '',
        province: '',
        poscode: '',
        status: 'active',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('office.store'), {
            forceFormData: true,
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
