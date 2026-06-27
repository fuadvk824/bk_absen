<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'office_code' => $this->office_code,
            'name' => $this->name,
            'image' => $this->image,
            'image_url' => $this->image ? asset('storage/' . $this->image) : null,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'poscode' => $this->poscode,

            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'radius_meter' => $this->radius_meter,

            'status' => $this->status,
            'timezone' => $this->timezone,
        ];
    }
}
