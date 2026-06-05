<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ChatSession;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatControllerTest extends TestCase
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

    public function test_guest_can_start_chat_session(): void
    {
        $response = $this->postJson('/api/v1/chat/sessions', [
            'guest_name' => 'John Doe',
            'guest_email' => 'john@example.com',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'session' => ['id', 'guest_name', 'guest_email', 'user_id'],
            'welcome_message',
        ]);
    }

    public function test_authenticated_user_can_start_chat_session(): void
    {
        $sub = '550e8400-e29b-41d4-a716-446655440000';
        $token = $this->generateTestToken($sub, 'customer@example.com', 'Juan Customer');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/v1/chat/sessions', []);

        $response->assertStatus(201);
    }
}
