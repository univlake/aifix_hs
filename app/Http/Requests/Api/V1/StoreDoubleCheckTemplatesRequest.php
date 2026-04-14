<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoubleCheckTemplatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'level' => 'nullable|integer',
            'sort' => 'nullable|integer',
            'pid' => 'nullable|integer',
            'year' => 'required|integer',
            'score_range' => 'nullable|string',
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
