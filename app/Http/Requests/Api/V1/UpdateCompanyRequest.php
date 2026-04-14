<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'enterprise_type_id' => 'nullable|integer',
            'operational_type_id' => 'nullable|integer',
            'area_id' => 'nullable|integer',
            'address' => 'nullable|string',
            'established' => 'nullable|date',
            'credit_code' => 'nullable|string|max:255',
            'business_scope' => 'nullable|string',
            'company_introduction' => 'nullable|string',
            'longitude' => 'nullable|numeric',
            'dimension' => 'nullable|numeric',
            'geographic_range' => 'nullable|string',
            'acreage' => 'nullable|numeric',
            'supervise_name' => 'nullable|string|max:255',
            'supervise_tel' => 'nullable|string|max:255',
            'supervise_fix' => 'nullable|string|max:255',
            'supervise_email' => 'nullable|email|max:255',
            'supervise_position' => 'nullable|string|max:255',
            'status' => 'nullable|integer|in:0,1,2',
            'is_produce' => 'nullable|integer|in:0,1',
            'is_bloc' => 'nullable|integer|in:0,1',
            'inherent_risk' => 'nullable|numeric',
            'inherent_risk_grade' => 'nullable|string|max:255',
            'float_risk' => 'nullable|numeric',
            'float_risk_grade' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '不能为空',
            'title.string' => '必须是字符串',
            'title.max' => '不能超过255个字符',
            'credit_code.max' => '不能超过255个字符',
            'supervise_name.max' => '不能超过255个字符',
            'supervise_tel.max' => '不能超过255个字符',
            'supervise_fix.max' => '不能超过255个字符',
            'supervise_email.max' => '不能超过255个字符',
            'supervise_position.max' => '不能超过255个字符',
            'inherent_risk_grade.max' => '不能超过255个字符',
            'float_risk_grade.max' => '不能超过255个字符',
        ];
    }
}
