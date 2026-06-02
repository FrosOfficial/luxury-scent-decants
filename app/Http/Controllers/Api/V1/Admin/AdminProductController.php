<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    /**
     * Display a listing of all products (active and inactive) for admin catalog.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['volumes', 'accords', 'notes']);

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('brand')) {
            $query->byBrand($request->input('brand'));
        }

        $products = $query->orderBy('name', 'ASC')
            ->paginate($request->input('per_page', 20));

        return response()->json($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                     => 'required|string|max:255',
            'brand'                    => 'required|string|max:255',
            'scent_profile'            => 'required|string|max:255',
            'demographic'              => 'required|string|in:Masculine,Feminine,Unisex',
            'image_url'                => 'nullable|string|max:2048',
            'performance'              => 'required|array',
            'performance.longevity'    => 'required|string|max:255',
            'performance.sillage'      => 'required|string|max:255',
            'usage'                    => 'required|array',
            'usage.day'                => 'required|boolean',
            'usage.night'              => 'required|boolean',
            'usage.seasons'            => 'required|array',
            'usage.seasons.spring'     => 'required|boolean',
            'usage.seasons.summer'     => 'required|boolean',
            'usage.seasons.autumn'     => 'required|boolean',
            'usage.seasons.winter'     => 'required|boolean',
            'rating'                   => 'nullable|numeric|min:0|max:5',
            'rating_count'             => 'nullable|integer|min:0',
            'is_active'                => 'nullable|boolean',
            'accords'                  => 'nullable|array|max:5',
            'accords.*.name'           => 'required|string|max:255',
            'accords.*.percentage'     => 'required|integer|min:1|max:100',
        ]);

        $product = Product::create($validated);

        if ($request->has('accords')) {
            foreach ($request->input('accords') as $index => $a) {
                $product->accords()->create([
                    'name' => $a['name'],
                    'percentage' => $a['percentage'],
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product->load(['volumes', 'accords', 'notes']),
        ], 201);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $validated = $request->validate([
            'name'                     => 'required|string|max:255',
            'brand'                    => 'required|string|max:255',
            'scent_profile'            => 'required|string|max:255',
            'demographic'              => 'required|string|in:Masculine,Feminine,Unisex',
            'image_url'                => 'nullable|string|max:2048',
            'performance'              => 'required|array',
            'performance.longevity'    => 'required|string|max:255',
            'performance.sillage'      => 'required|string|max:255',
            'usage'                    => 'required|array',
            'usage.day'                => 'required|boolean',
            'usage.night'              => 'required|boolean',
            'usage.seasons'            => 'required|array',
            'usage.seasons.spring'     => 'required|boolean',
            'usage.seasons.summer'     => 'required|boolean',
            'usage.seasons.autumn'     => 'required|boolean',
            'usage.seasons.winter'     => 'required|boolean',
            'rating'                   => 'required|numeric|min:0|max:5',
            'rating_count'             => 'required|integer|min:0',
            'is_active'                => 'required|boolean',
            'accords'                  => 'nullable|array|max:5',
            'accords.*.name'           => 'required|string|max:255',
            'accords.*.percentage'     => 'required|integer|min:1|max:100',
        ]);

        $product->update($validated);

        if ($request->has('accords')) {
            $product->accords()->delete();
            foreach ($request->input('accords') as $index => $a) {
                $product->accords()->create([
                    'name' => $a['name'],
                    'percentage' => $a['percentage'],
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product->load(['volumes', 'accords', 'notes']),
        ]);
    }

    /**
     * Toggle the active status of the specified product.
     */
    public function toggleActive(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $product->update([
            'is_active' => !$product->is_active,
        ]);

        return response()->json([
            'message'   => 'Product status toggled successfully.',
            'is_active' => $product->is_active,
            'product'   => $product->load(['volumes', 'accords', 'notes']),
        ]);
    }

    /**
     * Upload product image locally to the public directory.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            // Check if it's a base64 upload to bypass PHP temp directory restrictions
            if ($request->has('image_base64')) {
                $base64Data = $request->input('image_base64');
                $filename = $request->input('filename', 'upload_' . time() . '.png');
                
                // Parse base64 string
                if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                    $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                    $type = strtolower($type[1]); // e.g. png, jpeg, webp

                    if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'])) {
                        return response()->json(['message' => 'Invalid image type.'], 422);
                    }

                    $base64Data = base64_decode($base64Data);

                    if ($base64Data === false) {
                        return response()->json(['message' => 'Base64 decode failed.'], 422);
                    }
                } else {
                    return response()->json(['message' => 'Did not match data URI with base64 data.'], 422);
                }

                $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '', $filename);
                $uploadPath = public_path('uploads');
                if (!is_dir($uploadPath)) {
                    @mkdir($uploadPath, 0777, true);
                }

                file_put_contents($uploadPath . '/' . $filename, $base64Data);
                $url = url('uploads/' . $filename);

                return response()->json([
                    'url' => $url,
                    'path' => 'uploads/' . $filename,
                ]);
            }

            // Multipart validation fallback
            $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:8192',
            ]);

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '', $file->getClientOriginalName());
                
                $uploadPath = public_path('uploads');
                if (!is_dir($uploadPath)) {
                    @mkdir($uploadPath, 0777, true);
                }
                
                $file->move($uploadPath, $filename);
                $url = url('uploads/' . $filename);

                return response()->json([
                    'url' => $url,
                    'path' => 'uploads/' . $filename,
                ]);
            }

            return response()->json(['message' => 'No file uploaded.'], 400);
        } catch (\Exception $e) {
            \Log::error('Image upload failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to save uploaded image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all locally saved uploads inside public/uploads.
     */
    public function listUploads(): JsonResponse
    {
        $uploadPath = public_path('uploads');
        if (!is_dir($uploadPath)) {
            return response()->json([]);
        }
        
        $files = array_diff(scandir($uploadPath), ['.', '..', '.gitkeep']);
        $list = [];
        foreach ($files as $file) {
            $list[] = [
                'filename' => $file,
                'url' => url('uploads/' . $file)
            ];
        }
        
        return response()->json(array_values($list));
    }

    /**
     * Delete the specified product from catalog.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.'
        ]);
    }
}
