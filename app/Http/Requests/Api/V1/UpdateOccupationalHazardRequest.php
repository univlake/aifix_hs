<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOccupationalHazardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|nullable|in:粉尘类,放射性物质类,化学物质类,噪音,其他',
            'number' => 'sometimes|nullable|integer',
            'is_declare' => 'sometimes|nullable|in:已申报,未申报',
            'declare_date' => 'sometimes|nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'type.in' => '职业危害因素类型无效',
            'is_declare.in' => '申报状态必须是已申报或未申报',
        ];
    }
}
