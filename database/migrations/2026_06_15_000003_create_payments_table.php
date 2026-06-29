<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('inquiry_id')->unique();
            $table->string('method');
            $table->string('status')->default('pending');
            $table->string('xendit_invoice_id')->nullable();
            $table->text('xendit_invoice_url')->nullable();
            $table->timestamps();

            $table->foreign('inquiry_id')->references('id')->on('inquiries')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
