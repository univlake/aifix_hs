<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFireControlRoomPersonnelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'cert_title' => 'nullable|string|max:255',
            'cert_number' => 'nullable|string|max:255',
            'valid_period' => 'nullable|date',
        ];
    }
}
