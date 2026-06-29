<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('inquiry_id')->unique();
            $table->string('recipient_first_name');
            $table->string('recipient_last_name');
            $table->string('recipient_middle_initial')->nullable();
            $table->string('recipient_email');
            $table->string('recipient_phone');
            $table->string('delivery_address');
            $table->string('city');
            $table->string('province');
            $table->string('delivery_type');
            $table->string('estimated_delivery_days');
            $table->timestamps();

            $table->foreign('inquiry_id')->references('id')->on('inquiries')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
