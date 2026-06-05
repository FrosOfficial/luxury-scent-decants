<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'guest_name',
        'guest_email',
        'user_id',
        'is_escalated',
        'is_closed',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'is_escalated'    => 'boolean',
            'is_closed'       => 'boolean',
            'last_message_at' => 'datetime',
            'created_at'      => 'datetime',
            'updated_at'      => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at', 'asc');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function getDisplayNameAttribute(): string
    {
        return $this->guest_name ?? $this->user?->full_name ?? 'Anonymous';
    }

    public function getDisplayEmailAttribute(): string
    {
        return $this->guest_email ?? $this->user?->email ?? '';
    }
}
