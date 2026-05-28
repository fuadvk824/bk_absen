<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class PinjamanUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tanggal_disetujui' => 'nullable|date',
            'jumlah_pinjaman' => 'nullable|numeric|min:1',
            'bunga' => 'nullable|numeric|min:0',
            'tenor' => 'nullable|integer|min:1',
            'status' => 'nullable|in:pending,disetujui,ditolak,lunas',
            'keterangan' => 'nullable|string',
        ];
    }
}
