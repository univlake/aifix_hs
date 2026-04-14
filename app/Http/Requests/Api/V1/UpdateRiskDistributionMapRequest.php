<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRiskDistributionMapRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            // 无需自定义消息
        ];
    }
}
