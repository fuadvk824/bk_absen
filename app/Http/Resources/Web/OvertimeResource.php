<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OvertimeResource extends JsonResource
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
            'employee_name' => $this->employee->name,
            'date' => $this->date?->format('d-m-Y'),

            'time_from' => $this->time_from->format('H:i'),
            'time_to' => $this->time_to->format('H:i'),

            'reason' => $this->reason,
            'status' => $this->status,
            'created_at' => $this->created_at?->format('d-m-Y H:i:s'),
        ];
    }
}
