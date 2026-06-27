export type Employee = {
    id: number;
    employee_code: string;
    user_id?: number;
    office_id?: number;
    department_id?: number;
    position_id?: number;
    shift_id?: number;

    tanggal_awal_kerja?: string;
    kontrak_mulai_tanggal?: string;
    kontrak_selesai_tanggal?: string;
    status: 'new' | 'inactive' | 'magang' | 'kontrak';

    daily_salary?: string;

    created_at?: string;
    updated_at?: string;
};
