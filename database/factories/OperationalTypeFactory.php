<?php

namespace Database\Factories;

use App\Models\OperationalType;
use Illuminate\Database\Eloquent\Factories\Factory;

class OperationalTypeFactory extends Factory
{
    protected $model = OperationalType::class;

    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['生产', '经营', '仓储', '运输', '使用']),
        ];
    }
}
