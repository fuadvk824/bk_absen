<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OffdayRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'work_schedule_day_id',
        'date',
        'status_start_date',
        'status_end_date',
        'status',
        'reason',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function workScheduleDay()
    {
        return $this->belongsTo(WorkScheduleDay::class);
    }
}
