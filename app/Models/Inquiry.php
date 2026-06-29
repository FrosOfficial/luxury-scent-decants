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
        'guest_id',
        'reference_code',
        'additional_notes',
        'status',
    ];

    protected $appends = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_address',
        'city',
        'province',
        'shipping_fee',
        'delivery_type',
        'estimated_delivery_days',
        'payment_method',
        'payment_status',
        'xendit_invoice_id',
        'xendit_invoice_url',
        'total_estimated_price',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ─── Status Helpers ───────────────────────────────────────────────────────

    public const STATUSES = ['pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled'];

    public function isPending(): bool   { return $this->status === 'pending'; }
    public function isContacted(): bool { return $this->status === 'contacted'; }
    public function isConfirmed(): bool { return $this->status === 'confirmed'; }
    public function isFulfilled(): bool { return $this->status === 'fulfilled'; }
    public function isCancelled(): bool { return $this->status === 'cancelled'; }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getCustomerNameAttribute(): ?string
    {
        $shipment = $this->shipment;
        if (!$shipment) return null;
        $mi = $shipment->recipient_middle_initial ? ' ' . $shipment->recipient_middle_initial . '.' : '';
        return "{$shipment->recipient_first_name}{$mi} {$shipment->recipient_last_name}";
    }

    public function getCustomerEmailAttribute(): ?string
    {
        return $this->shipment->recipient_email ?? null;
    }

    public function getCustomerPhoneAttribute(): ?string
    {
        return $this->shipment->recipient_phone ?? null;
    }

    public function getDeliveryAddressAttribute(): ?string
    {
        return $this->shipment->delivery_address ?? null;
    }

    public function getCityAttribute(): ?string
    {
        return $this->shipment->city ?? null;
    }

    public function getProvinceAttribute(): ?string
    {
        return $this->shipment->province ?? null;
    }

    public function getDeliveryTypeAttribute(): ?string
    {
        return $this->shipment->delivery_type ?? null;
    }

    public function getEstimatedDeliveryDaysAttribute(): ?string
    {
        return $this->shipment->estimated_delivery_days ?? null;
    }

    public function getPaymentMethodAttribute(): ?string
    {
        return $this->payment->method ?? null;
    }

    public function getPaymentStatusAttribute(): ?string
    {
        return $this->payment->status ?? null;
    }

    public function getXenditInvoiceIdAttribute(): ?string
    {
        return $this->payment->xendit_invoice_id ?? null;
    }

    public function getXenditInvoiceUrlAttribute(): ?string
    {
        return $this->payment->xendit_invoice_url ?? null;
    }

    public function getShippingFeeAttribute(): ?string
    {
        return $this->receipt->shipping_fee ?? null;
    }

    public function getTotalEstimatedPriceAttribute(): ?string
    {
        return $this->receipt->subtotal ?? null;
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->whereRaw('LOWER(reference_code) LIKE ?', ['%' . strtolower($term) . '%'])
              ->orWhereHas('shipment', function ($sq) use ($term) {
                  $sq->whereRaw('LOWER(recipient_first_name) LIKE ?', ['%' . strtolower($term) . '%'])
                    ->orWhereRaw('LOWER(recipient_last_name) LIKE ?', ['%' . strtolower($term) . '%'])
                    ->orWhereRaw('LOWER(recipient_email) LIKE ?', ['%' . strtolower($term) . '%']);
              });
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function payment(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function shipment(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function receipt(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Receipt::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InquiryItem::class);
    }
}
