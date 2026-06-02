<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Products table — core product catalog.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('brand');
            $table->string('scent_profile');
            $table->enum('demographic', ['Masculine', 'Feminine', 'Unisex']);
            $table->string('image_url')->nullable();
            $table->jsonb('performance')->nullable()->comment('{ longevity: string, sillage: string }');
            $table->jsonb('usage')->nullable()->comment('{ day: bool, night: bool, seasons: { spring, summer, autumn, winter } }');
            $table->decimal('rating', 3, 1)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['brand', 'is_active']);
            $table->index(['scent_profile', 'is_active']);
            $table->index(['demographic', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
