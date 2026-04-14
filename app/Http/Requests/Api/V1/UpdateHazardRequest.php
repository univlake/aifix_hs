<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHazardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '不能为空',
            'title.string' => '必须是字符串',
            'title.max' => '不能超过255个字符',
        ];
    }
}
