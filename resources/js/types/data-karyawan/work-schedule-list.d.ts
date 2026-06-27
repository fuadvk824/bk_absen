export interface WorkScheduleDay {
    id: number;
    shift_id: number;
    work_date: string;
    is_off: boolean;
}

export interface WorkScheduleMonth {
    id: number;
    year: number;
    month: number;
    days: WorkScheduleDay[];
}

export interface Shift {
    id: number;
    name_shift: string;
}

export interface WorkSchedule {
    id: number;
    name: string;
    shift: Shift;
    work_schedule: WorkScheduleMonth[];

    dayMap?: Record<string, WorkScheduleDay>;
    is_bulk?: boolean;
}
