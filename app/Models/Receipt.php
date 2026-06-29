<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'inquiry_id',
        'receipt_number',
        'subtotal',
        'shipping_fee',
        'total_amount',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'      => 'decimal:2',
            'shipping_fee'  => 'decimal:2',
            'total_amount'  => 'decimal:2',
            'issued_at'     => 'datetime',
        ];
    }

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }
}
