<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoubleCheckTemplatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string',
            'level' => 'sometimes|nullable|integer',
            'sort' => 'sometimes|nullable|integer',
            'pid' => 'sometimes|nullable|integer',
            'year' => 'sometimes|required|integer',
            'score_range' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '不能为空',
            'title.string' => '必须是字符串',
            'year.required' => '不能为空',
            'year.integer' => '必须是整数',
        ];
    }
}
