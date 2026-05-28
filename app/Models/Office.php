<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;

class Office extends Model
{
    protected $fillable = [
        'office_code',
        'name',
        'image',
        'address',
        'phone',
        'city',
        'province',
        'poscode',
        'status',
        'latitude',
        'longitude',
        'radius_meter',
    ];
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function employees()
    {
        return $this->hasOne(Employee::class);
    }

    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }

    public function holidays(): HasMany
    {
        return $this->hasMany(Holiday::class);
    }

    public function scopeFilter(Builder $query, Request $request): Builder
    {
        return $query
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->city, fn($q) => $q->where('city', $request->city));
    }
}
