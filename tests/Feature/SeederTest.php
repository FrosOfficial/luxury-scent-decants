<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the database seeders run successfully and populate all required data.
     */
    public function test_database_seeder_runs_successfully(): void
    {
        // Run seeders
        $this->seed();

        // Assert products were seeded (there should be 78 products based on Zara Golden Decade at ID 78)
        $productCount = Product::count();
        $this->assertGreaterThan(0, $productCount, 'Products should be seeded in the database');
        $this->assertEquals(78, $productCount, 'Exactly 78 products should be seeded in the database');

        // Assert relationships exist
        $firstProduct = Product::first();
        $this->assertNotEmpty($firstProduct->volumes, 'Seeded products should have volume pricing');
        $this->assertNotEmpty($firstProduct->accords, 'Seeded products should have scent accords');
        $this->assertNotEmpty($firstProduct->notes, 'Seeded products should have scent notes');

        // Assert admin user was seeded
        $admin = User::where('role', 'admin')->first();
        $this->assertNotNull($admin, 'Admin user should be seeded in the database');
        $this->assertEquals('admin@luxuryscentdecants.com', $admin->email);
    }
}
