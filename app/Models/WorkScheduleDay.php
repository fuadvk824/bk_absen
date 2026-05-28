<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkScheduleDay extends Model
{
    use HasFactory;

    protected $fillable = ['work_schedule_id', 'shift_id', 'work_date', 'is_off', 'note'];

    protected $casts = [
        'work_date' => 'date:Y-m-d',
        'is_off' => 'boolean',
    ];

    public function workSchedule()
    {
        return $this->belongsTo(WorkSchedule::class, 'work_schedule_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
