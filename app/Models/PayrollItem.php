<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PayrollItem extends Model
{
    protected $fillable = ['payroll_id', 'source_id', 'source_type', 'name', 'keterangan', 'type', 'amount'];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function getSourceDetailAttribute()
    {
        if ($this->source instanceof Attendance) {
            return [
                'type' => 'attendance',
                'date' => $this->source->tanggal->format('Y-m-d'),
            ];
        }

        if ($this->source instanceof Overtime) {
            return [
                'type' => 'overtime',
                'date' => $this->source->date->format('Y-m-d'),
            ];
        }

        return null;
    }
}
