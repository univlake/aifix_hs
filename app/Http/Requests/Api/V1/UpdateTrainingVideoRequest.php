<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'title' => 'sometimes|nullable|string|max:255',
            'introduce' => 'sometimes|nullable|string',
            'thumb_url' => 'sometimes|nullable|string',
            'video_url' => 'sometimes|nullable|string',
            'duration' => 'sometimes|nullable|string|max:255',
            'lector' => 'sometimes|nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'title.max' => '不能超过255个字符',
            'duration.max' => '不能超过255个字符',
            'lector.max' => '不能超过255个字符',
        ];
    }
}
