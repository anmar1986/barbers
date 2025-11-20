<?php

namespace Database\Factories;

use App\Models\User;
use App\Modules\Business\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Modules\Business\Models\Business>
 */
class BusinessFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Business::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessTypes = ['barber', 'nail_studio', 'hair_salon', 'massage'];
        $businessName = fake()->company().' '.fake()->randomElement(['Barber Shop', 'Salon', 'Spa', 'Studio']);

        return [
            'uuid' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'business_name' => $businessName,
            'business_type' => fake()->randomElement($businessTypes),
            'slug' => Str::slug($businessName),
            'description' => fake()->paragraph(3),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'zip_code' => fake()->postcode(),
            'country' => 'USA',
            'latitude' => fake()->latitude(25, 50),
            'longitude' => fake()->longitude(-125, -65),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website' => fake()->url(),
            'is_verified' => fake()->boolean(30), // 30% chance of being verified
            'average_rating' => fake()->randomFloat(2, 3.0, 5.0),
            'total_reviews' => fake()->numberBetween(0, 500),
            'view_count' => fake()->numberBetween(0, 10000),
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the business is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }

    /**
     * Indicate that the business is a barber shop.
     */
    public function barber(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'barber',
        ]);
    }

    /**
     * Indicate that the business is a nail studio.
     */
    public function nailStudio(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'nail_studio',
        ]);
    }

    /**
     * Indicate that the business is a hair salon.
     */
    public function hairSalon(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'hair_salon',
        ]);
    }

    /**
     * Indicate that the business is a massage center.
     */
    public function massage(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'massage',
        ]);
    }

    /**
     * Indicate that the business is pending approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'is_verified' => false,
        ]);
    }

    /**
     * Indicate that the business is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }
}
