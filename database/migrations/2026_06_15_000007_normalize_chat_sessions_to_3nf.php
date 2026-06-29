<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            $table->uuid('guest_id')->nullable()->after('user_id');
            $table->dropColumn(['guest_name', 'guest_email']);

            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            $table->dropForeign(['guest_id']);
            $table->dropColumn('guest_id');
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
        });
    }
};
