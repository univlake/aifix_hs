<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'enterprise_type_id' => $this->enterprise_type_id,
            'operational_type_id' => $this->operational_type_id,
            'area_id' => $this->area_id,
            'address' => $this->address,
            'established' => $this->established,
            'credit_code' => $this->credit_code,
            'business_scope' => $this->business_scope,
            'company_introduction' => $this->company_introduction,
            'longitude' => $this->longitude,
            'dimension' => $this->dimension,
            'geographic_range' => $this->geographic_range,
            'acreage' => $this->acreage,
            'supervise_name' => $this->supervise_name,
            'supervise_tel' => $this->supervise_tel,
            'supervise_fix' => $this->supervise_fix,
            'supervise_email' => $this->supervise_email,
            'supervise_position' => $this->supervise_position,
            'status' => $this->status,
            'status_str' => $this->status_str,
            'pid' => $this->pid,
            'is_produce' => $this->is_produce,
            'is_bloc' => $this->is_bloc,
            'inherent_risk' => $this->inherent_risk,
            'inherent_risk_grade' => $this->inherent_risk_grade,
            'float_risk' => $this->float_risk,
            'float_risk_grade' => $this->float_risk_grade,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Conditional relations
            'enterprise_type' => $this->whenLoaded('enterpriseType'),
            'operational_type' => $this->whenLoaded('operationalType'),
            'base_area' => $this->whenLoaded('baseArea'),
            'pid_name' => $this->whenLoaded('pidName', fn () => $this->pidName?->only(['id', 'title'])),
            'users' => $this->whenLoaded('users', fn () => UserResource::collection($this->users)),
            'companies' => $this->whenLoaded('companies', fn () => static::collection($this->companies)),
        ];
    }
}
