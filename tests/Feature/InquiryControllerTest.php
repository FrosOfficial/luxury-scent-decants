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
            'customer_first_name'     => 'Juan',
            'customer_last_name'      => 'Dela Cruz',
            'customer_middle_initial' => '',
            'customer_email'          => 'juan@example.com',
            'customer_phone'          => '+63 917 123 4567',
            'delivery_address'        => '123 Main St',
            'city'                    => 'Makati City',
            'province'                => 'Metro Manila',
            'additional_notes'        => 'Ship fast please!',
            'payment_method'          => 'cod',
            'shipping_fee'            => 100,
            'delivery_type'           => 'standard',
            'estimated_delivery_days' => '3-5 days',
            'items'                   => [
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
            'inquiry'
        ]);

        $response->assertJsonFragment([
            'customer_name' => 'Juan Dela Cruz',
            'total_estimated_price' => "2680.00",
        ]);

        // Assert that guest details were stored in guests table
        $this->assertDatabaseHas('guests', [
            'first_name'  => 'Juan',
            'last_name'   => 'Dela Cruz',
            'guest_email' => 'juan@example.com',
            'guest_phone' => '+63 917 123 4567',
        ]);

        $guest = \App\Models\Guest::where('guest_email', 'juan@example.com')->first();

        // Assert that inquiry was stored in DB and links to guest
        $this->assertDatabaseHas('inquiries', [
            'guest_id' => $guest->id,
            'user_id'  => null,
        ]);

        // Assert shipment is created
        $this->assertDatabaseHas('shipments', [
            'recipient_first_name' => 'Juan',
            'recipient_last_name'  => 'Dela Cruz',
            'recipient_email'      => 'juan@example.com',
            'recipient_phone'      => '+63 917 123 4567',
            'delivery_address'     => '123 Main St',
        ]);

        // Assert payment is created
        $this->assertDatabaseHas('payments', [
            'method' => 'cod',
            'status' => 'pending',
        ]);

        // Assert receipt is created
        $this->assertDatabaseHas('receipts', [
            'subtotal'     => 2680.00,
            'shipping_fee' => 100.00,
            'total_amount' => 2780.00,
        ]);

        // Assert items snapshot
        $this->assertDatabaseHas('inquiry_items', [
            'product_name'  => 'Aventus',
            'product_brand' => 'Creed',
            'volume_size'   => '5ml',
            'unit_price'    => 1340,
            'quantity'      => 2,
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
            'customer_first_name'     => 'Juan',
            'customer_last_name'      => 'Customer',
            'customer_middle_initial' => '',
            'customer_email'          => 'customer@example.com',
            'customer_phone'          => '+63 917 123 4567',
            'delivery_address'        => '456 Oak St',
            'city'                    => 'Quezon City',
            'province'                => 'Metro Manila',
            'payment_method'          => 'gcash',
            'shipping_fee'            => 150,
            'delivery_type'           => 'express',
            'estimated_delivery_days' => '1-2 days',
            'items'                   => [
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

        // Check if user was synced/created with split names
        $this->assertDatabaseHas('users', [
            'supabase_auth_id' => $sub,
            'email'            => 'customer@example.com',
            'first_name'       => 'Juan',
            'last_name'        => 'Customer',
        ]);

        $user = User::where('supabase_auth_id', $sub)->first();

        // Check if inquiry points to this user
        $this->assertDatabaseHas('inquiries', [
            'user_id'  => $user->id,
            'guest_id' => null,
        ]);
    }

    /**
     * Test that guest inquiries are blocked when containing bad words or troll emails.
     */
    public function test_guest_inquiry_censorship_blocks_profanity(): void
    {
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

        $badData = [
            'customer_first_name'     => 'Troll',
            'customer_last_name'      => 'User',
            'customer_middle_initial' => '',
            'customer_email'          => 'normal@example.com',
            'customer_phone'          => '+63 917 123 4567',
            'delivery_address'        => '123 Main St',
            'city'                    => 'Makati City',
            'province'                => 'Metro Manila',
            'payment_method'          => 'cod',
            'shipping_fee'            => 100,
            'delivery_type'           => 'standard',
            'estimated_delivery_days' => '3-5 days',
            'items'                   => [
                [
                    'product_id'        => $product->id,
                    'volume_pricing_id' => $volume->id,
                    'quantity'          => 1,
                ]
            ]
        ];

        // 1. Block bad name (troll is a bad word in names)
        $response = $this->postJson('/api/v1/inquiries', $badData);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_first_name']);

        // 2. Block bad email domain
        $badData['customer_first_name'] = 'Good';
        $badData['customer_last_name'] = 'User';
        $badData['customer_email'] = 'test@mailinator.com';
        $response = $this->postJson('/api/v1/inquiries', $badData);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_email']);

        // 3. Block bad notes
        $badData['customer_email'] = 'good@example.com';
        $badData['additional_notes'] = 'This is putangina notes';
        $response = $this->postJson('/api/v1/inquiries', $badData);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['additional_notes']);
    }
}
