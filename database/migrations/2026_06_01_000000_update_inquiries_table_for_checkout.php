<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('additional_notes');
            $table->decimal('shipping_fee', 12, 2)->default(0)->after('payment_method');
            $table->string('delivery_type')->nullable()->after('shipping_fee');
            $table->string('estimated_delivery_days')->nullable()->after('delivery_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'shipping_fee', 'delivery_type', 'estimated_delivery_days']);
        });
    }
};
