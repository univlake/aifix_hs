<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFocusCompaniesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'focus_id' => 'required|integer',
            'company_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'focus_id.required' => '不能为空',
            'focus_id.integer' => '必须是整数',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
