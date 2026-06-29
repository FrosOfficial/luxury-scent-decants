<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_initial',
        'guest_email',
        'guest_phone',
    ];

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }
}
