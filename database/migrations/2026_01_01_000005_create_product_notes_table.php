<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Product notes — the scent pyramid (top, middle, base notes).
     */
    public function up(): void
    {
        Schema::create('product_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('layer', ['top', 'middle', 'base'])->comment('Which part of the scent pyramid');
            $table->string('note_name', 100)->comment('e.g. Bergamot, Jasmine, Cedar');
            $table->unsignedTinyInteger('sort_order')->default(0);

            $table->index(['product_id', 'layer']);
            $table->index('note_name'); // Enables future filtering by ingredient
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_notes');
    }
};
