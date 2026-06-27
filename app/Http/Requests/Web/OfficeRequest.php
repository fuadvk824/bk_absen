<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class OfficeRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],

            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:2048',
            ],

            'phone' => [
                'nullable',
                'digits_between:10,15',
            ],

            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'poscode' => ['nullable', 'string', 'max:255'],

            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'radius_meter' => [
                'required',
                'integer',
                'min:1',
                'max:10000',
            ],

            'status' => [
                'required',
                'in:active,inactive',
            ],
            'timezone' => ['required', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'latitude' => 'latitude',
            'longitude' => 'longitude',
            'radius_meter' => 'radius meter',
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required' => 'Lokasi kantor wajib dipilih pada peta.',
            'longitude.required' => 'Lokasi kantor wajib dipilih pada peta.',
            'radius_meter.required' => 'Radius kantor wajib diisi.',
            'radius_meter.min' => 'Radius minimal 1 meter.',
            'radius_meter.max' => 'Radius maksimal 10000 meter.',
            'phone.digits_between' => 'Nomor telepon harus terdiri dari 10 sampai 15 digit ANGKA.',
        ];
    }
}
