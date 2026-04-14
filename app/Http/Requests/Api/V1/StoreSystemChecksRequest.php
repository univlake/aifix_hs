<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSystemChecksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'number_v1' => 'nullable|numeric',
            'number_v2' => 'nullable|numeric',
            'number_v3' => 'nullable|numeric',
            'number_v4' => 'nullable|numeric',
            'number_v5' => 'nullable|numeric',
            'number' => 'nullable|integer',
            'year' => 'required|integer',
            'company_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'year.required' => '不能为空',
            'year.integer' => '必须是整数',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
