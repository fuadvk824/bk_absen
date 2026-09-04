import { Head, router } from '@inertiajs/react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

import { route } from 'ziggy-js';
import { ArrowLeft, Download } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

import type { Letter } from '@/types/type-table/letter';
import { LetterDocument } from './letter-document';

interface Props {
    letter: Letter;
}

export default function LetterPdf({ letter }: Props) {
    const fileName = `${letter.nomor_surat.replace(/\//g, '_')}-${letter.employee_code}.pdf`;

    const handleBack = () => {
        router.get(route('letter.index'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Surat',
                    href: route('letter.index'),
                },
                {
                    title: 'Preview Surat',
                    href: route('letter.pdf', {
                        letter: letter.id,
                    }),
                },
            ]}
        >
            <Head title={`Surat ${letter.nomor_surat}`} />

            <div className="space-y-4 p-5">

                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold">Preview Surat</h1>

                        <p className="truncate text-sm text-muted-foreground">{letter.nomor_surat}</p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <Button variant="outline" onClick={handleBack} className="cursor-pointer">
                            <ArrowLeft className="mr-2 h-4 w-4" />

                            <span className="hidden sm:inline">Kembali</span>
                        </Button>

                        <PDFDownloadLink document={<LetterDocument letter={letter} />} fileName={fileName}>
                            {({ loading }) => (
                                <Button className="cursor-pointer" disabled={loading}>
                                    <Download className="mr-2 h-4 w-4" />

                                    {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-muted">
                    <PDFViewer
                        width="100%"
                        height="800px"
                        showToolbar={false}
                        // style={{
                        //     border: 'none',
                        //     display: 'block',
                        // }}
                    >
                        <LetterDocument letter={letter} />
                    </PDFViewer>
                </div>
            </div>
        </AppLayout>
    );
}
 