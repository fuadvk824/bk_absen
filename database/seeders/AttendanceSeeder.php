<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\ShiftDetail;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $rows = Excel::toCollection(null, storage_path('app/AttendanceSeed.xlsx'))->first();

            $rows = $rows->skip(1);

            foreach ($rows as $row) {
                $employeeName = trim($row[0] ?? '');
                $tanggal = trim($row[1] ?? '');
                $checkInRaw = trim($row[2] ?? '');
                $checkOutRaw = trim($row[3] ?? '');
                $totalWaktuRaw = trim($row[4] ?? '');
                $statusCheckin = trim($row[5] ?? '');
                $statusCheckout = trim($row[6] ?? '');

                if (!$employeeName || !$tanggal) {
                    continue;
                }

                $employee = Employee::with('shift')->where('name', $employeeName)->first();

                $dayName = strtolower(Carbon::parse($tanggal)->locale('id')->dayName);
                $shiftDetail = ShiftDetail::where('shift_id', $employee->shift_id)
                    ->where('day_of_week', $dayName)
                    ->where('is_active', true)
                    ->first();

                if (!$shiftDetail) {
                    $this->command->warn("Shift detail tidak ditemukan: {$employeeName} ({$dayName})");
                    continue;
                }

                if (!$employee) {
                    $this->command->warn("Employee tidak ditemukan: {$employeeName}");
                    continue;
                }

                if (!$employee->shift) {
                    $this->command->warn("Shift tidak ditemukan untuk: {$employeeName}");
                    continue;
                }

                $toleransi = $employee->shift->toleransi_late ?? 0;

                $checkIn = null;

                if (!empty($checkInRaw)) {
                    $checkIn = Carbon::parse($checkInRaw)->format('H:i:s');
                }

                $checkOut = null;

                if (!empty($checkOutRaw)) {
                    $checkOut = Carbon::parse($checkOutRaw)->format('H:i:s');
                }

                $totalWaktu = null;

                if (!empty($totalWaktuRaw)) {
                    $parts = explode(':', $totalWaktuRaw);

                    $jam = (int) ($parts[0] ?? 0);
                    $menit = (int) ($parts[1] ?? 0);

                    $totalWaktu = $jam * 60 + $menit;
                }

                $checkinTime = '08:00:00';
                $checkoutTime = '17:00:00';
              
                $lateMinutes = 0;
                $status = 'ontime';

                if ($checkIn) {
                    $checkInCarbon = Carbon::createFromFormat('H:i:s', $checkIn);
                    $shiftCarbon = Carbon::createFromFormat('H:i:s', $checkinTime);

                    if ($checkInCarbon->gt($shiftCarbon)) {
                        $lateMinutes = $shiftCarbon->diffInMinutes($checkInCarbon);

                        $status = $lateMinutes > 3 ? 'late' : 'ontime';
                    }
                }
                $status = $lateMinutes > 0 ? 'late' : 'ontime';
                $statusAprv = $lateMinutes > $toleransi ? 'pending' : 'onTime';

                Attendance::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'tanggal' => $tanggal,
                    ],
                    [
                        'name_shift' => 'Normal',

                        'check_in' => $checkIn,
                        'check_out' => $checkOut,

                        'checkin_time' => $checkinTime,
                        'checkout_time' => $checkoutTime,

                        'toleransi_late' => $toleransi,
                        'late_minutes' => $lateMinutes,
                        'total_waktu' => $totalWaktu,

                        'status_checkin' => $statusCheckin ?: null,
                        'status_checkout' => $statusCheckout ?: null,

                        'status' => $status,

                        'gambar_checkin' => null,
                        'gambar_checkout' => null,

                        'late_reason' => null,
                        'late_proof' => null,
                        'statusAprv' => $statusAprv,
                        'early_reason' => null,

                        'latitude_checkin' => null,
                        'longitude_checkin' => null,
                        'distance_checkin' => null,

                        'latitude_checkout' => null,
                        'longitude_checkout' => null,
                        'distance_checkout' => null,

                        'device' => null,
                    ],
                );
            }
        });
    }
}
