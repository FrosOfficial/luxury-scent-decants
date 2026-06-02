<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inquiry extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'reference_code',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_address',
        'city',
        'province',
        'facebook_profile',
        'additional_notes',
        'status',
        'total_estimated_price',
        'payment_method',
        'shipping_fee',
        'delivery_type',
        'estimated_delivery_days',
    ];

    protected function casts(): array
    {
        return [
            'total_estimated_price' => 'decimal:2',
            'shipping_fee'          => 'decimal:2',
            'created_at'            => 'datetime',
            'updated_at'            => 'datetime',
        ];
    }

    // ─── Status Helpers ───────────────────────────────────────────────────────

    public const STATUSES = ['pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled'];

    public function isPending(): bool   { return $this->status === 'pending'; }
    public function isContacted(): bool { return $this->status === 'contacted'; }
    public function isConfirmed(): bool { return $this->status === 'confirmed'; }
    public function isFulfilled(): bool { return $this->status === 'fulfilled'; }
    public function isCancelled(): bool { return $this->status === 'cancelled'; }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->whereRaw('LOWER(reference_code) LIKE ?', ['%' . strtolower($term) . '%'])
              ->orWhereRaw('LOWER(customer_name) LIKE ?', ['%' . strtolower($term) . '%'])
              ->orWhereRaw('LOWER(customer_email) LIKE ?', ['%' . strtolower($term) . '%']);
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InquiryItem::class);
    }
}
