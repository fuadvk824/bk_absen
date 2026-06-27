<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;

class LeaveRequest extends FormRequest
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
            'leave_name' => ['required', 'max:255'],
            'max_days' => ['required', 'numeric', 'min:0'],
            'masa_bakti' => ['required', 'numeric', 'min:0'],
            'reset' => ['nullable', 'max:255'],
        ];
    }
}
