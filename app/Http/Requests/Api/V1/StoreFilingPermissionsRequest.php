<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFilingPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'record_type_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'record_type_id.required' => '不能为空',
            'record_type_id.integer' => '必须是整数',
        ];
    }
}
