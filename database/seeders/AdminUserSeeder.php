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
        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');

        if (!$adminEmail || !$adminPassword) {
            $this->command->warn('Skipping AdminUserSeeder: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment.');
            return;
        }
        
        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'full_name' => 'Admin User',
                'role' => 'admin',
                'password' => Hash::make($adminPassword),
                'supabase_auth_id' => (string) Str::uuid(), // Pre-generate a UUID for admin local sync compatibility
            ]
        );
    }
}
