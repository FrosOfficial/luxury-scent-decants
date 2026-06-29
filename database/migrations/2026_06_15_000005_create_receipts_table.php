<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('inquiry_id')->unique();
            $table->string('receipt_number')->unique();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_fee', 10, 2);
            $table->decimal('total_amount', 12, 2);
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();

            $table->foreign('inquiry_id')->references('id')->on('inquiries')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
