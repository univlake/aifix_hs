<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'title' => fake()->company(),
            'enterprise_type_id' => null,
            'operational_type_id' => 1,
            'area_id' => null,
            'address' => fake()->address(),
            'established' => fake()->date(),
            'credit_code' => fake()->uuid(),
            'status' => 1,
            'pid' => 0,
            'is_produce' => 0,
            'is_bloc' => 0,
            'user_id' => 0,
            'last_user_id' => 0,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 2,
        ]);
    }
}
