<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignShiftResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'office_id' => $this->office_id,

            'current_month_shift_name' => optional($this->workScheduleCurrentMonth?->shift)->name_shift,
            'current_month_shift_id' => optional($this->workScheduleCurrentMonth)->shift_id,

            'name' => $this->name,

            'office' => [
                'name' => $this->office?->name,
            ],
        ];
    }
     
}
