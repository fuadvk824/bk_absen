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
        ];
    }
}
