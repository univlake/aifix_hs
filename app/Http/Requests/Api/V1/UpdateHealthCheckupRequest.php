<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHealthCheckupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|required|in:岗前,岗中,岗后',
            'department' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|integer',
            'checkup_date' => 'sometimes|nullable|date',
            'checkup_expiry' => 'sometimes|nullable|string',
            'measure' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => '不能为空',
            'type.in' => '检查类型必须是岗前、岗中或岗后',
            'department.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
