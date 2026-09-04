export type LetterType = 'SP1' | 'SP2' | 'SP3' | 'probation' | 'paklaring';

export type Letter = {
    id: number;
    employee_id: number | null;
    employee_code: string | null;
    name: string;
    jabatan: string | null;
    name_office: string;
    nomor_surat: string;
    jenis_surat: LetterType;
    tanggal_surat: string;
    alasan_surat: string;

    pdf_path?: string | null;
    pdf_url?: string | null;
    sent_at?: string | null;
};

export type LetterEmployee = {
    id: number;
    employee_code: string;
    name: string;
    office_id: number | null;
    office?: {
        id: number;
        name: string;
    } | null;
};
