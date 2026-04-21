<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpertCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notify_company_time' => 'sometimes|nullable|date',
            'check_company_time' => 'sometimes|nullable|date',
            'confirm_time' => 'sometimes|nullable|date',
            'status' => 'sometimes|nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [];
    }
}
