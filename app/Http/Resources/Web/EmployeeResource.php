<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'email'                => $this->user->email,
            'employee_code'        => $this->employee_code,
            'nama_karyawan'        => $this->name,
            'jabatan'              => $this->position?->name,
            'tanggal_awal_kerja'   => $this->tanggal_awal_kerja,
            'no_telepon'           => $this->user?->no_telepon,
            'tanggal_lahir'        => $this->user?->tanggal_lahir,
            'alamat'               => $this->user?->alamat,
            'status'               => $this->status,
            'name_shift'           => $this->shift?->name_shift,
            'office'               => $this->office?->name,
        ];
    }

}