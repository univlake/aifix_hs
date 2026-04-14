<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePersonnelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total_people' => 'nullable|integer|min:0',
            'staff' => 'nullable|integer|min:0',
            'service' => 'nullable|integer|min:0',
            'manager' => 'nullable|integer|min:0',
            'high_school_diploma' => 'nullable|integer|min:0',
            'security_officer' => 'nullable|integer|min:0',
            'safety_engineer' => 'nullable|integer|min:0',
            'safety_engineering_major' => 'nullable|integer|min:0',
            'fire_engineer' => 'nullable|integer|min:0',
            'other' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'total_people.min' => '不能小于0',
            'staff.min' => '不能小于0',
            'service.min' => '不能小于0',
            'manager.min' => '不能小于0',
            'high_school_diploma.min' => '不能小于0',
            'security_officer.min' => '不能小于0',
            'safety_engineer.min' => '不能小于0',
            'safety_engineering_major.min' => '不能小于0',
            'fire_engineer.min' => '不能小于0',
            'other.min' => '不能小于0',
        ];
    }
}
