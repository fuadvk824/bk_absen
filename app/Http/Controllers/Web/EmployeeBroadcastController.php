<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Mail\EmployeeBroadcastMail;
use App\Models\AppVersion;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmployeeBroadcastController extends Controller
{
    public function index()
    {
        $employees = Employee::query()
            ->whereIn('status', ['magang', 'kontrak'])
            ->whereHas('user', function ($query) {
                $query->whereNotNull('email')
                    ->where('email', '!=', '');
            })
            ->with('user:id,name,email')
            ->orderBy('id')
            ->get([
                'id',
                'user_id',
                'name',
                'employee_code',
                'status',
            ]);

        return Inertia::render('developer/broadcast/index', [
            'employees' => $employees->map(fn($employee) => [
                'id' => $employee->id,
                'name' => $employee->user?->name
                    ?? $employee->name,
                'employee_code' => $employee->employee_code,
                'email' => $employee->user?->email,
                'status' => $employee->status,
            ])->values(),
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'employee_ids' => [
                'required',
                'array',
                'min:1',
            ],
            'employee_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:employees,id',
            ],
        ]);

        $employees = Employee::query()
            ->whereIn('status', ['magang', 'kontrak'])
            ->whereIn('id', $validated['employee_ids'])
            ->whereHas('user', function ($query) {
                $query->whereNotNull('email')
                    ->where('email', '!=', '');
            })
            ->with('user')
            ->get();

        if ($employees->count() !== count($validated['employee_ids'])) {
            return back()->withErrors([
                'employee_ids' =>
                'Ada akun yang tidak memenuhi syarat penerima.',
            ]);
        }

        $appVersion = AppVersion::query()
            ->latest('id')
            ->first();

        if (!$appVersion) {
            return back()->withErrors([
                'employee_ids' =>
                'Data versi aplikasi belum tersedia.',
            ]);
        }

        $queuedCount = 0;

        foreach ($employees as $employee) {
            $email = $employee->user?->email;

            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            Mail::to($employee->user->email)
                ->queue(new EmployeeBroadcastMail(
                    $appVersion,
                    $employee->name
                ));
            $queuedCount++;
        }

        if ($queuedCount === 0) {
            return back()->withErrors([
                'employee_ids' =>
                'Tidak ada alamat email penerima yang valid.',
            ]);
        }

        return back()->with(
            'success',
            "Email pembaruan aplikasi untuk {$queuedCount} akun berhasil dimasukkan ke antrean."
        );
    }
}
