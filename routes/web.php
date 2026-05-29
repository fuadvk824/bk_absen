<?php

use App\Http\Controllers\Web\AssignShiftController;
use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\DepartmentController;
use App\Http\Controllers\Web\EmployeeController;
use App\Http\Controllers\Web\LeaveController;
use App\Http\Controllers\Web\LeaveSubmitController;
use App\Http\Controllers\Web\OfficeController;
use App\Http\Controllers\Web\OvertimeController;
use App\Http\Controllers\Web\PayrollController;
use App\Http\Controllers\Web\PositionController;
use App\Http\Controllers\Web\SalaryController;
use App\Http\Controllers\Web\ShiftController;
use App\Http\Controllers\Web\WorkScheduleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', 'role:super-admin|admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('employee')
        ->name('employee.')
        ->group(function () {
            Route::get('/', [EmployeeController::class, 'index'])->name('index');
            Route::get('/create', [EmployeeController::class, 'create'])->name('create');
            Route::post('/store', [EmployeeController::class, 'store'])->name('store');
            Route::get('/{employee}/edit', [EmployeeController::class, 'edit'])->name('edit');
            Route::put('/{employee}', [EmployeeController::class, 'update'])->name('update');
            Route::delete('/{employee}', [EmployeeController::class, 'destroy'])->name('destroy');

            Route::patch('/{employee}/status', [EmployeeController::class, 'updateStatus'])->name('updateStatus');
            // Route::patch('/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('toggleStatus');
        });
    Route::prefix('office')
        ->name('office.')
        ->group(function () {
            Route::get('/', [OfficeController::class, 'index'])->name('index');
            Route::get('/create', [OfficeController::class, 'create'])->name('create');
            Route::post('/store', [OfficeController::class, 'store'])->name('store');
            Route::get('/{office}/edit', [OfficeController::class, 'edit'])->name('edit');
            Route::put('/{office}', [OfficeController::class, 'update'])->name('update');
            Route::delete('/{office}', [OfficeController::class, 'destroy'])->name('destroy');
        });
    Route::prefix('department')
        ->name('department.')
        ->group(function () {
            Route::get('/', [DepartmentController::class, 'index'])->name('index');
            Route::get('/create', [DepartmentController::class, 'create'])->name('create');
            Route::post('/store', [DepartmentController::class, 'store'])->name('store');
            Route::get('/{department}/edit', [DepartmentController::class, 'edit'])->name('edit');
            Route::put('/{department}', [DepartmentController::class, 'update'])->name('update');
            Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('destroy');
        });
    Route::prefix('position')
        ->name('position.')
        ->group(function () {
            Route::get('/', [PositionController::class, 'index'])->name('index');
            Route::get('/create', [PositionController::class, 'create'])->name('create');
            Route::post('/store', [PositionController::class, 'store'])->name('store');
            Route::get('/{position}/edit', [PositionController::class, 'edit'])->name('edit');
            Route::put('/{position}', [PositionController::class, 'update'])->name('update');
            Route::delete('/{position}', [PositionController::class, 'destroy'])->name('destroy');
        });

    Route::prefix('attendance')
        ->name('attendance.')
        ->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('index');
            Route::put('/{attendance}/approval', [AttendanceController::class, 'approval'])
                ->name('approval');
        });
    Route::prefix('overtime')
        ->name('overtime.')
        ->group(function () {
            Route::get('/', [OvertimeController::class, 'index'])->name('index');
            // Route::get('/{overtime}/edit', [OvertimeController::class, 'edit'])->name('edit');
            // Route::get('/{overtime}/show', [OvertimeController::class, 'show'])->name('show');
            Route::get('/create', [OvertimeController::class, 'create'])->name('create');
            Route::patch('/{overtime}/status', [OvertimeController::class, 'updateStatus'])->name('updateStatus');
            // Route::post('/store', [OvertimeController::class, 'store'])->name('store');
        });
    Route::prefix('shift')
        ->name('shift.')
        ->group(function () {
            Route::get('/', [ShiftController::class, 'index'])->name('index');
            Route::get('/create', [ShiftController::class, 'create'])->name('create');
            Route::post('/store', [ShiftController::class, 'store'])->name('store');
            Route::get('/{shift}/edit', [ShiftController::class, 'edit'])->name('edit');
            Route::put('/{shift}', [ShiftController::class, 'update'])->name('update');
            Route::delete('/{shift}', [ShiftController::class, 'destroy'])->name('destroy');
        });
    Route::prefix('assign')
        ->name('assign.')
        ->group(function () {
            Route::get('/{shift}/edit', [AssignShiftController::class, 'edit'])->name('edit');
            Route::patch('/{shift}/patch', [AssignShiftController::class, 'patch'])->name('patch');
        });

    Route::prefix('workschedule')
        ->name('workschedule.')
        ->group(function () {
            Route::get('/', [WorkScheduleController::class, 'index'])->name('index');
            Route::patch('/day/{id}', [WorkScheduleController::class, 'updateDay'])->name('updateDay');
            Route::patch('/bulk-update', [WorkScheduleController::class, 'bulkUpdate'])
                ->name('bulkUpdate');
        });

    Route::prefix('leave')
        ->name('leave.')
        ->group(function () {
            Route::get('/', [LeaveController::class, 'index'])->name('index');
            Route::get('/create', [LeaveController::class, 'create'])->name('create');
            Route::post('/store', [LeaveController::class, 'store'])->name('store');
            Route::get('/{leave}/edit', [LeaveController::class, 'edit'])->name('edit');
            Route::put('/{leave}', [LeaveController::class, 'update'])->name('update');
            Route::delete('/{leave}', [LeaveController::class, 'destroy'])->name('destroy');
        });
    Route::prefix('leavesubmit')
        ->name('leavesubmit.')
        ->group(function () {
            Route::get('/', [LeaveSubmitController::class, 'index'])->name('index');
            Route::patch('/{leavesubmit}/status', [LeaveSubmitController::class, 'updateStatus'])->name('updateStatus');
        });
    Route::prefix('payroll')
        ->name('payroll.')
        ->group(function () {
            Route::get('/', [PayrollController::class, 'index'])->name('index');
            Route::post('/generate', [PayrollController::class, 'generate'])->name('generate');
            Route::get('/{payroll}', [PayrollController::class, 'show'])->name('show');

            Route::patch('/payroll/{payroll}/lock', [PayrollController::class, 'lock'])->name('lock');
            // Route::get('/{id}/download', [PayrollController::class, 'downloadPdf'])->name('downloadPdf');
            Route::get('/{id}/download', [PayrollController::class, 'downloadPdf'])->name('download');
        });

    Route::prefix('salary')
        ->name('salary.')
        ->group(function () {
            Route::get('/', [SalaryController::class, 'index'])->name('index');
            Route::get('/create', [SalaryController::class, 'create'])->name('create');
            Route::post('/store', [SalaryController::class, 'store'])->name('store');
            Route::get('/{salary}/edit', [SalaryController::class, 'edit'])->name('edit');
            Route::put('/{salary}', [SalaryController::class, 'update'])->name('update');
            Route::delete('/{salary}', [SalaryController::class, 'destroy'])->name('destroy');
        });

    Route::get('/employee/export', [EmployeeController::class, 'export'])->name('employee.export');
    Route::get('/department/export', [DepartmentController::class, 'export'])->name('department.export');
    Route::get('/office/export', [OfficeController::class, 'export'])->name('office.export');
    Route::get('/attendance/export', [AttendanceController::class, 'export'])->name('attendance.export');
    Route::get('/overtime/export', [OvertimeController::class, 'export'])->name('overtime.export');
    Route::get('/shift/export', [ShiftController::class, 'export'])->name('shift.export');

    // Route::get('/admin/attendances', [AttendanceController::class, 'index']);

    // Route::get('/change-password', function () {
    //     return inertia('Auth/ChangePassword');
    // })->name('password.change');

    // Route::post('/change-password', [PasswordController::class, 'update'])
    //     ->name('password.update');
});

require __DIR__ . '/settings.php';
