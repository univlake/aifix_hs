<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRectificationSheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expert_inspection_id' => 'sometimes|nullable|integer',
            'check_company_id' => 'sometimes|nullable|integer',
            'sheet_name' => 'sometimes|nullable|integer',
            'path' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            // 无需自定义消息
        ];
    }
}
