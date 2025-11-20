<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user.
     *
     * @param array $data
     * @return array
     */
    public function register(array $data): array
    {
        $user = User::create([
            'user_type' => $data['user_type'] ?? 'normal',
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'password' => $data['password'], // Will be hashed automatically
        ]);

        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Login a user.
     *
     * @param array $credentials
     * @return array
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Revoke old tokens (optional - comment out if you want multiple device login)
        // $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout the user (revoke current token).
     *
     * @param User $user
     * @return bool
     */
    public function logout(User $user): bool
    {
        // Revoke current token
        $user->currentAccessToken()->delete();

        return true;
    }

    /**
     * Logout from all devices (revoke all tokens).
     *
     * @param User $user
     * @return bool
     */
    public function logoutAll(User $user): bool
    {
        // Revoke all tokens
        $user->tokens()->delete();

        return true;
    }

    /**
     * Get authenticated user profile.
     *
     * @param User $user
     * @return User
     */
    public function getProfile(User $user): User
    {
        return $user->fresh();
    }

    /**
     * Update user profile.
     *
     * @param User $user
     * @param array $data
     * @return User
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    /**
     * Change user password.
     *
     * @param User $user
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool
     * @throws ValidationException
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => $newPassword]);

        return true;
    }
}
