<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OvertimeRate extends Model
{
    protected $fillable = [
        'name',
        'rate_per_hour',
        'effective_from',
        'is_active',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'rate_per_hour' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function overtimes()
    {
        return $this->hasMany(Overtime::class);
    }
}
