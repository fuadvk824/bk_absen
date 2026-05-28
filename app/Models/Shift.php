<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Shift extends Model
{
    use HasFactory;
    protected $fillable = ['shift_code', 'name_shift', 'toleransi_late', 'denda_alpha'];

    protected $casts = [
        'denda_alpha' => 'integer',
    ];

    public function employee()
    {
        return $this->hasMany(Employee::class);
    }

    public function shiftDetails()
    {
        return $this->hasMany(ShiftDetail::class);
    }

    public function shiftDetailByDay($day)
    {
        return $this->hasOne(ShiftDetail::class)->where('day_of_week', $day);
    }

    public function scopeFilter(Builder $query, Request $request): Builder
    {
        return $query->with('shiftDetails')->when($request->search, function ($q) use ($request) {
            $q->where('name_shift', 'like', '%' . $request->search . '%');
        });
    }
}
