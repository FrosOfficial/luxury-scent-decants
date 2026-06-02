<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inquiry items — individual product line items within an inquiry.
     * Contains price/product snapshots so historical records stay accurate.
     */
    public function up(): void
    {
        Schema::create('inquiry_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inquiry_id')->constrained('inquiries')->cascadeOnDelete();

            // Soft FK — product may be deleted later, but we keep the snapshot
            $table->foreignUuid('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignUuid('volume_pricing_id')->nullable()->constrained('volume_pricing')->nullOnDelete();

            // Snapshot fields — captured at time of inquiry submission
            $table->string('product_name')->comment('Snapshot of product name at inquiry time');
            $table->string('product_brand')->comment('Snapshot of brand at inquiry time');
            $table->string('volume_size', 10)->comment('Snapshot of volume size e.g. 5ml');
            $table->decimal('unit_price', 10, 2)->comment('Snapshot of price at inquiry time in PHP');
            $table->unsignedSmallInteger('quantity')->default(1);

            $table->index('inquiry_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiry_items');
    }
};
