<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of active products with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->active()->with(['volumes', 'accords', 'notes']);

        // ─── Search Filter ───────────────────────────────────────────────────
        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        // ─── Brand Filter (array or comma-separated string) ──────────────────
        if ($request->filled('brands')) {
            $brands = is_array($request->input('brands'))
                ? $request->input('brands')
                : explode(',', $request->input('brands'));
            $query->whereIn('brand', $brands);
        }

        // ─── Scent Profile Filter ───────────────────────────────────────────
        if ($request->filled('scent_profiles')) {
            $profiles = is_array($request->input('scent_profiles'))
                ? $request->input('scent_profiles')
                : explode(',', $request->input('scent_profiles'));
            $query->whereIn('scent_profile', $profiles);
        }

        // ─── Demographic Filter ─────────────────────────────────────────────
        if ($request->filled('demographics')) {
            $demographics = is_array($request->input('demographics'))
                ? $request->input('demographics')
                : explode(',', $request->input('demographics'));
            $query->whereIn('demographic', $demographics);
        }

        // ─── Seasons Filter (JSON field querying) ───────────────────────────
        if ($request->filled('seasons')) {
            $seasons = is_array($request->input('seasons'))
                ? $request->input('seasons')
                : explode(',', $request->input('seasons'));

            $query->where(function ($q) use ($seasons) {
                foreach ($seasons as $season) {
                    $q->orWhere('usage->seasons->' . $season, true);
                }
            });
        }

        // ─── Time of Day (JSON field querying) ──────────────────────────────
        if ($request->filled('time_of_day')) {
            $times = is_array($request->input('time_of_day'))
                ? $request->input('time_of_day')
                : explode(',', $request->input('time_of_day'));

            if (in_array('day', $times)) {
                $query->where('usage->day', true);
            }
            if (in_array('night', $times)) {
                $query->where('usage->night', true);
            }
        }

        // ─── Decant Size Filter (via VolumePricing relation) ────────────────
        if ($request->filled('volumes')) {
            $sizes = is_array($request->input('volumes'))
                ? $request->input('volumes')
                : explode(',', $request->input('volumes'));

            $query->whereHas('volumes', function ($q) use ($sizes) {
                $q->whereIn('size', $sizes)->where('is_available', true);
            });
        }

        // ─── Sillage Filter (JSON field querying) ───────────────────────────
        if ($request->filled('sillage')) {
            $sillage = is_array($request->input('sillage'))
                ? $request->input('sillage')
                : explode(',', $request->input('sillage'));
            $query->whereIn('performance->sillage', $sillage);
        }

        // ─── Main Accords Filter (via ProductAccord relation) ───────────────
        if ($request->filled('accords')) {
            $accords = is_array($request->input('accords'))
                ? $request->input('accords')
                : explode(',', $request->input('accords'));

            $query->whereHas('accords', function ($q) use ($accords) {
                $q->whereIn('name', $accords);
            });
        }

        // ─── Sorting ────────────────────────────────────────────────────────
        $sortBy = $request->input('sort_by', 'recommended');

        switch ($sortBy) {
            case 'price-asc':
                $query->select('products.*')
                    ->leftJoin('volume_pricing', function ($join) {
                        $join->on('products.id', '=', 'volume_pricing.product_id')
                            ->where('volume_pricing.size', '=', '10ml');
                    })
                    ->orderByRaw('COALESCE(volume_pricing.price, 999999) ASC')
                    ->orderBy('products.name', 'ASC');
                break;
            case 'price-desc':
                $query->select('products.*')
                    ->leftJoin('volume_pricing', function ($join) {
                        $join->on('products.id', '=', 'volume_pricing.product_id')
                            ->where('volume_pricing.size', '=', '10ml');
                    })
                    ->orderByRaw('COALESCE(volume_pricing.price, 0) DESC')
                    ->orderBy('products.name', 'ASC');
                break;
            case 'name-asc':
                $query->orderBy('name', 'ASC');
                break;
            case 'rating':
                $query->orderBy('rating', 'DESC')->orderBy('rating_count', 'DESC');
                break;
            case 'recommended':
            default:
                // Default sorting: active state, rating desc, name asc
                $query->orderBy('rating', 'DESC')->orderBy('name', 'ASC');
                break;
        }

        // Paginate if requested, otherwise return all (78 products is very lightweight)
        if ($request->has('page')) {
            $products = $query->paginate($request->input('per_page', 12));
        } else {
            $products = $query->get();
        }

        return response()->json($products);
    }

    /**
     * Display the specified product with all relationships.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['volumes', 'accords', 'notes'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return response()->json($product);
    }
}
