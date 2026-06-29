<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'inquiry_id',
        'recipient_first_name',
        'recipient_last_name',
        'recipient_middle_initial',
        'recipient_email',
        'recipient_phone',
        'delivery_address',
        'city',
        'province',
        'delivery_type',
        'estimated_delivery_days',
    ];

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }
}
