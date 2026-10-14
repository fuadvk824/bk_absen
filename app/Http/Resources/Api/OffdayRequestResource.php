<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OffdayRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'work_schedule_day_id' => $this->work_schedule_day_id,

            'date' => $this->date?->format('Y-m-d'),

            'status_start_date' => $this->status_start_date,
            'status_end_date' => $this->status_end_date,
            'status' => $this->status,
            'reason' => $this->reason,

            'employee' => $this->whenLoaded('employee', function () {
                return [
                    'id' => $this->employee->id,
                    'name' => $this->employee->name,
                ];
            }),

            'work_schedule_day' => $this->whenLoaded('workScheduleDay', function () {
                return [
                    'id' => $this->workScheduleDay->id,

                    'work_date' => $this->workScheduleDay->work_date
                        ? \Carbon\Carbon::parse(
                            $this->workScheduleDay->work_date
                        )->format('Y-m-d')
                        : null,

                    'is_off' => (bool) $this->workScheduleDay->is_off,
                ];
            }),
        ];
    }
}
