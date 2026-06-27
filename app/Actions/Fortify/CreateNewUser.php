<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
// use App\Models\Employee;
use App\Models\User;
use App\Services\CodeGeneratorService;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    protected CodeGeneratorService $codeService;

    public function __construct(CodeGeneratorService $codeService)
    {
        $this->codeService = $codeService;
    }

    public function create(array $input): User
    {
        throw ValidationException::withMessages([
            'email' => ['Registration is currently unavailable. Please try again later.'],
        ]);
    }
}
