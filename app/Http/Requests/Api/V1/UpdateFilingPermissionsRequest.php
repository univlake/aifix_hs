<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFilingPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|integer',
            'record_type_id' => 'sometimes|integer',
            'issuing_department' => 'sometimes|nullable|string|max:255',
            'filing_range' => 'sometimes|nullable|string|max:255',
            'filing_time' => 'sometimes|nullable|date',
            'valid_period' => 'sometimes|nullable|string|max:64',
            'comment' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.integer' => '必须是整数',
            'record_type_id.integer' => '必须是整数',
        ];
    }
}
