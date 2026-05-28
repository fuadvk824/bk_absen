<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class WorkScheduleDayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'work_date' => $this->work_date->format('Y-m-d'),
            'is_off' => $this->is_off,

            'shift_id' => $this->shift_id,

            'shift' => $this->shift ? [
                'id' => $this->shift->id,
                'name' => $this->shift->name_shift,
            ] : null,
        ];
    }
}