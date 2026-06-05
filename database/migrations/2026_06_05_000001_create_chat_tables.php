<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_escalated')->default(false);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_session_id');
            $table->foreign('chat_session_id')->references('id')->on('chat_sessions')->cascadeOnDelete();
            $table->enum('sender', ['user', 'admin', 'system']);
            $table->text('message');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
    }
};
