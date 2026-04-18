<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreHealthCheckupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'type' => 'required|in:岗前,岗中,岗后',
            'department' => 'nullable|string|max:255',
            'number' => 'nullable|integer',
            'checkup_date' => 'nullable|date',
            'checkup_expiry' => 'nullable|string',
            'measure' => 'nullable|string',
            'annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'type.required' => '不能为空',
            'type.in' => '检查类型必须是岗前、岗中或岗后',
            'department.max' => '不能超过255个字符',
        ];
    }
}
