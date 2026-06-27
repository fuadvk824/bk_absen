export interface LeaveSubmitList {
    id: number;
    employee_name: string;
    leave_category: string;

    file: string;
    submit: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}
