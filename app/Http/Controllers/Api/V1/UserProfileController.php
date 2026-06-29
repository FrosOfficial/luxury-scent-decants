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
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'middle_initial'   => 'nullable|string|max:10',
            'phone'            => 'nullable|string|max:30',
            'delivery_address' => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:100',
            'province'         => 'nullable|string|max:100',
            'current_password' => 'nullable|string',
            'new_password'     => 'nullable|string|min:6|confirmed',
            'verification_code'=> 'nullable|string|size:6',
        ]);

        $badWords = [
            'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'cock', 'whore', 'slut', 
            'troll', 'fake', 'spam', 'test', 'dummy', 'asdf', 'qwerty',
            'putangina', 'putang ina', 'gago', 'tarantado', 'tanga', 'ulol', 'bobo', 'hayop', 'tae'
        ];

        $errors = [];

        $nameLower = strtolower(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? ''));
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['first_name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
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

        if ($request->filled('new_password')) {
            if (!$request->filled('current_password')) {
                $errors['current_password'] = ['The current password field is required to change password.'];
            } elseif (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
                $errors['current_password'] = ['The current password you entered is incorrect.'];
            }

            if (!$request->filled('verification_code')) {
                $errors['verification_code'] = ['A verification code is required to change your password.'];
            } else {
                if ($user->verification_code !== $request->verification_code) {
                    $errors['verification_code'] = ['The verification code you entered is invalid.'];
                } elseif (now()->greaterThan($user->verification_expires_at)) {
                    $errors['verification_code'] = ['The verification code has expired. Please request a new one.'];
                }
            }
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }

        // Exclude password inputs from default fill
        $profileData = collect($validated)->except(['current_password', 'new_password', 'new_password_confirmation', 'verification_code'])->toArray();
        $user->fill($profileData);

        if ($request->filled('new_password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->new_password);
            
            // Clear verification code after successful password update
            $user->verification_code = null;
            $user->verification_expires_at = null;

            // Sync password to Admin model if admin user
            if ($user->isAdmin()) {
                $admin = \App\Models\Admin::where('email', $user->email)->first();
                if ($admin) {
                    $admin->update(['password' => $user->password]);
                }
            }
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user,
        ]);
    }

    /**
     * Send verification code for changing password.
     */
    public function sendPasswordChangeCode(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $code = strval(rand(100000, 999999));
        $expiresAt = now()->addMinutes(15);

        $user->update([
            'verification_code' => $code,
            'verification_expires_at' => $expiresAt,
        ]);

        \Illuminate\Support\Facades\Log::info("Password change code for logged-in user {$user->email}: {$code}");

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Your Luxury Scent Decants verification code to change your password is: {$code}. It will expire in 15 minutes.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Verify Password Change Request');
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send password change email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'A verification code has been sent to your email address.'
        ]);
    }

    public function logout(): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->isAdmin()) {
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
