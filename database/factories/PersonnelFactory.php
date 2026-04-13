<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Personnel;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonnelFactory extends Factory
{
    protected $model = Personnel::class;

    public function definition(): array
    {
        return [
            'total_people' => fake()->numberBetween(10, 500),
            'staff' => fake()->numberBetween(5, 200),
            'service' => fake()->numberBetween(0, 50),
            'manager' => fake()->numberBetween(1, 30),
            'high_school_diploma' => fake()->numberBetween(0, 100),
            'security_officer' => fake()->numberBetween(0, 10),
            'safety_engineer' => fake()->numberBetween(0, 20),
            'safety_engineering_major' => fake()->numberBetween(0, 15),
            'fire_engineer' => fake()->numberBetween(0, 10),
            'other' => fake()->numberBetween(0, 30),
            'company_id' => Company::factory(),
            'user_id' => 0,
            'last_user_id' => 0,
        ];
    }
}
