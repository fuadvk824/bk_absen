<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Salary;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SalarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::whereIn('status', ['magang', 'kontrak', 'new'])->get();

        foreach ($employees as $employee) {

            if ($employee->status === 'new' || $employee->status === 'kontrak') {

                Salary::create([
                    'employee_id'   => $employee->id,
                    'basic_salary'  => null,
                    'daily_salary'  => 110000,
                    'effective_from'=> '2026-03-01',
                ]);

            } 
        }
    }
}