<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Services\InquiryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            'customer_name'           => 'required|string|max:255',
            'customer_email'          => 'required|email|max:255',
            'customer_phone'          => 'required|string|max:30',
            'delivery_address'        => 'required|string|max:255',
            'city'                    => 'required|string|max:100',
            'province'                => 'required|string|max:100',
            'facebook_profile'        => 'nullable|string|max:255',
            'additional_notes'        => 'nullable|string',
            'payment_method'          => 'required|string|in:gcash,maya,bank_transfer,cod,rcbc',
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

        return response()->json([
            'message'        => 'Order placed successfully.',
            'reference_code' => $inquiry->reference_code,
            'inquiry'        => $inquiry->load('items'),
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

        // 1. Check customer_name
        $nameLower = strtolower($data['customer_name'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['customer_name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
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
            ->with(['items'])
            ->orderBy('created_at', 'DESC')
            ->paginate(10);

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
            ->with(['items'])
            ->find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found.'], 404);
        }

        return response()->json($inquiry);
    }
}
