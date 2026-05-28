<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Overtime;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GeneratePayrollService
{
    public function handle(int $month, int $year, array $holidayDates = [])
    {
        $periodStart = Carbon::create($year, $month, 26)->subMonth()->startOfDay();

        $periodEnd = Carbon::create($year, $month, 25)->endOfDay();

        return DB::transaction(function () use ($month, $year, $periodStart, $periodEnd, $holidayDates) {
            $employees = Employee::whereIn('status', ['magang', 'kontrak'])->get();

            foreach ($employees as $employee) {
                $alreadyExists = Payroll::where('employee_id', $employee->id)
                    ->where('month', $month)
                    ->where('year', $year)
                    ->exists();

                if ($alreadyExists) {
                    continue;
                }

                $attendances = Attendance::where('employee_id', $employee->id)
                    ->whereBetween('tanggal', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->get();

                $salary = Salary::where('employee_id', $employee->id)
                    ->where('effective_from', '<=', $periodEnd->toDateString())
                    ->orderByDesc('effective_from')
                    ->first();

                if (!$salary || !$salary->daily_salary) {
                    continue;
                }

                $dailySalary = $salary->daily_salary;

                $basicSalary = 0;

                foreach ($attendances as $attendance) {
                    $salaryPerAttendance = $dailySalary;

                    $shiftCheckout = $attendance->shift_checkout;

                    $employeeCheckout = $attendance->check_out;

                    if ($shiftCheckout && $employeeCheckout) {
                        $shiftCheckoutTime = Carbon::parse($shiftCheckout);

                        $employeeCheckoutTime = Carbon::parse($employeeCheckout);

                        if ($employeeCheckoutTime->lt($shiftCheckoutTime)) {
                            $earlyMinutes = $employeeCheckoutTime->diffInMinutes($shiftCheckoutTime);

                            $earlyHours = ceil($earlyMinutes / 60);

                            $hourlySalary = $dailySalary / 9;

                            $deduction = $hourlySalary * $earlyHours;

                            $salaryPerAttendance = $dailySalary - $deduction;

                            if ($salaryPerAttendance < 0) {
                                $salaryPerAttendance = 0;
                            }
                        }
                    }

                    $attendance->calculated_salary = $salaryPerAttendance;

                    $basicSalary += $salaryPerAttendance;
                }

                $holidayBonus = 0;

                foreach ($attendances as $attendance) {
                    $attendanceDate = Carbon::parse($attendance->tanggal)->format('Y-m-d');

                    $isHoliday = in_array($attendanceDate, $holidayDates);

                    if ($isHoliday) {
                        $bonus = $attendance->calculated_salary * 0.5;

                        $holidayBonus += $bonus;
                    }
                }

                $totalLatePenalty = $attendances->sum(function ($attendance) {
                    if ($attendance->late_minutes <= $attendance->toleransi_late) {
                        return 0;
                    }

                    $lateHours = ceil($attendance->late_minutes / 60);

                    return $lateHours * 10000;
                });

                $paidOvertimeIds = PayrollItem::where('source_type', Overtime::class)->pluck('source_id');

                $overtimes = Overtime::with('overtimeRate')
                    ->where('employee_id', $employee->id)
                    ->where('status', 'approved')
                    ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->whereNotIn('id', $paidOvertimeIds)
                    ->get();

                $totalOvertimePay = $overtimes->sum(function ($overtime) {
                    $timeFrom = Carbon::parse($overtime->time_from);

                    $timeTo = Carbon::parse($overtime->time_to);

                    if ($timeTo->lessThan($timeFrom)) {
                        $timeTo->addDay();
                    }

                    $hours = $timeFrom->diffInMinutes($timeTo) / 60;

                    return $hours * $overtime->overtimeRate->rate_per_hour;
                });

                $netSalary = $basicSalary + $holidayBonus + $totalOvertimePay - $totalLatePenalty;

                $payroll = Payroll::create([
                    'employee_id' => $employee->id,
                    'month' => $month,
                    'year' => $year,
                    'basic_salary' => $basicSalary,
                    'total_additions' => $holidayBonus + $totalOvertimePay,
                    'total_deductions' => $totalLatePenalty,
                    'net_salary' => $netSalary,
                    'is_locked' => 'bayar',
                ]);

                foreach ($attendances as $attendance) {
                    PayrollItem::create([
                        'payroll_id' => $payroll->id,

                        'source_type' => Attendance::class,
                        'source_id' => $attendance->id,

                        'name' => 'Gaji Harian',
                        'keterangan' => 'Gaji tanggal ' . $attendance->tanggal,
                        'type' => 'addition',
                        'amount' => $attendance->calculated_salary,
                    ]);
                }

                foreach ($attendances as $attendance) {
                    $attendanceDate = Carbon::parse($attendance->tanggal)->format('Y-m-d');

                    $isHoliday = in_array($attendanceDate, $holidayDates);

                    if (!$isHoliday) {
                        continue;
                    }

                    PayrollItem::create([
                        'payroll_id' => $payroll->id,

                        'source_type' => Attendance::class,
                        'source_id' => $attendance->id,

                        'name' => 'Bonus Tanggal Merah',
                        'keterangan' => 'Bonus masuk tanggal merah ' . $attendanceDate,
                        'type' => 'addition',
                        'amount' => $attendance->calculated_salary * 0.5,
                    ]);
                }

                foreach ($overtimes as $overtime) {
                    $timeFrom = Carbon::parse($overtime->time_from);

                    $timeTo = Carbon::parse($overtime->time_to);

                    if ($timeTo->lessThan($timeFrom)) {
                        $timeTo->addDay();
                    }

                    $hours = $timeFrom->diffInMinutes($timeTo) / 60;

                    $amount = $hours * $overtime->overtimeRate->rate_per_hour;

                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'source_type' => Overtime::class,
                        'source_id' => $overtime->id,
                        'name' => 'Bonus Lembur',
                        'keterangan' => $overtime->reason,
                        'type' => 'addition',
                        'amount' => $amount,
                    ]);
                }

                foreach ($attendances as $attendance) {
                    if ($attendance->late_minutes <= $attendance->toleransi_late) {
                        continue;
                    }

                    $lateHours = ceil($attendance->late_minutes / 60);

                    $penalty = $lateHours * 10000;

                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'source_type' => Attendance::class,
                        'source_id' => $attendance->id,
                        'name' => 'Denda Keterlambatan',
                        'keterangan' => 'Denda keterlambatan ' . $attendance->late_minutes . ' menit',
                        'type' => 'deduction',
                        'amount' => $penalty,
                    ]);
                }
            }

            return [
                'success' => true,
                'message' => 'Payroll berhasil digenerate',
            ];
        });
    }
}
