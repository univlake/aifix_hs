<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreNormChecksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'path' => 'nullable|string',
            'number' => 'nullable|integer',
            'year' => 'required|integer',
            'type' => 'required|string',
            'company_id' => 'required|integer',
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
