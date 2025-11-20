<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful login with valid credentials.
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
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
    }

    /**
     * Test login fails with invalid email.
     */
    public function test_login_fails_with_invalid_email(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrong@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test login fails with invalid password.
     */
    public function test_login_fails_with_invalid_password(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test login validation - email required.
     */
    public function test_login_requires_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test login validation - password required.
     */
    public function test_login_requires_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test login validation - email must be valid format.
     */
    public function test_login_requires_valid_email_format(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'invalid-email',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test that API token is generated on successful login.
     */
    public function test_api_token_is_generated_on_login(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $token = $response->json('data.token');
        $this->assertNotNull($token);
        $this->assertIsString($token);
    }

    /**
     * Test business user can login.
     */
    public function test_business_user_can_login(): void
    {
        $user = $this->createBusinessUser([
            'email' => 'business@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'business@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'user_type' => 'business',
                    ],
                ],
            ]);
    }

    /**
     * Test admin user can login.
     */
    public function test_admin_user_can_login(): void
    {
        $user = $this->createAdminUser([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'user_type' => 'admin',
                    ],
                ],
            ]);
    }

    /**
     * Test that user can logout successfully.
     */
    public function test_user_can_logout(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAsUser($user)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful',
            ]);
    }

    /**
     * Test that logout requires authentication.
     */
    public function test_logout_requires_authentication(): void
    {
        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(401);
    }

    /**
     * Test that user can logout from all devices.
     */
    public function test_user_can_logout_from_all_devices(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Create multiple tokens (simulating multiple devices)
        $user->createToken('device1');
        $user->createToken('device2');
        $user->createToken('device3');

        $this->assertCount(3, $user->tokens);

        $response = $this->actingAsUser($user)
            ->postJson('/api/auth/logout-all');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out from all devices successfully',
            ]);
    }

    /**
     * Test that authenticated user can view their profile.
     */
    public function test_authenticated_user_can_view_profile(): void
    {
        $user = $this->createUser([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'email' => 'john@example.com',
                ],
            ]);
    }

    /**
     * Test that unauthenticated user cannot view profile.
     */
    public function test_unauthenticated_user_cannot_view_profile(): void
    {
        $response = $this->getJson('/api/auth/profile');

        $response->assertStatus(401);
    }

    /**
     * Test user can update their profile.
     */
    public function test_user_can_update_profile(): void
    {
        $user = $this->createUser([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ]);

        $response = $this->actingAsUser($user)
            ->putJson('/api/auth/profile', [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'phone' => '1234567890',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'first_name' => 'Jane',
                    'last_name' => 'Smith',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);
    }

    /**
     * Test user can change password.
     */
    public function test_user_can_change_password(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => 'OldPassword123',
        ]);

        $response = $this->actingAsUser($user)
            ->postJson('/api/auth/change-password', [
                'current_password' => 'OldPassword123',
                'new_password' => 'NewPassword123',
                'new_password_confirmation' => 'NewPassword123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);

        // Verify new password works
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'NewPassword123',
        ]);

        $loginResponse->assertStatus(200);
    }

    /**
     * Test password change fails with incorrect current password.
     */
    public function test_password_change_fails_with_incorrect_current_password(): void
    {
        $user = $this->createUser([
            'email' => 'test@example.com',
            'password' => 'OldPassword123',
        ]);

        $response = $this->actingAsUser($user)
            ->postJson('/api/auth/change-password', [
                'current_password' => 'WrongPassword123',
                'new_password' => 'NewPassword123',
                'new_password_confirmation' => 'NewPassword123',
            ]);

        $response->assertStatus(422);
    }
}
