export interface OvertimeList {
    id: number;
    employee_name: string;
    date: string;
    time_from: string;
    time_to: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
