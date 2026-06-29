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

            $guestId = null;
            if (!$userId) {
                $guest = \App\Models\Guest::create([
                    'first_name'     => $data['customer_first_name'],
                    'last_name'      => $data['customer_last_name'],
                    'middle_initial' => $data['customer_middle_initial'] ?? null,
                    'guest_email'    => $data['customer_email'],
                    'guest_phone'    => $data['customer_phone'],
                ]);
                $guestId = $guest->id;
            }

            // 2. Create the base inquiry record
            $inquiry = Inquiry::create([
                'user_id'          => $userId,
                'guest_id'         => $guestId,
                'reference_code'   => $referenceCode,
                'additional_notes' => $data['additional_notes'] ?? null,
                'status'           => 'pending',
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

            // 4. Create Payment
            $inquiry->payment()->create([
                'method'             => $data['payment_method'],
                'status'             => 'pending',
                'xendit_invoice_id'  => null,
                'xendit_invoice_url' => null,
            ]);

            // 5. Create Shipment
            $inquiry->shipment()->create([
                'recipient_first_name'     => $data['customer_first_name'],
                'recipient_last_name'      => $data['customer_last_name'],
                'recipient_middle_initial' => $data['customer_middle_initial'] ?? null,
                'recipient_email'          => $data['customer_email'],
                'recipient_phone'          => $data['customer_phone'],
                'delivery_address'         => $data['delivery_address'],
                'city'                     => $data['city'],
                'province'                 => $data['province'],
                'delivery_type'            => $data['delivery_type'],
                'estimated_delivery_days'  => $data['estimated_delivery_days'],
            ]);

            // 6. Create Receipt
            $inquiry->receipt()->create([
                'receipt_number' => 'REC-' . strtoupper(Str::random(8)),
                'subtotal'       => $totalEstimatedPrice,
                'shipping_fee'   => $data['shipping_fee'],
                'total_amount'   => $totalEstimatedPrice + $data['shipping_fee'],
                'issued_at'      => now(),
            ]);

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

    /**
     * Refresh the payment status of an inquiry via Xendit if pending.
     */
    public function refreshPaymentStatus(Inquiry $inquiry): void
    {
        if ($inquiry->payment_status !== 'pending_payment' || !$inquiry->xendit_invoice_id) {
            return;
        }

        $secretKey = env('XENDIT_SECRET_KEY');
        if (!$secretKey) {
            return;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withBasicAuth($secretKey, '')
                ->get("https://api.xendit.co/v2/invoices/{$inquiry->xendit_invoice_id}");

            if ($response->successful()) {
                $resData = $response->json();
                $status = $resData['status'] ?? null;
                $expiryDate = $resData['expiry_date'] ?? null;
                $isExpired = ($status === 'EXPIRED');

                if (!$isExpired && $expiryDate) {
                    try {
                        if (\Illuminate\Support\Carbon::parse($expiryDate)->isPast()) {
                            $isExpired = true;
                        }
                    } catch (\Exception $e) {
                        // Ignore parsing issues
                    }
                }

                if ($status === 'PAID' || $status === 'SETTLED') {
                    $inquiry->payment()->update([
                        'status' => 'paid',
                    ]);
                    $inquiry->update([
                        'status' => 'confirmed',
                    ]);
                    
                    $this->sendReceiptEmail($inquiry);
                } elseif ($isExpired) {
                    $inquiry->payment()->update([
                        'status' => 'expired',
                    ]);
                    $inquiry->update([
                        'status' => 'cancelled',
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Xendit status check failed: ' . $e->getMessage());
        }
    }

    /**
     * Send receipt/invoice email to customer.
     */
    public function sendReceiptEmail(Inquiry $inquiry): void
    {
        $inquiry->refresh();
        $inquiry->load(['items', 'payment', 'shipment', 'receipt']);

        $recipientEmail = $inquiry->customer_email;
        if (!$recipientEmail) {
            return;
        }

        $paymentMethod = strtoupper($inquiry->payment_method ?: '');
        $paymentStatus = strtoupper($inquiry->payment_status ?: '');
        $orderStatus = strtoupper($inquiry->status ?: '');
        $subtotal = number_format((float) ($inquiry->total_estimated_price ?: 0), 2);
        $shippingFee = number_format((float) ($inquiry->shipping_fee ?: 0), 2);
        $grandTotal = number_format(((float) ($inquiry->total_estimated_price ?: 0)) + ((float) ($inquiry->shipping_fee ?: 0)), 2);

        $itemRows = '';
        foreach ($inquiry->items as $item) {
            $itemRows .= "
            <tr style=\"border-bottom: 1px solid rgba(212,175,55,0.1);\">
                <td style=\"padding: 10px 5px; vertical-align: top;\">
                    <strong style=\"color: #f5f0eb; font-size: 13px;\">{$item->product_name}</strong><br/>
                    <span style=\"color: #a3b8b0; font-size: 11px;\">{$item->product_brand}</span>
                </td>
                <td style=\"padding: 10px 5px; text-align: center; font-size: 12px; color: #a3b8b0; vertical-align: middle;\">{$item->volume_size}</td>
                <td style=\"padding: 10px 5px; text-align: center; font-size: 12px; color: #f5f0eb; font-weight: bold; vertical-align: middle;\">{$item->quantity}</td>
                <td style=\"padding: 10px 5px; text-align: right; font-size: 12px; color: #f5f0eb; font-weight: bold; vertical-align: middle;\">₱" . number_format($item->unit_price * $item->quantity, 2) . "</td>
            </tr>
            ";
        }

        $statusBanner = '';
        if ($inquiry->status === 'confirmed') {
            $statusBanner = "
            <div style=\"background-color: #02251a; border: 1px solid #d4af37; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; color: #d4af37; font-weight: bold; font-size: 13px;\">
                ✓ Your order has been confirmed by our team!
            </div>
            ";
        }

        $html = "
        <div style=\"background-color: #011611; color: #f5f0eb; font-family: sans-serif; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(212,175,55,0.2);\">
            <div style=\"text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 25px;\">
                <h2 style=\"font-family: serif; color: #f5f0eb; margin: 0; font-size: 24px; letter-spacing: 1px;\">LUXURY SCENT DECANTS</h2>
                <p style=\"color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0; font-weight: bold;\">Digital Invoice Receipt</p>
            </div>

            {$statusBanner}

            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px;\">
                <tr>
                    <td style=\"width: 50%; vertical-align: top; padding-right: 15px;\">
                        <div style=\"background-color: #02251a; border: 1px solid rgba(212,175,55,0.15); padding: 15px; border-radius: 8px; min-height: 100px;\">
                            <p style=\"color: #d4af37; font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 1px;\">Recipient Details</p>
                            <p style=\"margin: 0; font-size: 13px; font-weight: bold;\">{$inquiry->customer_name}</p>
                            <p style=\"margin: 3px 0; font-size: 12px; color: #a3b8b0;\">{$inquiry->customer_phone}</p>
                            <p style=\"margin: 0; font-size: 12px; color: #a3b8b0;\">{$inquiry->customer_email}</p>
                        </div>
                    </td>
                    <td style=\"width: 50%; vertical-align: top; padding-left: 15px;\">
                        <div style=\"background-color: #02251a; border: 1px solid rgba(212,175,55,0.15); padding: 15px; border-radius: 8px; min-height: 100px;\">
                            <p style=\"color: #d4af37; font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 1px;\">Delivery & Payment</p>
                            <p style=\"margin: 0; font-size: 12px; color: #a3b8b0;\">{$inquiry->delivery_address}, {$inquiry->city}, {$inquiry->province}</p>
                            <p style=\"margin: 5px 0 0 0; font-size: 12px; font-weight: bold;\">Method: <span style=\"color: #d4af37;\">{$paymentMethod}</span></p>
                            <p style=\"margin: 2px 0 0 0; font-size: 12px; font-weight: bold;\">Order Status: <span style=\"color: #d4af37;\">{$orderStatus}</span></p>
                            <p style=\"margin: 2px 0 0 0; font-size: 12px; font-weight: bold;\">Payment Status: <span style=\"color: #d4af37;\">{$paymentStatus}</span></p>
                        </div>
                    </td>
                </tr>
            </table>

            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px;\">
                <thead>
                    <tr style=\"border-bottom: 1px solid rgba(212,175,55,0.25);\">
                        <th style=\"text-align: left; padding: 10px 5px; color: #d4af37; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;\">Fragrance Details</th>
                        <th style=\"text-align: center; padding: 10px 5px; color: #d4af37; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; width: 60px;\">Size</th>
                        <th style=\"text-align: center; padding: 10px 5px; color: #d4af37; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; width: 50px;\">Qty</th>
                        <th style=\"text-align: right; padding: 10px 5px; color: #d4af37; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; width: 80px;\">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemRows}
                </tbody>
            </table>

            <div style=\"border-top: 1px solid rgba(212,175,55,0.15); padding-top: 15px; margin-top: 15px;\">
                <table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">
                    <tr>
                        <td style=\"padding: 4px 0; color: #a3b8b0;\">Decants Subtotal:</td>
                        <td style=\"padding: 4px 0; text-align: right; font-weight: bold;\">₱{$subtotal}</td>
                    </tr>
                    <tr>
                        <td style=\"padding: 4px 0; color: #a3b8b0;\">Shipping ({$inquiry->delivery_type}):</td>
                        <td style=\"padding: 4px 0; text-align: right; font-weight: bold;\">₱{$shippingFee}</td>
                    </tr>
                    <tr style=\"border-top: 1px solid rgba(212,175,55,0.25);\">
                        <td style=\"padding: 12px 0 0 0; font-size: 16px; font-weight: bold; color: #d4af37;\">Grand Bill Total:</td>
                        <td style=\"padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: bold; color: #d4af37;\">₱{$grandTotal}</td>
                    </tr>
                </table>
            </div>

            <div style=\"text-align: center; margin-top: 30px; border-top: 1px solid rgba(212,175,55,0.1); padding-top: 20px; font-size: 11px; color: #a3b8b0;\">
                <p style=\"margin: 0 0 5px 0;\">Thank you for your order! Reference Code: <strong style=\"color: #d4af37;\">{$inquiry->reference_code}</strong></p>
                <p style=\"margin: 0;\">If you have any questions, please contact our support chat.</p>
            </div>
        </div>
        ";

        \Illuminate\Support\Facades\Log::info("Sending receipt email to {$recipientEmail} for order {$inquiry->reference_code}");

        try {
            \Illuminate\Support\Facades\Mail::html($html, function ($message) use ($recipientEmail, $inquiry) {
                $subject = "Your Invoice Receipt from Luxury Scent Decants (#{$inquiry->reference_code})";
                if ($inquiry->status === 'confirmed') {
                    $subject = "✓ Order Confirmed! Luxury Scent Decants (#{$inquiry->reference_code})";
                }
                $message->to($recipientEmail)->subject($subject);
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send receipt email to {$recipientEmail}: " . $e->getMessage());
        }
    }
}
