<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|nullable|string|max:255',
            'introduce' => 'sometimes|nullable|string',
            'thumb_url' => 'sometimes|nullable|string',
            'grade' => 'sometimes|nullable|string|max:255',
            'class_hours' => 'sometimes|nullable|integer',
            'training_class_type_id' => 'sometimes|nullable|integer',
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
