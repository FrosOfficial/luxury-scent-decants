<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInquiryController extends Controller
{
    /**
     * Display a listing of all customer inquiries, with filter/search options.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Inquiry::query()->with(['items', 'user', 'guest', 'payment', 'shipment', 'receipt']);

        // Filter by Status
        if ($request->filled('status')) {
            $query->byStatus($request->input('status'));
        }

        // Filter by Date Range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        // Search Query
        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        $inquiries = $query->orderBy('created_at', 'DESC')
            ->paginate($request->input('per_page', 15));

        $inquiryService = app(\App\Services\InquiryService::class);
        foreach ($inquiries->items() as $inquiry) {
            $inquiryService->refreshPaymentStatus($inquiry);
        }

        return response()->json($inquiries);
    }

    /**
     * Display the specified inquiry detail.
     */
    public function show(string $id): JsonResponse
    {
        $inquiry = Inquiry::with(['items', 'user', 'guest', 'payment', 'shipment', 'receipt'])->find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found.'], 404);
        }

        app(\App\Services\InquiryService::class)->refreshPaymentStatus($inquiry);

        return response()->json($inquiry);
    }

    /**
     * Update the status of the specified inquiry.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $inquiry = Inquiry::find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found.'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', Inquiry::STATUSES),
        ]);

        $updateData = ['status' => $validated['status']];
        if ($validated['status'] === 'cancelled') {
            $inquiry->payment()->update([
                'status' => 'expired',
            ]);
        } elseif ($validated['status'] === 'fulfilled') {
            if ($inquiry->payment_method === 'cod') {
                $inquiry->payment()->update([
                    'status' => 'paid',
                ]);
            }
        }

        $inquiry->update($updateData);

        if ($validated['status'] === 'confirmed') {
            $inquiryService = app(\App\Services\InquiryService::class);
            $inquiryService->sendReceiptEmail($inquiry);
        }

        return response()->json([
            'message' => 'Inquiry status updated successfully.',
            'inquiry' => $inquiry->load(['items', 'user', 'guest', 'payment', 'shipment', 'receipt']),
        ]);
    }

    /**
     * Update the payment status of the specified inquiry.
     */
    public function updatePaymentStatus(Request $request, string $id): JsonResponse
    {
        $inquiry = Inquiry::find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found.'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,paid,expired,failed,pending_payment',
        ]);

        $inquiry->payment()->update([
            'status' => $validated['status'],
        ]);

        // Send updated receipt to customer showing the new payment status
        $inquiryService = app(\App\Services\InquiryService::class);
        $inquiryService->sendReceiptEmail($inquiry);

        return response()->json([
            'message' => 'Payment status updated successfully.',
            'inquiry' => $inquiry->load(['items', 'user', 'guest', 'payment', 'shipment', 'receipt']),
        ]);
    }
}
