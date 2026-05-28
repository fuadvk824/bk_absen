<?php

namespace App\Http\Resources\Web;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    
    public function toArray(Request $request): array
    {

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'amount' => $this->amount,
            'source_type' => $this->source_type,
            'source_id' => $this->source_id,
            'source_detail' => $this->source_detail,
            'keterangan' => $this->keterangan,
        ];
    }
}
