<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreDailyChecksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'daily_check_template_id' => 'required|integer',
            'path' => 'nullable|string',
            'number' => 'nullable|integer',
            'comment' => 'nullable|string',
            'company_id' => 'required|integer',
            'year' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'daily_check_template_id.required' => '不能为空',
            'daily_check_template_id.integer' => '必须是整数',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'year.required' => '不能为空',
            'year.integer' => '必须是整数',
        ];
    }
}
