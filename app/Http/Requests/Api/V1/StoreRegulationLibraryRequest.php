<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegulationLibraryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'regulation_library_type_id' => 'nullable|integer',
            'established_date' => 'nullable|date',
            'effective_date' => 'nullable|date',
            'promulgating_department' => 'nullable|string|max:255',
            'standard_encoding' => 'nullable|string|max:255',
            'identify_date' => 'nullable|date',
            'status' => 'nullable|string|max:50',
            'annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '不能为空',
            'title.string' => '必须是字符串',
        ];
    }
}
