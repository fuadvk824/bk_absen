<?php

namespace App\Models;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class WorkSchedule extends Model
{
    use HasFactory;

    protected $fillable = ['employee_id', 'shift_id', 'start_date', 'end_date', 'total_work_days', 'total_off_days'];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'total_work_days' => 'integer',
        'total_off_days' => 'integer',
    ];
    public function workScheduleDays()
    {
        return $this->hasMany(WorkScheduleDay::class);
    }
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
