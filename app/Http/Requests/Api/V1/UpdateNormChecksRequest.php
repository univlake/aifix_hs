<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNormChecksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'path' => 'sometimes|nullable|string',
            'number' => 'sometimes|nullable|integer',
            'year' => 'sometimes|required|integer',
            'type' => 'sometimes|required|string',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'year.required' => '不能为空',
            'year.integer' => '必须是整数',
            'type.required' => '不能为空',
            'type.string' => '必须是字符串',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
