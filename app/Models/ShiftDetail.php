<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftDetail extends Model
{
    use HasFactory;
    protected $fillable = ['shift_id', 'day_of_week', 'checkin_time', 'checkout_time', 'breaktime_start', 'breaktime_end', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
