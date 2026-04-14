<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreRectificationSheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expert_inspection_id' => 'required|integer',
            'check_company_id' => 'required|integer',
            'sheet_name' => 'required|integer',
            'path' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'expert_inspection_id.required' => '不能为空',
            'expert_inspection_id.integer' => '必须是整数',
            'check_company_id.required' => '不能为空',
            'check_company_id.integer' => '必须是整数',
            'sheet_name.required' => '不能为空',
            'sheet_name.integer' => '必须是整数',
            'path.required' => '不能为空',
            'path.string' => '必须是字符串',
        ];
    }
}
