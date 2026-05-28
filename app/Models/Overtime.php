<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Overtime extends Model
{
    use HasFactory;

    protected $fillable = ['employee_id', 'overtime_rate_id', 'date', 'time_from', 'time_to', 'reason', 'status', 'is_paid'];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'time_from' => 'datetime:H:i',
        'time_to' => 'datetime:H:i',
        'rate_per_hour' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function overtimeRate()
    {
        return $this->belongsTo(OvertimeRate::class);
    }

    public function scopeFilter(Builder $query, Request $request): Builder
    {
        return $query
            ->with(['employee:id,name', 'employee.office:id,name', 'employee.department:id,name'])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('employee', function ($u) use ($request) {
                    $u->where('name', 'like', '%' . $request->search . '%');
                });
            })

            ->when($request->office_id, function ($q) use ($request) {
                $q->whereHas('employee', function ($e) use ($request) {
                    $e->where('office_id', $request->office_id);
                });
            })
            ->when($request->department_id, function ($q) use ($request) {
                $q->whereHas('employee', function ($e) use ($request) {
                    $e->where('department_id', $request->department_id);
                });
            })
            ->when($request->start_date && $request->end_date, function ($q) use ($request) {
                $q->whereBetween('date', [$request->start_date, $request->end_date]);
            })
            ->when($request->status, fn($q) => $q->where('status', $request->status));
    }
}
