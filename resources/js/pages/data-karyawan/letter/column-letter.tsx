import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, Mail, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { Letter, LetterType } from '@/types/type-table/letter';

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) {
        toast.success(flash.success);
    }

    if (flash?.error) {
        toast.error(flash.error);
    }
};

const deleteLetter = (id: number) => {
    router.delete(
        route('letter.destroy', {
            letter: id,
        }),
        {
            preserveScroll: true,
            onSuccess: handleToast,

            onError: () => {
                toast.error('Gagal menghapus surat.');
            },
        },
    );
};

const SendLetterButton = ({ letter }: { letter: Letter }) => {
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (loading) {
            return;
        }

        setLoading(true);

        try {
            const [{ pdf }, { LetterDocument }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('./letter-document'),
            ]);

            const blob = await pdf(<LetterDocument letter={letter} />).toBlob();
            const formData = new FormData();
            const nomorSurat = letter.nomor_surat.replace(/\//g, '_');

            formData.append('pdf', blob, `${nomorSurat}-${letter.employee_code}.pdf`);

            router.post(
                route('letter.send', {
                    letter: letter.id,
                }),
                formData,
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: handleToast,

                    onError: () => {
                        toast.error('Gagal mengirim surat.');
                    },

                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            toast.error('Gagal membuat PDF.');

            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleSend} disabled={loading}>
            <Mail className="mr-2 h-4 w-4" />

            {loading ? 'Mengirim...' : letter.pdf_path ? 'Kirim Ulang' : 'Kirim'}
        </Button>
    );
};

const ActionCell = ({ letter, onEdit }: { letter: Letter; onEdit: (letter: Letter) => void }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleViewPdf = () => {
        router.get(
            route('letter.pdf', {
                letter: letter.id,
            }),
        );
    };

    const handleEdit = () => {
        /*
         * Tutup dropdown dahulu.
         *
         * Setelah itu parent membuka dialog.
         */
        setDropdownOpen(false);

        onEdit(letter);
    };

    const handleDelete = () => {
        setDeleteOpen(false);

        deleteLetter(letter.id);
    };

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={4}>
                    <DropdownMenuItem onSelect={handleViewPdf} className="cursor-pointer">
                        <FileText />
                        Lihat Surat
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={handleEdit} className="cursor-pointer">
                        <SquarePen />
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => {
                            setDropdownOpen(false);

                            /*
                             * Buka AlertDialog
                             * setelah dropdown ditutup.
                             */
                            requestAnimationFrame(() => {
                                setDeleteOpen(true);
                            });
                        }}
                        className="cursor-pointer text-red-600"
                    >
                        <Trash2 className="text-red-600" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/*
             * AlertDialog sekarang berada di dalam
             * ActionCell masing-masing, tetapi hanya
             * benar-benar aktif ketika deleteOpen.
             *
             * Tidak ada AlertDialogTrigger bersarang
             * di DropdownMenu.
             */}

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <Trash2 className="text-red-600" />
                        </AlertDialogMedia>

                        <AlertDialogTitle>Delete Surat</AlertDialogTitle>

                        <AlertDialogDescription>
                            Apakah kamu yakin ingin menghapus surat milik{' '}
                            <span className="text-red-600 underline">{letter.name}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

                        <AlertDialogAction className="cursor-pointer bg-red-600" onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export const columnLetters = (onEdit: (letter: Letter) => void): ColumnDef<Letter>[] => [
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
        accessorKey: 'name',
        header: 'Karyawan',
        cell: ({ row }) => row.getValue('name') ?? '-',
    },

    {
        accessorKey: 'name_office',
        header: 'Kantor',
        cell: ({ row }) => row.getValue('name_office') ?? '-',
    },

    {
        accessorKey: 'nomor_surat',
        header: 'Nomor Surat',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('nomor_surat')}</span>,
    },

    {
        accessorKey: 'jenis_surat',
        header: 'Jenis Surat',
        cell: ({ row }) => {
            const value = row.getValue('jenis_surat') as LetterType;

            const labels: Record<LetterType, string> = {
                SP1: 'SP1',
                SP2: 'SP2',
                SP3: 'SP3',
                probation: 'Probation',
                paklaring: 'Paklaring',
            };

            return <span className="font-medium">{labels[value]}</span>;
        },
    },

    {
        accessorKey: 'tanggal_surat',
        header: 'Tanggal Surat',

        cell: ({ row }) => {
            const value = row.getValue('tanggal_surat') as string;

            if (!value) {
                return '-';
            }

            const [year, month, day] = value.split('-');

            return `${day}-${month}-${year}`;
        },
    },

    {
        accessorKey: 'sent_at',
        header: 'Dikirim',
        cell: ({ row }) => {
            const value = row.getValue('sent_at') as string | null;

            if (!value) {
                return <span className="text-muted-foreground">Belum dikirim</span>;
            }

            const date = new Date(value);

            const formattedDate = date
                .toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
                .replace(/\//g, '-');

            const formattedTime = date
                .toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                })
                .replace(/:/g, '.');

            return `${formattedDate}, ${formattedTime}`;
        },
    },
    {
        accessorKey: 'read_at',
        header: 'Dibaca',
        cell: ({ row }) => {
            const value = row.getValue('read_at') as string | null;

            if (!value) {
                return <span className="text-muted-foreground">Belum dibaca</span>;
            }

            const date = new Date(value);

            const formattedDate = date
                .toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
                .replace(/\//g, '-');

            const formattedTime = date
                .toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                })
                .replace(/:/g, '.');

            return `${formattedDate}, ${formattedTime}`;
        },
    },

    {
        id: 'send',
        header: 'Kirim',
        enableHiding: false,

        cell: ({ row }) => <SendLetterButton letter={row.original} />,
    },

    {
        id: 'actions',
        header: 'Action',
        enableHiding: false,

        cell: ({ row }) => <ActionCell letter={row.original} onEdit={onEdit} />,
    },
];
