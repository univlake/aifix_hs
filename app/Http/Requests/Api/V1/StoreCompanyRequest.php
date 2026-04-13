<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'enterprise_type_id' => 'nullable|integer|exists:enterprise_types,id',
            'operational_type_id' => 'nullable|integer|exists:operational_types,id',
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
            'pid' => 'nullable|integer',
            'is_produce' => 'nullable|integer|in:0,1',
            'is_bloc' => 'nullable|integer|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '请输入企业名称',
            'title.max' => '企业名称不能超过255个字符',
            'enterprise_type_id.exists' => '企业类型不存在',
            'operational_type_id.exists' => '经营类型不存在',
            'supervise_email.email' => '邮箱格式不正确',
        ];
    }
}
