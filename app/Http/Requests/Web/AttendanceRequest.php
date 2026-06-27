<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
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
            'employee_id' => ['required'],

            'gambar_checkin' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'gambar_checkout' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            'alasan_terlambat' => ['nullable', 'string'],
            'alasan_dini' => ['nullable', 'string'],

            'latitude_checkin' => ['nullable', 'numeric'],
            'longitude_checkin' => ['nullable', 'numeric'],
            'distance_checkin' => ['nullable', 'numeric'],
            
            'latitude_checkout' => ['nullable', 'numeric'],
            'longitude_checkout' => ['nullable', 'numeric'],
            'distance_checkout' => ['nullable', 'numeric'],

            'device' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal.required' => 'Tanggal wajib diisi',
            'check_out.after' => 'Jam pulang harus setelah jam masuk',
            'gambar_checkin.image' => 'Gambar check-in harus berupa gambar',
            'gambar_checkout.image' => 'Gambar check-out harus berupa gambar',
        ];
    }
}
