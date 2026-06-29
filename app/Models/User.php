<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'supabase_auth_id',
        'first_name',
        'last_name',
        'middle_initial',
        'email',
        'password',
        'phone',
        'delivery_address',
        'city',
        'province',
        'facebook_profile',
        'current_session_id',
        'last_active_at',
        'verification_code',
        'verification_expires_at',
        'email_verified_at',
    ];

    protected $appends = [
        'full_name',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function getFullNameAttribute(): ?string
    {
        $mi = $this->middle_initial ? ' ' . $this->middle_initial . '.' : '';
        return "{$this->first_name}{$mi} {$this->last_name}";
    }

    public function getRoleAttribute(): string
    {
        return $this->isAdmin() ? 'admin' : 'customer';
    }

    public function isAdmin(): bool
    {
        return \App\Models\Admin::where('email', $this->email)->exists();
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }
}
