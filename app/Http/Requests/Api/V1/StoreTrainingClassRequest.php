<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'introduce' => 'nullable|string',
            'thumb_url' => 'nullable|string',
            'grade' => 'nullable|string|max:255',
            'class_hours' => 'nullable|integer',
            'training_class_type_id' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'title.max' => '不能超过255个字符',
            'grade.max' => '不能超过255个字符',
        ];
    }
}
