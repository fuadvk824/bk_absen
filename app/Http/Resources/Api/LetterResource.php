<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LetterResource extends JsonResource
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
            'employee_code' => $this->employee?->employee_code,
            'name' => $this->name,
            'name_office' => $this->name_office,
            'nomor_surat' => $this->nomor_surat,
            'jenis_surat' => $this->jenis_surat,
            'tanggal_surat' => $this->tanggal_surat?->format('Y-m-d'),
            'alasan_surat' => $this->alasan_surat,

            'pdf_url' => $this->pdf_path
                ? asset($this->pdf_path)
                : null,

            'sent_at' => $this->sent_at?->toISOString(),
            'read_at' => $this->read_at?->toISOString(),
            'is_read' => ! is_null($this->read_at),
        ];
    }
}
