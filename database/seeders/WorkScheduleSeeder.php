<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\WorkSchedule;
use App\Models\WorkScheduleDay;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkScheduleSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $startDate = Carbon::create(2026, 1, 26);
            $endDate = Carbon::create(2026, 2, 25);

            $dayNameMap = [
                'monday' => 'senin',
                'tuesday' => 'selasa',
                'wednesday' => 'rabu',
                'thursday' => 'kamis',
                'friday' => 'jumat',
                'saturday' => 'sabtu',
                'sunday' => 'minggu',
            ];

            $shift = Shift::with('shiftDetails')->first();

            if (!$shift) {
                return;
            }

            $shiftDetails = $shift->shiftDetails->keyBy(function ($item) {
                return strtolower($item->day_of_week);
            });

            $employees = Employee::get();

            foreach ($employees as $employee) {
                $employee->update([
                    'shift_id' => $shift->id,
                ]);

                $workSchedule = WorkSchedule::create([
                    'employee_id' => $employee->id,
                    'shift_id' => $shift->id,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'total_work_days' => 0,
                    'total_off_days' => 0,
                ]);

                $totalWorkDays = 0;
                $totalOffDays = 0;

                for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                    $dayName = $dayNameMap[strtolower($date->format('l'))];

                    $detail = $shiftDetails[$dayName] ?? null;

                    $isOff = !$detail || $detail->is_active == 0;

                    if ($isOff) {
                        $totalOffDays++;
                    } else {
                        $totalWorkDays++;
                    }

                    WorkScheduleDay::create([
                        'work_schedule_id' => $workSchedule->id,
                        'shift_id' => $isOff ? null : $shift->id,
                        'work_date' => $date->toDateString(),
                        'is_off' => $isOff,
                        'note' => null,
                    ]);
                }

                $workSchedule->update([
                    'total_work_days' => $totalWorkDays,
                    'total_off_days' => $totalOffDays,
                ]);
            }
        });
    }
}
