<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Services\InquiryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class InquiryController extends Controller
{
    protected InquiryService $inquiryService;

    public function __construct(InquiryService $inquiryService)
    {
        $this->inquiryService = $inquiryService;
    }

    /**
     * Store a newly created inquiry in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_first_name'     => 'required|string|max:255',
            'customer_last_name'      => 'required|string|max:255',
            'customer_middle_initial' => 'nullable|string|max:10',
            'customer_email'          => 'required|email|max:255',
            'customer_phone'          => 'required|string|max:30',
            'delivery_address'        => 'required|string|max:255',
            'city'                    => 'required|string|max:100',
            'province'                => 'required|string|max:100',
            'additional_notes'        => 'nullable|string',
            'payment_method'          => 'required|string|in:gcash,maya,cod',
            'shipping_fee'            => 'required|numeric|min:0',
            'delivery_type'           => 'required|string|max:255',
            'estimated_delivery_days' => 'required|string|max:255',
            'items'                   => 'required|array|min:1',
            'items.*.product_id'      => 'required|uuid|exists:products,id',
            'items.*.volume_pricing_id' => 'required|uuid|exists:volume_pricing,id',
            'items.*.quantity'        => 'required|integer|min:1',
        ]);

        $userId = Auth::id(); // Will be null if guest (unauthenticated optional flow)

        if (!$userId) {
            $this->validateGuestCensorship($validated);
        }

        $inquiry = $this->inquiryService->createInquiry($validated, $userId);

        $secretKey = env('XENDIT_SECRET_KEY');
        if ($secretKey && in_array($inquiry->payment_method, ['gcash', 'maya'])) {
            $subtotal = (float) ($inquiry->receipt->subtotal ?? 0);
            $shipping = (float) ($inquiry->receipt->shipping_fee ?? 0);
            $totalAmount = $subtotal + $shipping;

            try {
                $response = Http::withBasicAuth($secretKey, '')
                    ->post('https://api.xendit.co/v2/invoices', [
                        'external_id' => $inquiry->id,
                        'amount' => $totalAmount,
                        'description' => "Payment for order {$inquiry->reference_code}",
                        'invoice_duration' => app()->environment('local') ? 120 : 86400, // 2 mins for local testing, 24h otherwise
                        'customer' => [
                            'given_names' => $inquiry->shipment->recipient_first_name,
                            'surname' => $inquiry->shipment->recipient_last_name,
                            'email' => $inquiry->customer_email,
                            'mobile_number' => $inquiry->customer_phone,
                        ],
                        'success_redirect_url' => (app()->environment('local') ? 'http://localhost:8000' : url('/')) . '/api/v1/payments/callback?ref=' . $inquiry->reference_code,
                        'failure_redirect_url' => 'http://localhost:5173/?payment=failed',
                        'currency' => 'PHP',
                        'payment_methods' => [
                            $inquiry->payment_method === 'gcash' ? 'GCASH' : 'PAYMAYA'
                        ],
                    ]);

                if ($response->successful()) {
                    $resData = $response->json();
                    $inquiry->payment()->update([
                        'xendit_invoice_id' => $resData['id'] ?? null,
                        'xendit_invoice_url' => $resData['invoice_url'] ?? null,
                        'status' => 'pending_payment',
                    ]);
                } else {
                    \Illuminate\Support\Facades\Log::error('Xendit Invoice Creation Failed: ' . $response->body());
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Xendit Invoice Creation Exception: ' . $e->getMessage());
            }
        }

        // Send email receipt to customer immediately if COD
        if ($inquiry->payment_method === 'cod') {
            $this->inquiryService->sendReceiptEmail($inquiry);
        }

        return response()->json([
            'message'        => 'Order placed successfully.',
            'reference_code' => $inquiry->reference_code,
            'inquiry'        => $inquiry->load(['items', 'payment', 'shipment', 'receipt', 'guest']),
            'xendit_invoice_url' => $inquiry->xendit_invoice_url,
        ], 201);
    }

    /**
     * Validate input against common bad words and troll credentials.
     */
    private function validateGuestCensorship(array $data): void
    {
        $badWords = [
            'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'cock', 'whore', 'slut', 
            'troll', 'fake', 'spam', 'test', 'dummy', 'asdf', 'qwerty',
            'putangina', 'putang ina', 'gago', 'tarantado', 'tanga', 'ulol', 'bobo', 'hayop', 'tae'
        ];

        $trollDomains = [
            'mailinator.com', 'yopmail.com', '10minutemail.com', 'tempmail.com', 
            'trashmail.com', 'guerrillamail.com', 'sharklasers.com', 'getairmail.com', 
            'dispostable.com', 'burnmailer.com'
        ];

        $errors = [];

        // 1. Check customer names
        $nameLower = strtolower(($data['customer_first_name'] ?? '') . ' ' . ($data['customer_last_name'] ?? ''));
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['customer_first_name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
                break;
            }
        }

        // 2. Check customer_email
        $emailLower = strtolower($data['customer_email'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($emailLower, $word)) {
                $errors['customer_email'] = ['Prohibited or invalid email address detected.'];
                break;
            }
        }
        if (empty($errors['customer_email'])) {
            foreach ($trollDomains as $domain) {
                if (str_ends_with($emailLower, '@' . $domain) || str_contains($emailLower, '@' . $domain)) {
                    $errors['customer_email'] = ['Prohibited or temporary email provider detected. Please use a valid email address.'];
                    break;
                }
            }
        }

        // 3. Check additional_notes
        $notesLower = strtolower($data['additional_notes'] ?? '');
        if ($notesLower) {
            foreach ($badWords as $word) {
                if (str_contains($notesLower, $word)) {
                    $errors['additional_notes'] = ['Prohibited language detected in additional notes.'];
                    break;
                }
            }
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }
    }

    /**
     * Display a paginated list of the authenticated user's own inquiries.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $inquiries = Inquiry::where('user_id', $user->id)
            ->with(['items', 'payment', 'shipment', 'receipt', 'guest'])
            ->orderBy('created_at', 'DESC')
            ->paginate(10);

        foreach ($inquiries->items() as $inquiry) {
            $this->inquiryService->refreshPaymentStatus($inquiry);
        }

        return response()->json($inquiries);
    }

    /**
     * Display the details of a specific inquiry owned by the authenticated user.
     */
    public function show(string $id): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $inquiry = Inquiry::where('user_id', $user->id)
            ->with(['items', 'payment', 'shipment', 'receipt', 'guest'])
            ->find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found.'], 404);
        }

        $this->inquiryService->refreshPaymentStatus($inquiry);

        return response()->json($inquiry);
    }

    /**
     * Handle Xendit Webhook notifications.
     */
    public function xenditWebhook(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('Xendit Webhook Received: ' . json_encode($request->all()));

        $event = $request->input('status');
        $invoiceId = $request->input('id');
        $inquiryId = $request->input('external_id');

        $inquiry = Inquiry::where('id', $inquiryId)
            ->orWhereHas('payment', function ($q) use ($invoiceId) {
                $q->where('xendit_invoice_id', $invoiceId);
            })
            ->first();

        if ($inquiry) {
            if ($event === 'PAID') {
                $inquiry->payment()->update([
                    'status' => 'paid',
                ]);
                $inquiry->update([
                    'status' => 'confirmed' // Automatically confirm the order on payment
                ]);
                
                // Send updated email receipt to customer showing "PAID" status
                $this->inquiryService->sendReceiptEmail($inquiry);

                return response()->json(['message' => 'Inquiry payment updated to PAID.'], 200);
            } elseif ($event === 'EXPIRED') {
                $inquiry->payment()->update([
                    'status' => 'expired',
                ]);
                $inquiry->update([
                    'status' => 'cancelled',
                ]);
                return response()->json(['message' => 'Inquiry payment updated to EXPIRED.'], 200);
            }
        }

        return response()->json(['message' => 'Inquiry not found or unhandled status.'], 404);
    }

    /**
     * Handle user redirect from Xendit payment.
     */
    public function paymentCallback(Request $request)
    {
        $ref = $request->query('ref');
        
        $inquiry = Inquiry::where('reference_code', $ref)->first();
        if ($inquiry) {
            // Force status check and refresh immediately
            $this->inquiryService->refreshPaymentStatus($inquiry);
            
            $frontendUrl = 'http://localhost:5173';
            if ($inquiry->user_id) {
                return redirect()->away("{$frontendUrl}/profile?tab=inquiries");
            }
            return redirect()->away("{$frontendUrl}/?success=1&ref={$ref}");
        }

        return redirect()->away('http://localhost:5173');
    }
}
