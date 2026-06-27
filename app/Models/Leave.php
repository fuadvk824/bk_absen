<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Leave extends Model
{
    use HasFactory;

    protected $table = 'leaves';

    protected $fillable = [
        'employee_id',
        'leave_categories_id',
        'submit',
        'start_date',
        'end_date',
        'total_days',
        'file',
        'reason',
        'status',
    ];

    /**
     * Relasi ke employee
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Relasi ke leave category
     */
    public function leaveCategory()
    {
        return $this->belongsTo(LeaveCategory::class, 'leave_categories_id');
    }


    public function scopeFilter(Builder $query, Request $request): Builder
    {
        return $query
            ->with(['employee.office', 'leaveCategory'])
            ->when($request->search, function ($query) use ($request) {
                $search = $request->search;

                $query
                    ->whereHas('employee', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                    
            })
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->office_id, function ($query) use ($request) {
                $query->whereHas('employee', function ($q) use ($request) {
                    $q->where('office_id', $request->office_id);
                });
            })
            ->when($request->leave_category_id, function ($query) use ($request) {
                $query->where('leave_categories_id', $request->leave_category_id);
            });
    }
}
