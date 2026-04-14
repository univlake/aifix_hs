<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFundingExecutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'year' => 'sometimes|nullable|string|max:255',
            'security_investment_id' => 'sometimes|nullable|integer',
            'simple_content' => 'sometimes|nullable|string|max:255',
            'content' => 'sometimes|nullable|string',
            'budget' => 'sometimes|nullable|numeric',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'year.max' => '不能超过255个字符',
            'simple_content.max' => '不能超过255个字符',
        ];
    }
}
