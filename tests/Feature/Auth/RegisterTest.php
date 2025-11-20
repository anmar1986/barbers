<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful user registration.
     */
    public function test_user_can_register_successfully(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'phone' => '1234567890',
            'date_of_birth' => '1990-01-01',
            'user_type' => 'normal',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User registered successfully',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'user_type',
                    ],
                    'token',
                ],
            ]);

        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'user_type' => 'normal',
        ]);
    }

    /**
     * Test business user registration.
     */
    public function test_business_user_can_register(): void
    {
        $userData = [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@barbershop.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'phone' => '9876543210',
            'date_of_birth' => '1985-05-15',
            'user_type' => 'business',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane.smith@barbershop.com',
            'user_type' => 'business',
        ]);
    }

    /**
     * Test registration validation - email required.
     */
    public function test_registration_requires_email(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration validation - email must be unique.
     */
    public function test_registration_requires_unique_email(): void
    {
        // Create existing user
        $existingUser = $this->createUser(['email' => 'existing@example.com']);

        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'existing@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration validation - email must be valid format.
     */
    public function test_registration_requires_valid_email(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'invalid-email',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration validation - password required.
     */
    public function test_registration_requires_password(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test registration validation - password must be confirmed.
     */
    public function test_registration_requires_password_confirmation(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'DifferentPass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test registration validation - password must be at least 8 characters.
     */
    public function test_registration_password_minimum_length(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test registration validation - first name required.
     */
    public function test_registration_requires_first_name(): void
    {
        $userData = [
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name']);
    }

    /**
     * Test registration validation - last name required.
     */
    public function test_registration_requires_last_name(): void
    {
        $userData = [
            'first_name' => 'John',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['last_name']);
    }

    /**
     * Test that password is hashed in database.
     */
    public function test_password_is_hashed_in_database(): void
    {
        $password = 'SecurePass123!';
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $this->postJson('/api/auth/register', $userData);

        $user = User::where('email', 'john@example.com')->first();

        $this->assertNotNull($user);
        $this->assertNotEquals($password, $user->password);
        $this->assertTrue(\Hash::check($password, $user->password));
    }

    /**
     * Test that API token is generated upon registration.
     */
    public function test_api_token_is_generated_on_registration(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201);

        $token = $response->json('data.token');
        $this->assertNotNull($token);
        $this->assertIsString($token);
    }
}
