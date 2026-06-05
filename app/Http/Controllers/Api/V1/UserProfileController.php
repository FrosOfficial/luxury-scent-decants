<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'full_name'        => 'required|string|max:255',
            'phone'            => 'nullable|string|max:30',
            'delivery_address' => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:100',
            'province'         => 'nullable|string|max:100',
            'facebook_profile' => 'nullable|string|max:255',
        ]);

        $badWords = [
            'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'cock', 'whore', 'slut', 
            'troll', 'fake', 'spam', 'test', 'dummy', 'asdf', 'qwerty',
            'putangina', 'putang ina', 'gago', 'tarantado', 'tanga', 'ulol', 'bobo', 'hayop', 'tae'
        ];

        $errors = [];

        $nameLower = strtolower($validated['full_name'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['full_name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
                break;
            }
        }

        $addressLower = strtolower($validated['delivery_address'] ?? '');
        if ($addressLower) {
            foreach ($badWords as $word) {
                if (str_contains($addressLower, $word)) {
                    $errors['delivery_address'] = ['Prohibited language detected in address.'];
                    break;
                }
            }
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user,
        ]);
    }

    public function logout(): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->role === 'admin') {
            $user->update([
                'current_session_id' => null,
                'last_active_at' => null,
            ]);
        }

        return response()->json([
            'message' => 'Admin session cleared successfully.'
        ]);
    }
}
