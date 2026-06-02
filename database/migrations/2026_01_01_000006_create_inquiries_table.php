<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inquiries — the core order inquiry records submitted via the Messenger flow.
     */
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Link to authenticated user (nullable for resilience)
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Human-readable reference code used in Messenger m.me?ref= parameter
            $table->string('reference_code', 30)->unique()->comment('e.g. LSD-20260522-A1B2C3');

            // Customer snapshot fields (captured at time of submission even if profile changes)
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone', 30)->nullable();
            $table->string('delivery_address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('facebook_profile')->nullable();
            $table->text('additional_notes')->nullable();

            // Inquiry lifecycle
            $table->enum('status', ['pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled'])->default('pending')->index();

            // Financial summary
            $table->decimal('total_estimated_price', 12, 2)->default(0)->comment('Sum of all inquiry items in PHP');

            // Pre-built Messenger message text (stored for admin reference and re-sending)
            $table->text('messenger_message')->nullable();

            $table->timestamps();

            $table->index('user_id');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
