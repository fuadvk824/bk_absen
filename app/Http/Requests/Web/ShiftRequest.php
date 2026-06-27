<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class ShiftRequest extends FormRequest
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
            'name_shift' => 'required|string|max:255',
            'toleransi_late' => 'required|integer|min:0',
            'denda_alpha' => 'required|numeric|min:0',

            'shift_details' => 'required|array|min:1',

            'shift_details.*.day_of_week' => ['required', 'in:senin,selasa,rabu,kamis,jumat,sabtu,minggu'],

            'shift_details.*.is_active' => 'required|boolean',

            'shift_details.*.checkin_time' => ['nullable'],
            'shift_details.*.checkout_time' => ['nullable'],
            'shift_details.*.breaktime_start' => ['nullable'],
            'shift_details.*.breaktime_end' => ['nullable'],
        ];
    }
    // protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    // {
    //     dd($validator->errors()->toArray());
    // }
}
