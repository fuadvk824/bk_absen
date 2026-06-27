<?php

namespace App\Http\Requests\Web;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalaryRequest extends FormRequest
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
        $salaryId = $this->route('salary')?->id;

        return [
            'employee_id' => ['required', 'exists:employees,id', Rule::unique('salaries', 'employee_id')->ignore($salaryId)],
            'daily_salary' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
        ];
    }
}
