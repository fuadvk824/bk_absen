<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class OvertimeExportResource extends JsonResource
{
    public function toArray($request): array
    {
        $minutes = Carbon::parse($this->time_from)
            ->diffInMinutes(Carbon::parse($this->time_to));

        $amount =
            ($minutes / 60)
            * ($this->overtimeRate?->rate_per_hour ?? 0);


        return [
            'employee_code' => $this->employee?->employee_code,
            'employee_name' => $this->employee?->name,
            'office_name' => $this->employee?->office?->name,
            'position_name' => $this->employee?->position?->name,

            'date' => $this->date?->format('d-m-Y'),

            'time_from' => Carbon::parse($this->time_from)->format('H:i'),
            'time_to' => Carbon::parse($this->time_to)->format('H:i'),

            // 'hours' => floor($minutes / 60),
            'hours' => floor($minutes / 60) . ' jam ' . ($minutes % 60) . ' menit',
            'minutes' => $minutes,

            'amount' => round($amount),
            'reason' => $this->reason,
            'status' => $this->status,
            'created_at' => $this->created_at->format('d-m-Y'),
        ];
    }
}
