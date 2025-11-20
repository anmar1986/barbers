<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Set up the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Run migrations for testing
        $this->artisan('migrate');
    }

    /**
     * Create a user for testing.
     *
     * @param array $attributes
     * @return \App\Models\User
     */
    protected function createUser(array $attributes = []): \App\Models\User
    {
        return \App\Models\User::factory()->create($attributes);
    }

    /**
     * Create a business user for testing.
     *
     * @param array $attributes
     * @return \App\Models\User
     */
    protected function createBusinessUser(array $attributes = []): \App\Models\User
    {
        return \App\Models\User::factory()->create(array_merge([
            'user_type' => 'business',
        ], $attributes));
    }

    /**
     * Create an admin user for testing.
     *
     * @param array $attributes
     * @return \App\Models\User
     */
    protected function createAdminUser(array $attributes = []): \App\Models\User
    {
        return \App\Models\User::factory()->create(array_merge([
            'user_type' => 'admin',
        ], $attributes));
    }

    /**
     * Act as the given user with authentication token.
     *
     * @param \App\Models\User $user
     * @return $this
     */
    protected function actingAsUser(\App\Models\User $user): static
    {
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        return $this;
    }

    /**
     * Assert JSON structure matches expected structure.
     *
     * @param array $expected
     * @param array $actual
     * @return void
     */
    protected function assertJsonStructureMatches(array $expected, array $actual): void
    {
        foreach ($expected as $key) {
            $this->assertArrayHasKey($key, $actual, "Expected key '{$key}' not found in response");
        }
    }
}
