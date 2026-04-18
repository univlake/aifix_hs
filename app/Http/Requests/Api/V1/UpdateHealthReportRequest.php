<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHealthReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'find_date' => 'sometimes|nullable|date',
            'name' => 'sometimes|required|string|max:255',
            'post' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|nullable|in:职业性尘肺病及其他呼吸系统疾病,职业性皮肤病,职业性眼病,职业性耳鼻喉口腔疾病,职业性化学中毒,物理因素所致职业病,职业性放射性疾病,职业性传染病,职业性肿瘤,其他职业病',
            'is_true' => 'sometimes|nullable|integer',
            'mechanism' => 'sometimes|nullable|string|max:255',
            'identify_date' => 'sometimes|nullable|date',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'post.max' => '不能超过255个字符',
            'type.max' => '不能超过255个字符',
            'mechanism.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
