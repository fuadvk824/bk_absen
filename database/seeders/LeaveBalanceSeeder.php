<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\LeaveCategory;
use App\Models\LeaveBalance;
use Carbon\Carbon;

class LeaveBalanceSeeder extends Seeder
{
    public function run(): void
    {
        $year = Carbon::now()->year;

        $employees = Employee::all();
        $categories = LeaveCategory::all();

        foreach ($employees as $employee) {
            foreach ($categories as $category) {
                $exists = LeaveBalance::where([
                    'employee_id' => $employee->id,
                    'leave_category_id' => $category->id,
                    'year' => $year,
                ])->exists();

                if ($exists) {
                    continue;
                }

                LeaveBalance::create([
                    'employee_id' => $employee->id,
                    'leave_category_id' => $category->id,
                    'total_quota' => $category->max_days ?? 0,
                    'used_days' => 0,
                    'remaining_days' => $category->max_days ?? 0,
                    'year' => $year,
                ]);
            }
        }
    }
}
