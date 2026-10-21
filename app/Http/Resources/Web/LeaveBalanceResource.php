<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveBalanceResource extends JsonResource
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
            'employee_id' => $this->employee_id,

            'employee' => $this->whenLoaded(
                'employee',
                fn() => $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => $this->employee->name,
                    'nip' => $this->employee->nip,
                ] : null
            ),

            'leave_category_id' => $this->leave_category_id,
            'total_quota' => $this->total_quota,
            'used_days' => $this->used_days,
            'remaining_days' => $this->remaining_days,
            'year' => $this->year,
        ];
    }
}
