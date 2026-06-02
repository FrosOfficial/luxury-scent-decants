<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    /**
     * Get summary metrics for the admin dashboard.
     */
    public function index(): JsonResponse
    {
        // 1. Inquiry stats by status
        $statusCounts = Inquiry::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all possible statuses are represented
        $statuses = ['pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled'];
        $formattedStatusCounts = [];
        foreach ($statuses as $status) {
            $formattedStatusCounts[$status] = $statusCounts[$status] ?? 0;
        }

        $totalInquiries = array_sum($formattedStatusCounts);

        // 2. Financial Metrics
        $totalEstimatedRevenue = Inquiry::whereIn('status', ['confirmed', 'fulfilled'])
            ->sum('total_estimated_price');

        // 3. Product stats
        $activeProductsCount = Product::active()->count();
        $totalProductsCount = Product::count();
        $inactiveProductsCount = $totalProductsCount - $activeProductsCount;

        // 4. Most popular brands (based on inquiry items snapshots)
        $popularBrands = DB::table('inquiry_items')
            ->select('product_brand as brand', DB::raw('count(*) as count'), DB::raw('sum(quantity) as items_sold'))
            ->groupBy('product_brand')
            ->orderBy('count', 'DESC')
            ->limit(5)
            ->get();

        // 5. Recent activity
        $recentInquiries = Inquiry::with('items')
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->get();

        return response()->json([
            'metrics' => [
                'total_inquiries'         => $totalInquiries,
                'status_counts'           => $formattedStatusCounts,
                'total_estimated_revenue' => (float) $totalEstimatedRevenue,
                'products' => [
                    'total'    => $totalProductsCount,
                    'active'   => $activeProductsCount,
                    'inactive' => $inactiveProductsCount,
                ]
            ],
            'popular_brands'   => $popularBrands,
            'recent_inquiries' => $recentInquiries,
        ]);
    }
}
