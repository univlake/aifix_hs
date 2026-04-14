<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccidentBulletinsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
