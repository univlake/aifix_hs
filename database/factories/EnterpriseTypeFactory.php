<?php

namespace Database\Factories;

use App\Models\EnterpriseType;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnterpriseTypeFactory extends Factory
{
    protected $model = EnterpriseType::class;

    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['制造业', '建筑业', '化工', '矿业', '物流', '电力', '冶金']),
        ];
    }
}
