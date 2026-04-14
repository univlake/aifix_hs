<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSecurityInvestmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'year' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'last_year_income' => 'nullable|numeric',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'year.max' => '不能超过255个字符',
            'type.max' => '不能超过255个字符',
            'title.max' => '不能超过255个字符',
        ];
    }
}
