<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonnelResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'total_people' => $this->total_people,
            'staff' => $this->staff,
            'service' => $this->service,
            'manager' => $this->manager,
            'high_school_diploma' => $this->high_school_diploma,
            'security_officer' => $this->security_officer,
            'safety_engineer' => $this->safety_engineer,
            'safety_engineering_major' => $this->safety_engineering_major,
            'fire_engineer' => $this->fire_engineer,
            'other' => $this->other,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'company' => $this->whenLoaded('company', fn () => new CompanyResource($this->company)),
        ];
    }
}
