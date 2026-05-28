export interface OvertimeList {
    id: number;
    employee_name: string;
    date: string;
    waktu: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
