<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\VolumePricing;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InquiryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected string $jwtSecret = 'test_supabase_jwt_secret_key_123_456_789';

    protected function setUp(): void
    {
        parent::setUp();
        // Set env variable for testing JWT secret
        config(['supabase.jwt_secret' => $this->jwtSecret]);
        putenv("SUPABASE_JWT_SECRET={$this->jwtSecret}");
    }

    /**
     * Helper to generate a valid test Supabase JWT.
     */
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

    /**
     * Test submitting a guest inquiry (without token).
     */
    public function test_guest_can_submit_inquiry(): void
    {
        // Set Facebook Page ID
        putenv('FACEBOOK_PAGE_ID=LuxuryScentDecants');

        $product = Product::create([
            'name' => 'Aventus',
            'brand' => 'Creed',
            'scent_profile' => 'Woody',
            'demographic' => 'Masculine',
            'is_active' => true,
        ]);

        $volume = $product->volumes()->create([
            'size' => '5ml',
            'price' => 1340,
            'is_available' => true,
        ]);

        $inquiryData = [
            'customer_name'    => 'Juan Dela Cruz',
            'customer_email'   => 'juan@example.com',
            'customer_phone'   => '+63 917 123 4567',
            'delivery_address' => '123 Main St',
            'city'             => 'Makati City',
            'province'         => 'Metro Manila',
            'facebook_profile' => 'fb.com/juandelacruz',
            'additional_notes' => 'Ship fast please!',
            'items'            => [
                [
                    'product_id'        => $product->id,
                    'volume_pricing_id' => $volume->id,
                    'quantity'          => 2,
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/inquiries', $inquiryData);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'reference_code',
            'messenger_message',
            'messenger_url',
            'inquiry'
        ]);

        $response->assertJsonFragment([
            'customer_name' => 'Juan Dela Cruz',
            'total_estimated_price' => "2680.00",
        ]);

        // Assert that inquiry was stored in DB
        $this->assertDatabaseHas('inquiries', [
            'customer_name' => 'Juan Dela Cruz',
            'total_estimated_price' => 2680,
        ]);

        // Assert items snapshot
        $this->assertDatabaseHas('inquiry_items', [
            'product_name' => 'Aventus',
            'product_brand' => 'Creed',
            'volume_size'  => '5ml',
            'unit_price'   => 1340,
            'quantity'     => 2,
        ]);
    }

    /**
     * Test submitting an inquiry as an authenticated customer and syncing users.
     */
    public function test_authenticated_customer_can_submit_inquiry_and_syncs_user(): void
    {
        $product = Product::create([
            'name' => 'Bleu de Chanel',
            'brand' => 'Chanel',
            'scent_profile' => 'Citrus',
            'demographic' => 'Masculine',
            'is_active' => true,
        ]);

        $volume = $product->volumes()->create([
            'size' => '10ml',
            'price' => 882,
            'is_available' => true,
        ]);

        $sub = '550e8400-e29b-41d4-a716-446655440000';
        $token = $this->generateTestToken($sub, 'customer@example.com', 'Juan Customer');

        $inquiryData = [
            'customer_name'    => 'Juan Customer',
            'customer_email'   => 'customer@example.com',
            'customer_phone'   => '+63 917 123 4567',
            'delivery_address' => '456 Oak St',
            'city'             => 'Quezon City',
            'province'         => 'Metro Manila',
            'facebook_profile' => 'fb.com/juancustomer',
            'items'            => [
                [
                    'product_id'        => $product->id,
                    'volume_pricing_id' => $volume->id,
                    'quantity'          => 1,
                ]
            ]
        ];

        // Send post request with bearer token
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/v1/inquiries', $inquiryData);

        $response->assertStatus(201);

        // Check if user was synced/created
        $this->assertDatabaseHas('users', [
            'supabase_auth_id' => $sub,
            'email'            => 'customer@example.com',
            'full_name'        => 'Juan Customer',
            'role'             => 'customer',
        ]);

        $user = User::where('supabase_auth_id', $sub)->first();

        // Check if inquiry points to this user
        $this->assertDatabaseHas('inquiries', [
            'user_id'       => $user->id,
            'customer_name' => 'Juan Customer',
        ]);
    }
}
