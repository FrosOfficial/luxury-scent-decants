<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Admin;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSessionLockTest extends TestCase
{
    use RefreshDatabase;

    protected string $jwtSecret = 'test_supabase_jwt_secret_key_123_456_789';
    protected string $adminEmail = 'admin@luxuryscentdecants.com';

    protected function setUp(): void
    {
        parent::setUp();
        config(['supabase.jwt_secret' => $this->jwtSecret]);
        config(['supabase.admin_email' => $this->adminEmail]);
        putenv("SUPABASE_JWT_SECRET={$this->jwtSecret}");
    }

    /**
     * Helper to generate a valid test JWT with optional sid (session ID).
     */
    protected function generateTestToken(string $sub, string $email, ?string $sid = null): string
    {
        $payload = [
            'sub'   => $sub,
            'email' => $email,
            'role'  => 'authenticated',
            'user_metadata' => [
                'full_name' => 'Admin User',
            ],
            'iat'   => time(),
            'exp'   => time() + 3600,
        ];

        if ($sid) {
            $payload['sid'] = $sid;
        }

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }

    /**
     * Test admin first request registers their session in database.
     */
    public function test_admin_first_login_registers_session(): void
    {
        $admin = User::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
        ]);

        Admin::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'supabase_auth_id' => $admin->supabase_auth_id,
        ]);

        $token = $this->generateTestToken($admin->id, $this->adminEmail, 'session-A');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->getJson('/api/v1/me');

        $response->assertStatus(200);

        // Verify session was registered in database
        $admin->refresh();
        $this->assertEquals('session-A', $admin->current_session_id);
        $this->assertNotEmpty($admin->last_active_at);
    }

    /**
     * Test admin concurrent request from a different device/session is blocked.
     */
    public function test_admin_concurrent_login_is_blocked(): void
    {
        $admin = User::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
        ]);

        Admin::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'supabase_auth_id' => $admin->supabase_auth_id,
        ]);

        // Device A logs in with session-A
        $tokenA = $this->generateTestToken($admin->id, $this->adminEmail, 'session-A');
        $this->withHeaders(['Authorization' => "Bearer {$tokenA}"])->getJson('/api/v1/me')->assertStatus(200);

        // Device B tries to log in/access with session-B
        $tokenB = $this->generateTestToken($admin->id, $this->adminEmail, 'session-B');
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$tokenB}"
        ])->getJson('/api/v1/me');

        $response->assertStatus(409);
        $response->assertJson([
            'message' => 'This account is being used by another admin.'
        ]);
    }

    /**
     * Test admin inactive/expired session allows takeover.
     */
    public function test_admin_expired_session_is_taken_over(): void
    {
        $admin = User::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
        ]);

        Admin::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'supabase_auth_id' => $admin->supabase_auth_id,
        ]);

        // Device A logs in with session-A
        $tokenA = $this->generateTestToken($admin->id, $this->adminEmail, 'session-A');
        $this->withHeaders(['Authorization' => "Bearer {$tokenA}"])->getJson('/api/v1/me')->assertStatus(200);

        // Artificially age the session to be 11 minutes old (660 seconds ago)
        $admin->update([
            'current_session_id' => 'session-A',
            'last_active_at' => time() - 660
        ]);

        // Device B tries to access with session-B and should succeed/take over
        $tokenB = $this->generateTestToken($admin->id, $this->adminEmail, 'session-B');
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$tokenB}"
        ])->getJson('/api/v1/me');

        $response->assertStatus(200);
        
        $admin->refresh();
        $this->assertEquals('session-B', $admin->current_session_id);
    }

    /**
     * Test admin logout endpoint clears the session cache lock.
     */
    public function test_admin_logout_clears_session_lock(): void
    {
        $admin = User::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
        ]);

        Admin::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'supabase_auth_id' => $admin->supabase_auth_id,
        ]);

        // Device A logs in with session-A
        $tokenA = $this->generateTestToken($admin->id, $this->adminEmail, 'session-A');
        $this->withHeaders(['Authorization' => "Bearer {$tokenA}"])->getJson('/api/v1/me')->assertStatus(200);

        // Device A logs out explicitly
        $this->withHeaders([
            'Authorization' => "Bearer {$tokenA}"
        ])->postJson('/api/v1/me/logout')->assertStatus(200);

        // Verify session was cleared from database
        $admin->refresh();
        $this->assertNull($admin->current_session_id);
        $this->assertNull($admin->last_active_at);

        // Device B should be able to log in/access immediately
        $tokenB = $this->generateTestToken($admin->id, $this->adminEmail, 'session-B');
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$tokenB}"
        ])->getJson('/api/v1/me');

        $response->assertStatus(200);
        
        $admin->refresh();
        $this->assertEquals('session-B', $admin->current_session_id);
    }

    /**
     * Test admin login endpoint blocks concurrent attempts if session is active.
     */
    public function test_admin_login_endpoint_blocks_concurrent_attempts(): void
    {
        $admin = User::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'current_session_id' => 'session-A',
            'last_active_at' => time(),
        ]);

        Admin::create([
            'email' => $this->adminEmail,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'supabase_auth_id' => $admin->supabase_auth_id,
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->adminEmail,
            'password' => 'password123',
        ]);

        $response->assertStatus(409);
        $response->assertJson([
            'message' => 'This account is being used by another admin.'
        ]);
    }
}
