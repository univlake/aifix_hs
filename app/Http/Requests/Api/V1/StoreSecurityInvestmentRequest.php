<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\SecurityInvestmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'year' => 'nullable|digits:4',
            'type' => ['nullable', Rule::enum(SecurityInvestmentType::class)],
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
            'year.digits' => '必须是4位年份',
            'type.enum' => '类型不合法',
            'title.max' => '不能超过255个字符',
        ];
    }
}
