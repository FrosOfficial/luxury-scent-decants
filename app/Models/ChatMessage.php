<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    use HasUuids;

    const SENDER_USER   = 'user';
    const SENDER_ADMIN  = 'admin';
    const SENDER_SYSTEM = 'system';

    protected $fillable = [
        'chat_session_id',
        'sender',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function session(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class, 'chat_session_id');
    }
}
