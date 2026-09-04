<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    protected $fillable = [
        'employee_id',
        'name',
        'name_office',
        'nomor_surat',
        'jenis_surat',
        'tanggal_surat',
        'alasan_surat',
        'pdf_path',
        'sent_at',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_surat' => 'date',
            'sent_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
