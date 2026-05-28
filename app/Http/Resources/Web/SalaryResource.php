<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryResource extends JsonResource
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
            'employee_name' => $this->employee?->name,
            'basic_salary' => $this->basic_salary,
            'daily_salary' => $this->daily_salary,
            'effective_from' => $this->effective_from?->format('Y-m-d'),
        ];
    }
}
