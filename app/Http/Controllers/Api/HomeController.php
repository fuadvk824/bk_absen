<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageUploadService;
use Carbon\Carbon;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\ShiftDetail;
use App\Models\WorkScheduleDay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        $employee = $user
            ->employees()
            ->with(['office', 'department', 'position', 'shift.shiftDetails'])
            ->first();

        if (!$employee) {
            return response()->json(
                [
                    'message' => 'Employee tidak ditemukan',
                ],
                404,
            );
        }

        $today = Carbon::now()->locale('id')->translatedFormat('l');
        $today = strtolower($today);

        $shiftDetail = $employee->shift?->shiftDetails()->where('day_of_week', $today)->first();

        return response()->json([
            'employeeId' => $employee->id,
            'userId' => $user->id,
            'name' => $user->name,

            'key_status' => $user->key_status,

            'department' => optional($employee->department)->name,
            'position' => optional($employee->position)->name,
            'checkin_time' => $shiftDetail?->checkin_time,
            'checkout_time' => $shiftDetail?->checkout_time,
            'toleransi_late' => $employee->shift?->toleransi_late,

            'office_latitude' => $employee->office?->latitude,
            'office_longitude' => $employee->office?->longitude,
            'office_radius' => $employee->office?->radius_meter,
        ]);
    }

    public function attendance(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $employeeId = $request->user()->employees->id;

        $attendance = Attendance::where('employee_id', $employeeId)->where('tanggal', $today)->first();

        $scheduleDay = WorkScheduleDay::whereDate('work_date', $today)
            ->whereHas('workSchedule', function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            })
            ->first();

        $leave = Leave::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->first();

        $limitLate = null;
        $hasShift = false;
        $shiftDetail = null;

        if ($scheduleDay && $scheduleDay->shift_id) {
            $dayName = strtolower(Carbon::parse($today)->locale('id')->dayName);
            $shiftDetail = ShiftDetail::where('shift_id', $scheduleDay->shift_id)
                ->where('day_of_week', $dayName)
                ->where('is_active', true)
                ->first();

            if ($shiftDetail && $shiftDetail->checkin_time) {
                $checkinTime = Carbon::parse($shiftDetail->checkin_time);
                $toleransi = $scheduleDay->shift?->toleransi_late ?? 0;
                $limitLate = $checkinTime->copy()->addMinutes($toleransi);
                $limitLate = $limitLate->format('H:i:s');
            }
            // $hasShift = !is_null($shiftDetail);
            $hasShift = !is_null($scheduleDay);
        }
        $is_off = ($scheduleDay?->is_off ?? false) || !is_null($leave);

        if (!$attendance) {
            return response()->json([
                'tanggal' => $today,
                'check_in' => null,
                'check_out' => null,
                'total_waktu' => null,
                // 'is_off' => $scheduleDay?->is_off ?? false,
                'is_off' => $is_off,
                'has_shift' => $hasShift,
                'limit_late' => $limitLate,
            ]);
        }

        $totalWaktu = null;

        if ($attendance->check_in && $attendance->check_out) {
            $checkIn = Carbon::parse($attendance->check_in);
            $checkOut = Carbon::parse($attendance->check_out);

            $totalMenit = $checkIn->diffInMinutes($checkOut);

            $jam = floor($totalMenit / 60);
            $menit = $totalMenit % 60;

            if ($jam > 0 && $menit > 0) {
                $totalWaktu = "{$jam} jam {$menit} menit";
            } elseif ($jam > 0) {
                $totalWaktu = "{$jam} jam";
            } else {
                $totalWaktu = "{$menit} menit";
            }
        }

        return response()->json([
            'tanggal' => (string) $attendance->tanggal,
            'check_in' => $attendance->check_in ? substr($attendance->check_in, 0, 5) : null,
            'check_out' => $attendance->check_out ? substr($attendance->check_out, 0, 5) : null,
            'total_waktu' => $totalWaktu ?? null,

            // 'is_off' => $scheduleDay?->is_off ?? false,
            'is_off' => $is_off,
            'has_shift' => $hasShift,
        ]);
    }

    public function checkIn(Request $request, ImageUploadService $imageService)
    {
        $request->validate([
            'location_status' => 'required',
            'gambar_checkin' => 'required|image',

            'late_reason' => 'nullable|string',
            'late_proof' => 'nullable|image',
        ]);

        $employeeId = $request->user()->employees->id;
        $employeeCode = $request->user()->employees->employee_code;


        // $todayDate = now()->toDateString();
        // $employee = Employee::with(['shift', 'office'])
        //     ->findOrFail($employeeId);
        // $timezone = $employee->office?->timezone ?? 'Asia/Jakarta';
        // $checkInTime = Carbon::now($timezone);
        //// $checkInTime = now();
        $employee = Employee::with(['shift', 'office'])
            ->findOrFail($employeeId);

        $timezone = $employee->office?->timezone ?? 'Asia/Jakarta';
        $todayDate = Carbon::now($timezone)->toDateString();
        $checkInTime = Carbon::now($timezone);

        $scheduleDay = WorkScheduleDay::whereDate('work_date', $todayDate)
            ->whereHas('workSchedule', function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            })
            ->first();
        $leave = Leave::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $todayDate)
            ->whereDate('end_date', '>=', $todayDate)
            ->first();

        if (!$scheduleDay) {
            return response()->json(
                [
                    'message' => 'Jadwal tidak ditemukan',
                ],
                422,
            );
        }

        if ($scheduleDay->is_off || $leave) {

            $message = $leave
                ? 'Anda sedang cuti, tidak bisa checkin'
                : 'Hari ini libur, tidak bisa checkin';

            return response()->json(
                [
                    'message' => $message,
                ],
                422,
            );
        }

        $exists = Attendance::where('employee_id', $employeeId)->where('tanggal', $todayDate)->first();

        if ($exists) {
            return response()->json(
                [
                    'message' => 'Sudah checkin hari ini',
                ],
                400,
            );
        }

        return DB::transaction(function () use (
            $request,
            $employeeId,
            $todayDate,
            $checkInTime,
            $timezone,
            $imageService,
            $employeeCode,
        ) {
            $employee = Employee::with('shift')->findOrFail($employeeId);

            if (!$employee->shift) {
                return response()->json(['message' => 'Shift belum diatur'], 400);
            }

            // $todayDay = strtolower(Carbon::now()->locale('id')->dayName);
            $todayDay = strtolower(
                Carbon::now($timezone)
                    ->locale('id')
                    ->dayName
            );

            $shiftDetail = ShiftDetail::where('shift_id', $employee->shift_id)->where('day_of_week', $todayDay)->first();

            if (!$shiftDetail) {
                return response()->json(['message' => 'Shift hari ini tidak ditemukan'], 400);
            }

            // $shiftCheckout = Carbon::parse($shiftDetail->checkout_time);
            $shiftCheckout = Carbon::today($timezone)
                ->setTimeFromTimeString($shiftDetail->checkout_time);
            if ($checkInTime->gt($shiftCheckout)) {
                return response()->json([
                    'message' => 'Tidak bisa check-in setelah jam kerja berakhir'
                ], 422);
            }

            $imagePath = null;
            if ($request->hasFile('gambar_checkin')) {
                $imagePath = $imageService->upload($request->file('gambar_checkin'), 'att', $employeeCode, 'attendance');
            }

            // $shiftCheckin = Carbon::parse($shiftDetail->checkin_time);
            $shiftCheckin = Carbon::today($timezone)
                ->setTimeFromTimeString($shiftDetail->checkin_time);
            $lateMinutes = 0;

            if ($checkInTime->gt($shiftCheckin)) {
                $lateMinutes = $shiftCheckin->diffInMinutes($checkInTime);
            }

            $toleransi = $employee->shift->toleransi_late ?? 0;

            if ($lateMinutes === 0) {
                $statusUtama = 'Tepat Waktu';
            } elseif ($lateMinutes <= $toleransi) {
                $statusUtama = 'Terlambat Dengan Toleransi';
            } else {
                $statusUtama = 'Terlambat Tanpa Toleransi';
            }

            $isLateWithoutTolerance = $lateMinutes > $toleransi;

            if ($isLateWithoutTolerance) {
                if (!$request->late_reason) {
                    return response()->json([
                        'message' => 'Anda terlambat, wajib isi alasan'
                    ], 422);
                }
            }

            $lateProofPath = null;
            if ($request->hasFile('late_proof')) {
                $lateProofPath = $imageService->upload(
                    $request->file('late_proof'),
                    'late',
                    $employeeCode,
                    'attendance'
                );
            }

            $rangeStatus = $request->location_status;
            $finalStatus = $statusUtama . ' - ' . $rangeStatus;

            $statusAprv = $isLateWithoutTolerance ? 'pending' : 'onTime';

            Attendance::create([
                'employee_id' => $employeeId,
                'gambar_checkin' => $imagePath,

                'tanggal' => $todayDate,
                'name_shift' => $employee->shift->name_shift,
                'check_in' => $checkInTime->format('H:i:s'),

                'checkin_time' => $shiftDetail->checkin_time,
                'checkout_time' => $shiftDetail->checkout_time,
                'toleransi_late' => $toleransi,
                'late_minutes' => $lateMinutes,
                'status_checkin' => $finalStatus,

                'status' => $lateMinutes > 0 ? 'late' : 'ontime',
                'late_reason' => $request->late_reason,
                'late_proof' => $lateProofPath,
                'statusAprv' => $statusAprv,

                'latitude_checkin' => $request->latitude_checkin,
                'longitude_checkin' => $request->longitude_checkin,
                'distance_checkin' => $request->distance_checkin,

                'device' => $request->device ?? 'Mobile',
            ]);

            return response()->json(['message' => 'Checkin Success'], 201);
        });
    }

    public function checkOut(Request $request, ImageUploadService $imageService)
    {
        $employee = $request->user()->employees;

        $employeeId = $employee->id;
        $employeeCode = $employee->employee_code;

        // $today = now()->toDateString();
        $timezone = $employee->office?->timezone ?? 'Asia/Jakarta';
        $today = Carbon::now($timezone)->toDateString();

        $attendance = Attendance::where('employee_id', $employeeId)->where('tanggal', $today)->first();

        if (!$attendance) {
            return response()->json(
                [
                    'message' => 'Belum checkin',
                ],
                400,
            );
        }

        if ($attendance->check_out) {
            return response()->json(
                [
                    'message' => 'Sudah checkout',
                ],
                400,
            );
        }

        return DB::transaction(function () use ($request, $imageService, $attendance, $employeeCode, $employee, $timezone) {
            // $checkOutTime = now();
            $checkOutTime = Carbon::now($timezone);

            $imagePath = null;

            if ($request->hasFile('gambar_checkout')) {
                $imagePath = $imageService->upload($request->file('gambar_checkout'), 'att', $employeeCode, 'attendance');
            }

            // $checkIn = Carbon::parse($attendance->check_in);
            // $totalWaktu = $checkIn->diffInMinutes($checkOutTime);
            $checkIn = Carbon::today($timezone)->setTimeFromTimeString($attendance->check_in);
            $totalWaktu = $checkIn->diffInMinutes($checkOutTime);

            // $hari = strtolower(now()->locale('id')->dayName);
            $hari = strtolower(
                Carbon::now($timezone)
                    ->locale('id')
                    ->dayName
            );

            $shiftDetail = ShiftDetail::where('shift_id', $employee->shift_id)
                ->where('day_of_week', $hari)
                ->where('is_active', true)
                ->first();

            $rangeStatus = $request->location_status;
            $finalStatus = 'Tepat Waktu - ' . $rangeStatus;

            $earlyReason = null;
            if ($shiftDetail && $shiftDetail->checkout_time) {
                // $shiftCheckout = Carbon::parse($shiftDetail->checkout_time);
                $shiftCheckout = Carbon::today($timezone)
                    ->setTimeFromTimeString($shiftDetail->checkout_time);

                if ($checkOutTime->lt($shiftCheckout)) {
                    if (!$request->filled('early_reason')) {
                        return response()->json([
                            'message' => 'Alasan pulang cepat wajib diisi'
                        ], 422);
                    }
                    $earlyReason = $request->early_reason;
                    $finalStatus = 'Lebih Cepat - ' . $rangeStatus;
                } else {
                    $finalStatus = 'Tepat Waktu - ' . $rangeStatus;
                }
            }
            $attendance->update([
                'check_out' => $checkOutTime->format('H:i:s'),
                'gambar_checkout' => $imagePath,

                'status_checkout' => $finalStatus,
                'early_reason' => $earlyReason,
                'total_waktu' => $totalWaktu,

                'latitude_checkout' => $request->latitude_checkout,
                'longitude_checkout' => $request->longitude_checkout,
                'distance_checkout' => $request->distance_checkout,

                'device' => $request->device ?? 'Mobile',
            ]);

            return response()->json(
                [
                    'message' => 'Checkout berhasil',
                ],
                200,
            );
        });
    }
}
