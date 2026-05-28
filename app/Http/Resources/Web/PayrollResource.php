<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'month' => $this->month,
            'year' => $this->year,
            'basic_salary' => $this->basic_salary,
            'total_additions' => $this->total_additions,
            'total_deductions' => $this->total_deductions,
            'net_salary' => $this->net_salary,
            'is_locked' => $this->is_locked,

            'employee' => [
                'id' => $this->employee?->id,
                'employee_code' => $this->employee?->employee_code,
                'name' => $this->employee?->name,
            ],

            'items' => PayrollItemResource::collection(
                $this->whenLoaded('items')
            ),
        ];
    }
}