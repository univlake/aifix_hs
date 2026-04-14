<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingClassTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'title.max' => '不能超过255个字符',
        ];
    }
}
