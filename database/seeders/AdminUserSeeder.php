<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin user already exists
        $existingAdmin = User::where('email', 'admin@admin.com')->first();

        if ($existingAdmin) {
            $this->command->info('Admin user already exists!');
            return;
        }

        // Create admin user
        User::create([
            'uuid' => Str::uuid(),
            'user_type' => 'admin',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
            'permissions' => [
                'platform.systems.roles' => true,
                'platform.systems.users' => true,
                'platform.systems.attachment' => true,
                'platform.index' => true,
            ],
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@admin.com');
        $this->command->info('Password: password');
    }
}
