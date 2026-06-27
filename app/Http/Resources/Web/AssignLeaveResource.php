<?php

namespace App\Http\Resources\Web;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignLeaveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $masaKerjaBulan = $this->tanggal_awal_kerja
            ? (int) Carbon::parse($this->tanggal_awal_kerja)
                ->diffInMonths(now())
            : 0;

        $tahun = intdiv($masaKerjaBulan, 12);
        $bulan = $masaKerjaBulan % 12;

        // $masaKerjaFormatted = collect([
        //     $tahun > 0 ? "{$tahun} tahun" : null,
        //     $bulan > 0 ? "{$bulan} bulan" : null,
        // ])->filter()->implode(' ');

        $masaKerjaFormatted = collect([
            $tahun > 0 ? "{$tahun} tahun" : null,
            $bulan > 0 ? "{$bulan} bulan" : null,
        ])->filter()->implode(' ') ?: '< 1 bulan';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'office' => [
                'name' => $this->office?->name,
            ],

            'masa_kerja' => $masaKerjaFormatted,

            'eligible' => $masaKerjaBulan >= request()
                ->route('leave')
                ->masa_bakti,

            'already_assigned' => $this->leaveBalances()
                ->where('leave_category_id', request()->route('leave')->id)
                ->where('year', now()->year)
                ->exists(),
        ];
    }
}
