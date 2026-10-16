import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

interface Props {
    leave: {
        id: number;
        employee_name: string | null;
        file_url: string;
        file_name: string;
    };
}

export default function File({ leave }: Props) {
    const isPdf = /\.pdf$/i.test(leave.file_name);
    const isImage = /\.(jpg|jpeg|png)$/i.test(leave.file_name);

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Pengajuan Cuti',
                    href: route('leavesubmit.index'),
                },
                {
                    title: 'Preview Lampiran',
                    href: route('leavesubmit.file', {
                        leavesubmit: leave.id,
                    }),
                },
            ]}
        >
            <Head title="Preview Lampiran Cuti" />

            <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold">Preview Lampiran</h1>

                        <p className="text-sm text-muted-foreground">
                            {leave.employee_name ?? 'Karyawan'} — {leave.file_name}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.get(route('leavesubmit.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>

                        <Button asChild>
                            <a href={leave.file_url} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>

                        <Button variant="outline" asChild>
                            <a href={leave.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Buka File
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    {isPdf ? (
                        <iframe src={leave.file_url} title={`Lampiran cuti ${leave.id}`} className="h-[800px] w-full" />
                    ) : isImage ? (
                        <div className="flex min-h-[400px] items-center justify-center bg-muted/20 p-4">
                            <img
                                src={leave.file_url}
                                alt={leave.file_name}
                                className="max-h-[800px] max-w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="font-medium">Preview tidak tersedia</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                File DOC atau DOCX dapat diunduh untuk dibuka.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
