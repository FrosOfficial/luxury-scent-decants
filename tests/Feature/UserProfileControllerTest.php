<?php

namespace Tests\Feature;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    protected string $jwtSecret = 'test_supabase_jwt_secret_key_123_456_789';

    protected function setUp(): void
    {
        parent::setUp();
        config(['supabase.jwt_secret' => $this->jwtSecret]);
        putenv("SUPABASE_JWT_SECRET={$this->jwtSecret}");
    }

    protected function generateTestToken(string $sub, string $email, string $fullName = 'Test User'): string
    {
        $payload = [
            'sub'   => $sub,
            'email' => $email,
            'role'  => 'authenticated',
            'user_metadata' => [
                'full_name' => $fullName,
            ],
            'iat'   => time(),
            'exp'   => time() + 3600,
        ];

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }

    public function test_user_can_view_authenticated_user_profile(): void
    {
        $user = User::create([
            'email' => 'juan@gmail.com',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
        ]);

        $token = $this->generateTestToken($user->id, $user->email, 'Juan Dela Cruz');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->getJson('/api/v1/me');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'email' => 'juan@gmail.com',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
        ]);
    }

    public function test_user_can_update_profile_with_valid_details(): void
    {
        $user = User::create([
            'email' => 'juan@gmail.com',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
        ]);

        $token = $this->generateTestToken($user->id, $user->email, 'Juan Dela Cruz');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->putJson('/api/v1/me', [
            'first_name' => 'Juan',
            'last_name' => 'Updated',
            'middle_initial' => 'D',
            'phone' => '09171234567',
            'delivery_address' => 'Unit 4B Gold Crest Condo, Barangay Bel-Air, 1209',
            'city' => 'Makati',
            'province' => 'Metro Manila',
        ]);

        $response->assertStatus(200);
        $user->refresh();
        $this->assertEquals('Juan D. Updated', $user->full_name);
        $this->assertEquals('09171234567', $user->phone);
    }

    public function test_profile_update_blocks_profanity_in_name(): void
    {
        $user = User::create([
            'email' => 'juan@gmail.com',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
        ]);

        $token = $this->generateTestToken($user->id, $user->email, 'Juan Dela Cruz');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->putJson('/api/v1/me', [
            'first_name' => 'Juan',
            'last_name' => 'Putangina',
            'phone' => '09171234567',
            'delivery_address' => 'Unit 4B Gold Crest Condo, Barangay Bel-Air, 1209',
            'city' => 'Makati',
            'province' => 'Metro Manila',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['first_name']);
    }

    public function test_profile_update_blocks_profanity_in_address(): void
    {
        $user = User::create([
            'email' => 'juan@gmail.com',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
        ]);

        $token = $this->generateTestToken($user->id, $user->email, 'Juan Dela Cruz');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->putJson('/api/v1/me', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone' => '09171234567',
            'delivery_address' => 'Unit 4B fuck Condo, Barangay Bel-Air, 1209',
            'city' => 'Makati',
            'province' => 'Metro Manila',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['delivery_address']);
    }

    public function test_registration_blocks_profanity_in_name(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Juan',
            'last_name' => 'Putangina',
            'middle_initial' => '',
            'email' => 'juan.test@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['first_name']);
    }

    public function test_registration_blocks_troll_emails(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'middle_initial' => '',
            'email' => 'troll@yopmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }
}
