<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'brand',
        'scent_profile',
        'demographic',
        'image_url',
        'performance',
        'usage',
        'rating',
        'rating_count',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'performance'  => 'array',
            'usage'        => 'array',
            'rating'       => 'decimal:1',
            'rating_count' => 'integer',
            'is_active'    => 'boolean',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByBrand($query, string $brand)
    {
        return $query->where('brand', $brand);
    }

    public function scopeByScentProfile($query, string $profile)
    {
        return $query->where('scent_profile', $profile);
    }

    public function scopeByDemographic($query, string $demographic)
    {
        return $query->where('demographic', $demographic);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($term) . '%'])
              ->orWhereRaw('LOWER(brand) LIKE ?', ['%' . strtolower($term) . '%']);
        });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function volumes(): HasMany
    {
        return $this->hasMany(VolumePricing::class)->orderByRaw("CASE size WHEN '2ml' THEN 1 WHEN '3ml' THEN 2 WHEN '5ml' THEN 3 WHEN '10ml' THEN 4 WHEN '15ml' THEN 5 WHEN '30ml' THEN 6 ELSE 7 END");
    }

    public function accords(): HasMany
    {
        return $this->hasMany(ProductAccord::class)->orderBy('sort_order')->orderByDesc('percentage');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ProductNote::class)->orderBy('sort_order');
    }

    public function inquiryItems(): HasMany
    {
        return $this->hasMany(InquiryItem::class);
    }
}
