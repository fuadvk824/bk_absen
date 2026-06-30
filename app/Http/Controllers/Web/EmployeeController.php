<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\EmployeeStoreRequest;
use App\Http\Requests\Web\EmployeeUpdateRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Office;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

use App\Exports\EmployeesExport;
use App\Http\Resources\Web\EmployeeResource;
use App\Mail\EmployeeAccountMail;
use App\Models\Salary;
use App\Models\User;
use App\Services\CodeGeneratorService;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;

use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $employees = Employee::filter($request)->paginate($perPage)->withQueryString();

        return Inertia::render('data-karyawan/karyawan/index', [
            'employees' => EmployeeResource::collection($employees)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'position_id' => $request->position_id,
                'department_id' => $request->department_id,
                'office_id' => $request->office_id,
                'status' => $request->status,
                'perPage' => $perPage,
            ],
            'totalEmployees' => Employee::count(),
            'positions' => Position::select('id', 'name')->get(),
            'departments' => Department::select('id', 'name')->get(),
            'offices' => Office::select('id', 'name')->get(),
        ]);
    }
    public function create()
    {
        return Inertia::render('data-karyawan/karyawan/create', [
            'offices' => Office::select('id', 'name')->orderBy('name')->get(),
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
            'positions' => Position::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(EmployeeStoreRequest $request, CodeGeneratorService $codeService)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $codeService) {
            $userCode = $codeService->generate(User::class, 'user_code', 'USR', 3);
            $employeeCode = $codeService->generate(Employee::class, 'employee_code', 'EMP', 3);

            $password = Str::random(12);
            $user = User::create([
                'user_code' => $userCode,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($password),

                'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
                'nik' => $validated['nik'] ?? null,
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            $employee = Employee::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'employee_code' => $employeeCode,
                'office_id' => $validated['office_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'position_id' => $validated['position_id'] ?? null,
                'shift_id' => null,
                'tanggal_awal_kerja' => $validated['tanggal_awal_kerja'] ?? null,
                'kontrak_mulai_tanggal' => $validated['kontrak_mulai_tanggal'] ?? null,
                'kontrak_selesai_tanggal' => $validated['kontrak_selesai_tanggal'] ?? null,
                'status' => 'new',
            ]);

            Salary::create([
                'employee_id' => $employee->id,
                'basic_salary' => 0,
                'daily_salary' => $validated['daily_salary'] ?? 0,
                'effective_from' => now()->toDateString(),
            ]);
            $user->assignRole('user');
        });

        return redirect()->route('employee.index')->with('success', 'Data karyawan berhasil ditambahkan.');
    }

    public function edit(Employee $employee)
    {
        $employee->load('user');

        return inertia('data-karyawan/karyawan/edit', [
            'user' => $employee->user,
            'employee' => $employee,

            'offices' => Office::select('id', 'name')->get(),
            'departments' => Department::select('id', 'name')->get(),
            'positions' => Position::select('id', 'name')->get(),
        ]);
    }

    public function update(EmployeeUpdateRequest $request, Employee $employee)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $employee) {
            $employee->user()->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
                'nik' => $validated['nik'] ?? null,
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            $employee->update([
                'office_id' => $validated['office_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'position_id' => $validated['position_id'] ?? null,
                'tanggal_awal_kerja' => $validated['tanggal_awal_kerja'] ?? null,
                'kontrak_mulai_tanggal' => $validated['kontrak_mulai_tanggal'] ?? null,
                'kontrak_selesai_tanggal' => $validated['kontrak_selesai_tanggal'] ?? null,
            ]);

            $salary = Salary::firstOrCreate(
                ['employee_id' => $employee->id],
                [
                    'effective_from' => now()->toDateString(),
                ],
            );

            $salary->update([
                'daily_salary' => $validated['daily_salary'] ?? 0,
            ]);
        });

        return redirect()->route('employee.index')->with('success', 'Data karyawan berhasil diperbarui');
    }

    function isValidEmailDomain($email)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $domain = substr(strrchr($email, '@'), 1);

        $blockedDomains = ['example.com', 'test.com', 'invalid.com', 'localhost'];

        if (in_array(strtolower($domain), $blockedDomains)) {
            return false;
        }

        $mxRecords = dns_get_record($domain, DNS_MX);

        if (!$mxRecords || count($mxRecords) === 0) {
            return false;
        }

        return true;
    }

    public function updateStatus(Request $request, Employee $employee)
    {
        $request->validate([
            'status' => 'required|in:new,magang,kontrak,inactive',
        ]);

        $targetStatus = $request->status;
        $currentStatus = $employee->status;

        $allowedTransitions = [
            'new' => ['magang', 'kontrak', 'inactive'],
            'magang' => ['kontrak', 'inactive', 'new'],
            'kontrak' => ['inactive', 'new'],
            'inactive' => [],
        ];

        if (!in_array($targetStatus, $allowedTransitions[$currentStatus])) {
            return back()->with('error', 'Perubahan status tidak valid.');
        }

        if ($currentStatus === 'new' && in_array($targetStatus, ['magang', 'kontrak'])) {
            $user = $employee->user;

            if (!$user || !$this->isValidEmailDomain($user->email)) {
                return back()->with('error', 'Email tidak valid atau domain email tidak menerima email.');
            }
            $plainPassword = Str::random(8);

            $user->password = Hash::make($plainPassword);
            $user->save();

            Mail::to($user->email)->send(new EmployeeAccountMail($user, $plainPassword));
        }

        $employee->update([
            'status' => $targetStatus,
        ]);

        if ($targetStatus === 'new' && $employee->user) {
            $employee->user->update([
                'key_status' => 'new',
            ]);
        }

        return back()->with('success', 'Status karyawan berhasil diperbarui.');
    }

    public function destroy(Employee $employee)
    {
        $user = $employee->user;
        $employee->delete();

        if ($user) {
            $user->delete();
        }

        return redirect()->route('employee.index')->with('success', 'Data karyawan berhasil dihapus');
    }

    public function export(Request $request)
    {
        $date = now()->format('d-m-Y');

        return Excel::download(
            new EmployeesExport($request),
            "Data Karyawan {$date}.xlsx"
        );
    }
}
