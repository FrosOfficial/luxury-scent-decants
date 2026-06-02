<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductAccord;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class FilterController extends Controller
{
    /**
     * Get a list of all unique brands.
     */
    public function brands(): JsonResponse
    {
        $brands = Product::active()
            ->select('brand')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        return response()->json($brands);
    }

    /**
     * Get all available filter choices dynamically.
     */
    public function index(): JsonResponse
    {
        // Fetch unique brands
        $brands = Product::active()
            ->select('brand')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        // Scent profiles, demographics (from DB enum/distinct values)
        $scentProfiles = Product::active()->select('scent_profile')->distinct()->pluck('scent_profile');
        $demographics = Product::active()->select('demographic')->distinct()->pluck('demographic');

        // Extract unique sillage values from performance JSON column
        $sillageOptions = Product::active()
            ->whereNotNull('performance')
            ->select(DB::raw("performance->>'sillage' as sillage"))
            ->distinct()
            ->orderBy('sillage')
            ->pluck('sillage')
            ->filter();

        // Extract unique accord names
        $accords = ProductAccord::select('name')
            ->distinct()
            ->orderBy('name')
            ->pluck('name');

        return response()->json([
            'brands'           => $brands,
            'scent_profiles'   => $scentProfiles,
            'demographics'     => $demographics,
            'sillage'          => array_values($sillageOptions->toArray()),
            'accords'          => $accords,
        ]);
    }
}
