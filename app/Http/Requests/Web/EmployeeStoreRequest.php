<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeStoreRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'jenis_kelamin' => 'nullable|in:L,P',
            'nik' => 'nullable|unique:users,nik',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'no_telepon' => 'nullable|numeric|digits_between:10,15',

            'office_id' => 'nullable|exists:offices,id',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'tanggal_awal_kerja' => 'nullable|date',
            'kontrak_mulai_tanggal' => 'nullable|date',
            'kontrak_selesai_tanggal' => 'nullable|date|after_or_equal:kontrak_mulai_tanggal',
        ];
    }
}
