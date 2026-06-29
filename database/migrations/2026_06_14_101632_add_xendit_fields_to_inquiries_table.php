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
            $table->string('payment_status')->default('pending')->after('payment_method');
            $table->string('xendit_invoice_id')->nullable()->after('payment_status');
            $table->text('xendit_invoice_url')->nullable()->after('xendit_invoice_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'xendit_invoice_id', 'xendit_invoice_url']);
        });
    }
};
