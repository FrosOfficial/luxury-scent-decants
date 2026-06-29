<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add admin_id to products table
        Schema::table('products', function (Blueprint $table) {
            $table->uuid('admin_id')->nullable()->after('is_active');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('set null');
        });

        // Add admin_id to chat_messages table
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->uuid('admin_id')->nullable()->after('sender');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn('admin_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn('admin_id');
        });
    }
};
