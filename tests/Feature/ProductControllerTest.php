<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\VolumePricing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test listing all active products.
     */
    public function test_can_list_active_products(): void
    {
        // Create an active product and an inactive product
        $active = Product::create([
            'name' => 'Active Fragrance',
            'brand' => 'Brand A',
            'scent_profile' => 'Woody',
            'demographic' => 'Unisex',
            'is_active' => true,
        ]);

        $inactive = Product::create([
            'name' => 'Inactive Fragrance',
            'brand' => 'Brand B',
            'scent_profile' => 'Floral',
            'demographic' => 'Feminine',
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Active Fragrance']);
        $response->assertJsonMissing(['name' => 'Inactive Fragrance']);
    }

    /**
     * Test single product detail.
     */
    public function test_can_view_single_product_details(): void
    {
        $product = Product::create([
            'name' => 'Details Fragrance',
            'brand' => 'Brand C',
            'scent_profile' => 'Citrus',
            'demographic' => 'Masculine',
            'is_active' => true,
        ]);

        $volume = $product->volumes()->create([
            'size' => '10ml',
            'price' => 500,
            'is_available' => true,
        ]);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('name', 'Details Fragrance');
        $response->assertJsonCount(1, 'volumes');
        $response->assertJsonFragment(['size' => '10ml', 'price' => "500.00"]);
    }
}
