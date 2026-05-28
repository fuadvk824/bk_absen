
<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\OvertimeController;
use App\Http\Controllers\Api\WorkScheduleController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);

    Route::get('/me', [HomeController::class, 'me']);
    Route::post('/checkin', [HomeController::class, 'checkIn']);
    Route::patch('/checkout', [HomeController::class, 'checkOut']);
    Route::get('/attendance', [HomeController::class, 'attendance']);

    Route::get('/mycalendar', [WorkScheduleController::class, 'mycalendar']);

    Route::get('/myovertime', [OvertimeController::class, 'myovertime']);
    Route::post('/overtime', [OvertimeController::class, 'store']);

    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::get('/leave-categories', [LeaveController::class, 'categories']);
});


