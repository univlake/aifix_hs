<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'config_day' => 'nullable|string|max:255',
            'type' => 'nullable|integer',
            'company_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'config_day.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
