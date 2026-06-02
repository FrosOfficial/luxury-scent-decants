<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Custom users table linked to Supabase Auth via supabase_auth_id.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supabase_auth_id')->unique()->nullable()->comment('Maps to auth.users.id in Supabase');
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone', 30)->nullable();
            $table->string('delivery_address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('facebook_profile')->nullable()->comment('Facebook name or profile URL for Messenger matching');
            $table->enum('role', ['customer', 'admin'])->default('customer');
            $table->string('password')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

