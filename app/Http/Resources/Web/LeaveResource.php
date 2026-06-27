<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveResource extends JsonResource
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
            'leave_code' => $this->leave_code,
            'leave_name' => $this->leave_name,
            'max_days' => $this->max_days,
            'masa_bakti' => $this->masa_bakti,
            'reset' => $this->reset,
        ];
    }
}
