export type OffdayStatus = 'pending' | 'approved' | 'rejected';

export interface OffdayRequestDetail {
    date: string;
    status_start_date: string;
    status_end_date: string;
}

export interface OffdayList {
    employee_id: number;
    employee_name: string;

    position_id: number | null;
    position_name: string | null;

    department_id: number | null;
    department_name: string | null;

    office_id: number | null;
    office_name: string | null;

    team_name: string;

    period_start: string;
    period_end: string;

    request_dates: string[];
    total_requests: number;

    status: OffdayStatus;
    request_details: OffdayRequestDetail[];
}

export interface OffdayTeam {
    position_key: number;
    department_key: number;
    office_key: number;
    team_key: string;
    team_name: string;
}

export interface OffdayFilters {
    search: string;
    status: string;
    office_id?: number | string | null;
    department_id?: number | string | null;
    position_id?: number | string | null;
    team: string;
    month: number;
    year: number;
    perPage: number;
}

export interface OfficeOption {
    id: number;
    name: string;
}

// export interface OffdayList {
//     id: number;

//     employee_id: number;
//     employee_name: string;

//     work_schedule_day_id: number;

//     date: string;

//     status_start_date: 'masuk' | 'libur';

//     status_end_date: 'masuk' | 'libur';

//     status: 'pending' | 'approved' | 'rejected';

//     reason: string;

//     created_at: string | null;
//     updated_at: string | null;
// }
