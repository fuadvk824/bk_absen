<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code',
        'name',
        'user_id',
        'office_id',
        'department_id',
        'position_id',
        'shift_id',
        'tanggal_awal_kerja',
        'kontrak_mulai_tanggal',
        'kontrak_selesai_tanggal',
        'status',
    ];

    protected $casts = [
        'tanggal_awal_kerja' => 'date:Y-m-d',
        'kontrak_mulai_tanggal' => 'date:Y-m-d',
        'kontrak_selesai_tanggal' => 'date:Y-m-d',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    public function workSchedules()
    {
        return $this->hasMany(WorkSchedule::class);
    }

    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }
    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function workScheduleCurrentMonth()
    {
        $today = now();

        if ($today->day >= 26) {
            $startDate = Carbon::create($today->year, $today->month, 26);
        } else {
            $startDate = Carbon::create($today->year, $today->month, 26)->subMonth();
        }

        $endDate = $startDate->copy()->addMonth()->day(25);

        return $this->hasOne(WorkSchedule::class)
            ->whereDate('start_date', $startDate)
            ->whereDate('end_date', $endDate);
    }

    public function scopeFilter(Builder $query, Request $request): Builder
    {
        return $query
            ->with([
                'user',
                'position:id,name',
                'department:id,name',
                'office:id,name',
                'shift:id,name_shift',
            ])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            })
            ->when($request->position_id, fn($q) => $q->where('position_id', $request->position_id))
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->office_id, fn($q) => $q->where('office_id', $request->office_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status));
    }
}
