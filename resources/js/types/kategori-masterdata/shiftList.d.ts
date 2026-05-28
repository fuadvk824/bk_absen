export interface ShiftDetail {
    id?: number;
    day_of_week: string;
    is_active: boolean;
    checkin_time: string | null;
    checkout_time: string | null;
    breaktime_start: string | null;
    breaktime_end: string | null;
    work_duration_minutes?: number;
}

export interface Shift {
    id: number;
    shift_code?: string;
    name_shift: string;
    toleransi_late: number;
    denda_alpha: number;
    shift_details: ShiftDetail[];
}
