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
            'name' => ['required', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'phone' => ['nullable', 'numeric', 'digits_between:10,15'],

            'address' => ['nullable', 'max:255'],
            'city' => ['nullable', 'max:255'],
            'province' => ['nullable', 'max:255'],

            'poscode' => ['nullable', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
