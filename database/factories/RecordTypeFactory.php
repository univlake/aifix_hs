<?php

namespace Database\Factories;

use App\Models\RecordType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecordTypeFactory extends Factory
{
    protected $model = RecordType::class;

    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['安全生产许可证', '危险化学品经营许可证', '特种设备使用登记证', '消防验收意见书', '环保审批文件']),
        ];
    }
}
