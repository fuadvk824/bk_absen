<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveCategory extends Model
{
    use HasFactory;

    protected $table = 'leave_categories';

    protected $fillable = ['leave_code', 'leave_name', 'max_days', 'masa_bakti', 'reset'];

    /**
     * Relasi ke table leaves
     */
    public function leaves()
    {
        return $this->hasMany(Leave::class, 'leave_categories_id');
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }
}
