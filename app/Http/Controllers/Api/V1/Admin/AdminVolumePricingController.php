<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\VolumePricing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVolumePricingController extends Controller
{
    /**
     * Store a new volume pricing tier for a specific product.
     */
    public function store(Request $request, string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $validated = $request->validate([
            'size'         => 'required|string|in:2ml,3ml,5ml,10ml,15ml,30ml',
            'price'        => 'required|numeric|min:0',
            'is_available' => 'nullable|boolean',
        ]);

        // Check if size already exists for this product
        $exists = VolumePricing::where('product_id', $product->id)
            ->where('size', $validated['size'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => "A pricing tier for size '{$validated['size']}' already exists on this product."
            ], 422);
        }

        $volume = $product->volumes()->create([
            'size'         => $validated['size'],
            'price'        => $validated['price'],
            'is_available' => $validated['is_available'] ?? true,
        ]);

        return response()->json([
            'message' => 'Volume pricing tier added successfully.',
            'volume'  => $volume,
        ], 201);
    }

    /**
     * Update the specified volume pricing tier.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $volume = VolumePricing::find($id);

        if (!$volume) {
            return response()->json(['message' => 'Volume pricing tier not found.'], 404);
        }

        $validated = $request->validate([
            'price'        => 'required|numeric|min:0',
            'is_available' => 'required|boolean',
        ]);

        $volume->update($validated);

        return response()->json([
            'message' => 'Volume pricing tier updated successfully.',
            'volume'  => $volume,
        ]);
    }

    /**
     * Remove the specified volume pricing tier.
     */
    public function destroy(string $id): JsonResponse
    {
        $volume = VolumePricing::find($id);

        if (!$volume) {
            return response()->json(['message' => 'Volume pricing tier not found.'], 404);
        }

        $volume->delete();

        return response()->json([
            'message' => 'Volume pricing tier deleted successfully.'
        ]);
    }
}
