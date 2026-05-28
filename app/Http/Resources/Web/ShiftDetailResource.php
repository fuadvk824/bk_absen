<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftDetailResource extends JsonResource
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
            'day_of_week' => $this->day_of_week,
            'is_active' => (bool) $this->is_active,

            'checkin_time' => $this->checkin_time,
            'checkout_time' => $this->checkout_time,
            'breaktime_start' => $this->breaktime_start,
            'breaktime_end' => $this->breaktime_end,
        ];
    }
}
