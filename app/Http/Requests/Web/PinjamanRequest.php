<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class PinjamanRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'tanggal_pengajuan' => 'required|date',
            'jumlah_pinjaman' => 'required|numeric|min:1',
            'bunga' => 'required|numeric|min:0',
            'tenor' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ];
    }
}
