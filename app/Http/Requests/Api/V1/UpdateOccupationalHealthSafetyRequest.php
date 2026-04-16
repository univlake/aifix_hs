<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOccupationalHealthSafetyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'certification_body' => 'nullable|string|max:255',
            'standard_edition' => 'nullable|string|max:255',
            'get_time' => 'nullable|date',
            'valid_period' => 'nullable|date',
            'annex_url' => 'nullable|string',
        ];
    }
}
