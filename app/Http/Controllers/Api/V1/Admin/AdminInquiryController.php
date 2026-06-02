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
        $query = Inquiry::query()->with(['items', 'user']);

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

        return response()->json($inquiries);
    }

    /**
     * Display the specified inquiry detail.
     */
    public function show(string $id): JsonResponse
    {
        $inquiry = Inquiry::with(['items', 'user'])->find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found.'], 404);
        }

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

        $inquiry->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Inquiry status updated successfully.',
            'inquiry' => $inquiry->load(['items', 'user']),
        ]);
    }
}
