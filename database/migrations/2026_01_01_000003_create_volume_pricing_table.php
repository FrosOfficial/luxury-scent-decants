<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Volume pricing tiers per product — allows per-size availability and price management.
     */
    public function up(): void
    {
        Schema::create('volume_pricing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('size', ['2ml', '3ml', '5ml', '10ml', '15ml', '30ml']);
            $table->decimal('price', 10, 2)->comment('Price in PHP');
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // A product can only have one row per size
            $table->unique(['product_id', 'size']);
            $table->index(['product_id', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('volume_pricing');
    }
};
