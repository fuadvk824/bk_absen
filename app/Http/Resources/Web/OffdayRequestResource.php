<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OffdayRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $requestDates = $this->request_dates
            ? explode(',', $this->request_dates)
            : [];

        $statusStartDates = $this->request_status_start_dates !== null
            ? explode('|', $this->request_status_start_dates)
            : [];

        $statusEndDates = $this->request_status_end_dates !== null
            ? explode('|', $this->request_status_end_dates)
            : [];

        $requestDetails = collect($requestDates)
            ->values()
            ->map(function ($date, $index) use (
                $statusStartDates,
                $statusEndDates
            ) {
                return [
                    'date' => $date,
                    'status_start_date' => $statusStartDates[$index] ?? '',
                    'status_end_date' => $statusEndDates[$index] ?? '',
                ];
            })
            ->values()
            ->all();

        return [
            'employee_id' => (int) $this->employee_id,
            'employee_name' => $this->employee_name,

            'position_id' => $this->position_id
                ? (int) $this->position_id
                : null,
            'position_name' => $this->position_name,

            'department_id' => $this->department_id
                ? (int) $this->department_id
                : null,
            'department_name' => $this->department_name,

            'office_id' => $this->office_id
                ? (int) $this->office_id
                : null,
            'office_name' => $this->office_name,

            'team_name' => collect([
                $this->position_name,
                $this->department_name,
                $this->office_name,
            ])->filter()->implode(' '),

            'period_start' => $this->period_start,
            'period_end' => $this->period_end,

            'since' => $this->since,
            'request_dates' => $requestDates,
            'request_details' => $requestDetails,
            'total_requests' => (int) $this->total_requests,

            'status' => $this->status,
        ];
    }
}
