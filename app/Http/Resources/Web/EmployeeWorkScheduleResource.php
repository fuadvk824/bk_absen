<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeWorkScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'name' => $this->name,

            'shift' => [
                'id' => $this->shift?->id,
                'name' => $this->shift?->name_shift,
            ],

            'work_schedule' => WorkScheduleResource::collection(
                $this->whenLoaded('workSchedules')
            ),
        ];
    }
}

