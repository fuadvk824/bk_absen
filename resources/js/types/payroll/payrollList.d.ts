export interface PayrollItem {
    id: number;
    name: string;
    type: 'addition' | 'deduction';
    amount: number;
    source_type?: string | null;
    source_id?: number | null;
    source_detail?: {
        type: 'attendance' | 'overtime';
        date?: string;
    };
    keterangan: string;
}

export interface Payroll {
    id: number;
    month: number;
    year: number;
    basic_salary: number;
    total_additions: number;
    total_deductions: number;
    net_salary: number;
    is_locked: 'bayar' | 'lunas';
    employee: {
        id: number;
        employee_code: string;
        name: string;
        department?: string;
        positin?: string;
    };

    items: PayrollItem[];
}
