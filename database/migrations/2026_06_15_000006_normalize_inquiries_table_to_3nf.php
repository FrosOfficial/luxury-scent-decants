<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Normalize inquiries table
        Schema::table('inquiries', function (Blueprint $table) {
            $table->uuid('guest_id')->nullable()->after('user_id');

            $table->dropColumn([
                'customer_name',
                'customer_email',
                'customer_phone',
                'delivery_address',
                'city',
                'province',
                'facebook_profile',
                'payment_method',
                'payment_status',
                'xendit_invoice_id',
                'xendit_invoice_url',
                'total_estimated_price',
                'shipping_fee',
                'delivery_type',
                'estimated_delivery_days',
                'messenger_message'
            ]);

            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('set null');
        });

        // Normalize users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            
            // Handle name split
            $table->string('first_name')->nullable()->after('supabase_auth_id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('middle_initial', 10)->nullable()->after('last_name');
            
            $table->dropColumn('full_name');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropForeign(['guest_id']);
            $table->dropColumn('guest_id');

            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('delivery_address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('facebook_profile')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->nullable();
            $table->string('xendit_invoice_id')->nullable();
            $table->text('xendit_invoice_url')->nullable();
            $table->decimal('total_estimated_price', 12, 2)->nullable();
            $table->decimal('shipping_fee', 10, 2)->nullable();
            $table->string('delivery_type')->nullable();
            $table->string('estimated_delivery_days')->nullable();
            $table->text('messenger_message')->nullable();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer');
            $table->string('full_name')->nullable();
            $table->dropColumn(['first_name', 'last_name', 'middle_initial']);
        });
    }
};
