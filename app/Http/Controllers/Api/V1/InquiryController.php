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

        $inquiry = $this->inquiryService->createInquiry($validated, $userId);

        return response()->json([
            'message'        => 'Order placed successfully.',
            'reference_code' => $inquiry->reference_code,
            'inquiry'        => $inquiry->load('items'),
        ], 201);
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
