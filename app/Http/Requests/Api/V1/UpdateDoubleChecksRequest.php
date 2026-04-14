<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoubleChecksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'double_check_template_id' => 'sometimes|required|integer',
            'path' => 'sometimes|nullable|string',
            'number' => 'sometimes|nullable|integer',
            'comment' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
            'year' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'double_check_template_id.required' => '不能为空',
            'double_check_template_id.integer' => '必须是整数',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'year.required' => '不能为空',
            'year.integer' => '必须是整数',
        ];
    }
}
