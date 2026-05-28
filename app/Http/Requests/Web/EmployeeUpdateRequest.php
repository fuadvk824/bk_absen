<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeUpdateRequest extends FormRequest
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
        $userId = $this->route('employee')?->user_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            
            'jenis_kelamin' => ['nullable', Rule::in(['L', 'P'])],
            'nik' => [
                'nullable',
                Rule::unique('users', 'nik')->ignore($userId),
            ],
            'tanggal_lahir' => ['nullable', 'date'],
            'alamat' => ['nullable', 'string'],
            'no_telepon' => ['nullable', 'numeric', 'digits_between:10,15'],

            'office_id' => ['nullable', 'exists:offices,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position_id' => ['nullable', 'exists:positions,id'],
            'tanggal_awal_kerja' => ['nullable', 'date'],
            'kontrak_mulai_tanggal' => ['nullable', 'date'],
            'kontrak_selesai_tanggal' => ['nullable', 'date', 'after_or_equal:kontrak_mulai_tanggal'],
          
        ];
    }
    public function messages(): array
    {
        return [
            'email.unique' => 'Email sudah terdaftar.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'kontrak_selesai_tanggal.after_or_equal' => 'Tanggal selesai kontrak harus sama atau setelah kontrak mulai.',
        ];
    }
}
