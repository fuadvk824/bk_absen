<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EasterEggView extends Model
{
    protected $fillable = [
        'user_id',
        'viewed_at',
        'app_version',
        'platform',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}