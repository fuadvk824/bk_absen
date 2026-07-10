<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveSubmitResource extends JsonResource
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

            'employee_name' =>  $this->employee?->name,
            'leave_category' => $this->leaveCategory?->leave_name,

            'submit' => $this->submit,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'total_days' => $this->total_days,

            'file' => $this->file,
            'reason' => $this->reason,

            'status' => $this->status,
        ];
    }

}
