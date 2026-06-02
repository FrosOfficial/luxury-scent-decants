<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Product accords — the main scent character profiles (e.g., Woody 100%, Sweet 87%).
     */
    public function up(): void
    {
        Schema::create('product_accords', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('name', 100)->comment('e.g. Woody, Sweet, Citrus');
            $table->unsignedTinyInteger('percentage')->comment('0-100 for the bar chart visualization');
            $table->unsignedTinyInteger('sort_order')->default(0)->comment('Lower = displayed first');

            $table->index('product_id');
            $table->index(['name']); // Enables future filtering by accord
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_accords');
    }
};
