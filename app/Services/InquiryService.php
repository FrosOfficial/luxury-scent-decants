<?php

namespace App\Services;

use App\Models\Inquiry;
use App\Models\Product;
use App\Models\VolumePricing;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InquiryService
{
    /**
     * Create a new inquiry with items, calculating prices and building the messenger redirect.
     */
    public function createInquiry(array $data, ?string $userId = null): Inquiry
    {
        return DB::transaction(function () use ($data, $userId) {
            // 1. Generate unique reference code
            $referenceCode = $this->generateUniqueReferenceCode();

            // 2. Create the base inquiry record
            $inquiry = Inquiry::create([
                'user_id'               => $userId,
                'reference_code'        => $referenceCode,
                'customer_name'         => $data['customer_name'],
                'customer_email'        => $data['customer_email'],
                'customer_phone'        => $data['customer_phone'],
                'delivery_address'      => $data['delivery_address'],
                'city'                  => $data['city'],
                'province'              => $data['province'],
                'facebook_profile'      => $data['facebook_profile'] ?? null,
                'additional_notes'      => $data['additional_notes'] ?? null,
                'payment_method'        => $data['payment_method'],
                'shipping_fee'          => $data['shipping_fee'],
                'delivery_type'         => $data['delivery_type'],
                'estimated_delivery_days' => $data['estimated_delivery_days'],
                'status'                => 'pending',
                'total_estimated_price' => 0.00, // Will calculate below
                'messenger_message'     => '',    // Will build below
            ]);

            $totalEstimatedPrice = 0.00;

            // 3. Process and create inquiry items
            foreach ($data['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $volumePricing = VolumePricing::where('product_id', $itemData['product_id'])
                    ->where('id', $itemData['volume_pricing_id'])
                    ->firstOrFail();

                $unitPrice = (float) $volumePricing->price;
                $quantity = (int) $itemData['quantity'];
                $subtotal = $unitPrice * $quantity;
                $totalEstimatedPrice += $subtotal;

                $inquiry->items()->create([
                    'product_id'        => $product->id,
                    'volume_pricing_id' => $volumePricing->id,
                    'product_name'      => $product->name,
                    'product_brand'     => $product->brand,
                    'volume_size'       => $volumePricing->size,
                    'unit_price'        => $unitPrice,
                    'quantity'          => $quantity,
                ]);
            }

            // 4. Calculate total and save
            $inquiry->total_estimated_price = $totalEstimatedPrice;
            $inquiry->save();

            return $inquiry;
        });
    }

    /**
     * Generate a unique, human-readable reference code.
     * Format: LSD-YYYYMMDD-XXXXXX
     */
    protected function generateUniqueReferenceCode(): string
    {
        $dateStr = date('Ymd');
        
        do {
            $randomStr = strtoupper(Str::random(6));
            $referenceCode = "LSD-{$dateStr}-{$randomStr}";
            $exists = Inquiry::where('reference_code', $referenceCode)->exists();
        } while ($exists);

        return $referenceCode;
    }
}
