<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExportEmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'employee_code'             => $this->employee_code,
            'name'                      => $this->name,
            'email'                     => $this->user?->email,
            'alamat'                    => $this->user?->alamat,

            'no_telepon'                => $this->user?->no_telepon,
            'jenis_kelamin'             => $this->user?->jenis_kelamin,
            'tanggal_lahir'             => $this->user?->tanggal_lahir,
            'nik'                       => $this->user?->nik,
            'no_rek'                    => $this->user?->no_rek,
            'pend_last'                 => $this->user?->pend_last,

            'office'                    => $this->office?->name,
            'department'                => $this->department?->name,
            'position'                  => $this->position?->name,
            'shift'                     => $this->shift?->name_shift,

            'tanggal_awal_kerja'        => $this->tanggal_awal_kerja,
            'kontrak_mulai_tanggal'     => $this->kontrak_mulai_tanggal,
            'kontrak_selesai_tanggal'   => $this->kontrak_selesai_tanggal,
            'status'                    => $this->status,

        ];
    }
}
