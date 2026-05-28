<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftResource extends JsonResource
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
            'shift_code' => $this->shift_code,
            'name_shift' => $this->name_shift,

            'toleransi_late' => $this->toleransi_late,
            'denda_alpha' => (int) $this->denda_alpha,

            'shift_details' => ShiftDetailResource::collection($this->whenLoaded('shiftDetails')),

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
