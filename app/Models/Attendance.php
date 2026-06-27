<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',

        'gambar_checkin',
        'gambar_checkout',

        'tanggal',
        'name_shift',

        'check_in',
        'check_out',

        'checkin_time',
        'checkout_time',

        'toleransi_late',
        'late_minutes',
        'total_waktu',

        'status_checkin',
        'status_checkout',

        'status',
        'late_reason',
        'late_proof',
        'early_reason',
        'statusAprv',

        'latitude_checkin',
        'longitude_checkin',
        'distance_checkin',

        'latitude_checkout',
        'longitude_checkout',
        'distance_checkout',

        'device',
    ];

    protected $casts = [
        'toleransi_late' => 'integer',
        'late_minutes' => 'integer',

        'latitude_checkin' => 'float',
        'longitude_checkin' => 'float',
        'distance_checkin' => 'float',

        'latitude_checkout' => 'float',
        'longitude_checkout' => 'float',
        'distance_checkout' => 'float',

        'tanggal' => 'date:Y-m-d',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopeFilter(Builder $query, Request $request)
    {
        return $query

            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('employee', function ($u) use ($request) {
                    $u->where('name', 'like', '%' . $request->search . '%');
                });
            })

            ->when($request->office_ids, function ($q) use ($request) {
                $officeIds = is_array($request->office_ids) ? $request->office_ids : explode(',', $request->office_ids);

                $q->whereHas('employee', function ($e) use ($officeIds) {
                    $e->whereIn('office_id', $officeIds);
                });
            })

            ->when($request->department_id, function ($q) use ($request) {
                $q->whereHas('employee', function ($e) use ($request) {
                    $e->where('department_id', $request->department_id);
                });
            })
            ->when($request->shift_id, function ($q) use ($request) {
                $q->whereHas('employee', function ($e) use ($request) {
                    $e->where('shift_id', $request->shift_id);
                });
            })

            ->when($request->start_date && $request->end_date, function ($q) use ($request) {
                $q->whereBetween('tanggal', [$request->start_date, $request->end_date]);
            })

            ->when($request->status, function ($q) use ($request) {
                if ($request->status === 'tepat_waktu') {
                    $q->where('status', 'ontime');
                }

                if ($request->status === 'terlambat') {
                    $q->where('status', 'late');
                }
            });
    }

    // public function getTotalWaktuFormatAttribute()
    // {
    //     if (!$this->total_waktu) {
    //         return null;
    //     }

    //     $jam = floor($this->total_waktu / 60);
    //     $menit = $this->total_waktu % 60;

    //     return "{$jam} Jam {$menit} Menit";
    // }
}
