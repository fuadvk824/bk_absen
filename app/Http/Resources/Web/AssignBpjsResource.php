<?php

namespace App\Http\Resources\Web;

use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignBpjsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $months = $this->tanggal_awal_kerja
            ? (int) Carbon::parse($this->tanggal_awal_kerja)
                ->diffInMonths(now())
            : 0;

        $years = intdiv($months, 12);
        $remainingMonths = $months % 12;

        $formatted = collect([
            $years > 0 ? "{$years} tahun" : null,
            $remainingMonths > 0
                ? "{$remainingMonths} bulan"
                : null,
        ])->filter()->implode(' ') ?: '< 1 bulan';

        $bpjs = $this->latest_bpjs;

        return [
            'id' => $this->id,
            'name' => $this->name,

            'office' => [
                'name' => $this->office?->name ?? '-',
            ],

            'masa_kerja' => $formatted,
            'masa_kerja_bulan' => $months,
            'eligible' => $months >= 18,

            'already_assigned' =>
            $this->latest_salary_id !== null
                && $bpjs !== null
                && (float) $bpjs > 0,

            'bpjs' => $bpjs,
        ];
    }
}
