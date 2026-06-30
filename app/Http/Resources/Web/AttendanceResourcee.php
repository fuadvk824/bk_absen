<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResourcee extends JsonResource
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
            'nama_karyawan' => $this->employee->name,
            'tanggal' => $this->tanggal->format('Y-m-d'),

            'check_in' => $this->check_in,
            'gambar_checkin' => $this->gambar_checkin ? asset('storage/' . $this->gambar_checkin) : null,
            'status_checkin' => $this->status_checkin,

            'check_out' => $this->check_out,
            'gambar_checkout' => $this->gambar_checkout ? asset('storage/' . $this->gambar_checkout) : null,
            'status_checkout' => $this->status_checkout ?? 'Belum Checkout',

            'total_waktu' => $this->total_waktu,

            'name_shift' => $this->name_shift,
            'checkin_time' => $this->checkin_time,
            'checkout_time' => $this->checkout_time,

            'statusAprv' => $this->statusAprv,
            'late_reason' => $this->late_reason,
            'late_proof' => $this->late_proof ? asset('storage/' . $this->late_proof) : null,
            'early_reason' => $this->early_reason,


            'latitude_checkin' => $this->latitude_checkin,
            'longitude_checkin' => $this->longitude_checkin,
            'distance_checkin' => $this->distance_checkin,

            'latitude_checkout' => $this->latitude_checkout,
            'longitude_checkout' => $this->longitude_checkout,
            'distance_checkout' => $this->distance_checkout,

            'office' => [
                'id' => $this->employee?->office?->id,
                'name' => $this->employee?->office?->name,
                'latitude' => $this->employee?->office?->latitude,
                'longitude' => $this->employee?->office?->longitude,
                'radius_meter' => $this->employee?->office?->radius_meter,
            ],
        ];
    }
}
