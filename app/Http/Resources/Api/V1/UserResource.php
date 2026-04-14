<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Explicit allowlist keeps sensitive fields (weapp_openid, weixin_session_key,
     * login_times) from being inadvertently exposed to API consumers.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'nickname' => $this->nickname,
            'header_img' => $this->header_img,
            'phone' => $this->phone,
            'department_name' => $this->department_name,
            'email' => $this->email,
            'company_id' => $this->company_id,
            'is_expert' => $this->is_expert,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Conditional relations — only serialized when explicitly loaded
            'company' => $this->whenLoaded('company', fn () => new CompanyResource($this->company)),
            'roles' => $this->whenLoaded('roles', fn () => RoleResource::collection($this->roles)),
        ];
    }
}
