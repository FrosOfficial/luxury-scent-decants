<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Inquiry;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    protected string $jwtSecret = 'test_supabase_jwt_secret_key_123_456_789';
    protected string $adminEmail = 'admin@luxuryscentdecants.com';
    protected string $customerEmail = 'customer@example.com';

    protected function setUp(): void
    {
        parent::setUp();
        config(['supabase.jwt_secret' => $this->jwtSecret]);
        config(['supabase.admin_email' => $this->adminEmail]);
        putenv("SUPABASE_JWT_SECRET={$this->jwtSecret}");
    }

    /**
     * Helper to generate a valid test JWT.
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
     * Test guest cannot access admin endpoints.
     */
    public function test_guest_is_unauthorized_for_admin_endpoints(): void
    {
        $response = $this->getJson('/api/v1/admin/stats');
        $response->assertStatus(401);
    }

    /**
     * Test regular customer cannot access admin endpoints.
     */
    public function test_customer_is_forbidden_from_admin_endpoints(): void
    {
        $token = $this->generateTestToken('cust-uuid-123', $this->customerEmail, 'Test Customer');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->getJson('/api/v1/admin/stats');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'Forbidden. Admin access required.'
        ]);
    }

    /**
     * Test admin can access stats endpoint.
     */
    public function test_admin_can_access_stats(): void
    {
        $token = $this->generateTestToken('admin-uuid-123', $this->adminEmail, 'Admin User');

        // Create some seed data
        Product::create([
            'name' => 'Fragrance X',
            'brand' => 'Brand X',
            'scent_profile' => 'Woody',
            'demographic' => 'Unisex',
            'is_active' => true,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->getJson('/api/v1/admin/stats');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'metrics' => [
                'total_inquiries',
                'status_counts',
                'total_estimated_revenue',
                'products' => [
                    'total',
                    'active',
                    'inactive',
                ]
            ],
            'popular_brands',
            'recent_inquiries',
        ]);

        $response->assertJsonPath('metrics.products.total', 1);
        $response->assertJsonPath('metrics.products.active', 1);
    }

    /**
     * Test admin can toggle product active status.
     */
    public function test_admin_can_toggle_product_status(): void
    {
        $token = $this->generateTestToken('admin-uuid-123', $this->adminEmail, 'Admin User');

        $product = Product::create([
            'name' => 'Fragrance to Toggle',
            'brand' => 'Brand Y',
            'scent_profile' => 'Citrus',
            'demographic' => 'Masculine',
            'is_active' => true,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->patchJson("/api/v1/admin/products/{$product->id}/toggle");

        $response->assertStatus(200);
        $response->assertJsonPath('is_active', false);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test admin can create a new product.
     */
    public function test_admin_can_create_product(): void
    {
        $token = $this->generateTestToken('admin-uuid-123', $this->adminEmail, 'Admin User');

        $productData = [
            'name' => 'New Premium Fragrance',
            'brand' => 'Scent Master',
            'scent_profile' => 'Floral',
            'demographic' => 'Feminine',
            'performance' => [
                'longevity' => 'Long Lasting',
                'sillage' => 'Strong',
            ],
            'usage' => [
                'day' => false,
                'night' => true,
                'seasons' => [
                    'spring' => false,
                    'summer' => false,
                    'autumn' => true,
                    'winter' => true,
                ]
            ]
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/v1/admin/products', $productData);

        $response->assertStatus(201);
        $response->assertJsonFragment(['name' => 'New Premium Fragrance']);

        $this->assertDatabaseHas('products', [
            'name' => 'New Premium Fragrance',
            'brand' => 'Scent Master',
        ]);
    }
}
