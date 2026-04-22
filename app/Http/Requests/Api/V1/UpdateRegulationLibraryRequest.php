<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegulationLibraryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'regulation_library_type_id' => 'sometimes|nullable|integer',
            'established_date' => 'sometimes|nullable|date',
            'effective_date' => 'sometimes|nullable|date',
            'promulgating_department' => 'sometimes|nullable|string|max:255',
            'standard_encoding' => 'sometimes|nullable|string|max:255',
            'identify_date' => 'sometimes|nullable|date',
            'status' => 'sometimes|nullable|string|max:50',
            'annex_url' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'title.string' => '必须是字符串',
        ];
    }
}
