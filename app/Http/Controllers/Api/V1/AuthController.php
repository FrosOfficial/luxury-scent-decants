<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    /**
     * Helper to generate a compatible JWT token.
     */
    private function generateToken(User $user): string
    {
        $jwtSecret = config('supabase.jwt_secret');
        if (!$jwtSecret) {
            // Fallback for testing/local if configuration not loaded yet
            $jwtSecret = env('SUPABASE_JWT_SECRET', 'secret');
        }

        $sid = (string) Str::uuid();

        // Register the new session in the database immediately for admins to prevent concurrent session locking
        if ($user->isAdmin()) {
            $user->update([
                'current_session_id' => $sid,
                'last_active_at' => time(),
            ]);
        }

        $payload = [
            'iss' => 'luxury-scent-decants-api',
            'sub' => $user->supabase_auth_id,
            'email' => $user->email,
            'user_metadata' => [
                'full_name' => $user->full_name,
            ],
            'sid' => $sid,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 30), // 30 days
        ];

        return JWT::encode($payload, $jwtSecret, 'HS256');
    }

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:10',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $badWords = [
            'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'cock', 'whore', 'slut', 
            'troll', 'fake', 'spam', 'test', 'dummy', 'asdf', 'qwerty',
            'putangina', 'putang ina', 'gago', 'tarantado', 'tanga', 'ulol', 'bobo', 'hayop', 'tae'
        ];

        $trollDomains = [
            'mailinator.com', 'yopmail.com', '10minutemail.com', 'tempmail.com', 
            'trashmail.com', 'guerrillamail.com', 'sharklasers.com', 'getairmail.com', 
            'dispostable.com', 'burnmailer.com'
        ];

        $errors = [];

        // Check name
        $nameLower = strtolower(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? ''));
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['first_name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
                break;
            }
        }

        // Check email
        $emailLower = strtolower($validated['email'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($emailLower, $word)) {
                $errors['email'] = ['Prohibited or invalid email address detected.'];
                break;
            }
        }
        if (empty($errors['email'])) {
            foreach ($trollDomains as $domain) {
                if (str_ends_with($emailLower, '@' . $domain) || str_contains($emailLower, '@' . $domain)) {
                    $errors['email'] = ['Prohibited or temporary email provider detected. Please use a valid email address.'];
                    break;
                }
            }
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }

        $adminEmail = config('supabase.admin_email') ?: 'admin@luxuryscentdecants.com';
        $isAdmin = (strtolower($validated['email']) === strtolower($adminEmail));

        $user = User::create([
            'supabase_auth_id' => (string) Str::uuid(),
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'middle_initial' => $validated['middle_initial'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'verification_code' => $isAdmin ? null : strval(rand(100000, 999999)),
            'verification_expires_at' => $isAdmin ? null : now()->addMinutes(15),
            'email_verified_at' => $isAdmin ? now() : null,
        ]);

        if ($isAdmin) {
            \App\Models\Admin::updateOrCreate(
                ['email' => $validated['email']],
                [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'middle_initial' => $validated['middle_initial'] ?? null,
                    'password' => Hash::make($validated['password']),
                    'supabase_auth_id' => $user->supabase_auth_id,
                ]
            );

            $token = $this->generateToken($user);
            return response()->json([
                'message' => 'Registration successful.',
                'requires_verification' => false,
                'token' => $token,
                'user' => $user,
            ], 201);
        }

        $code = $user->verification_code;
        \Illuminate\Support\Facades\Log::info("Verification code for new user {$user->email}: {$code}");
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Your Luxury Scent Decants verification code is: {$code}. It will expire in 15 minutes.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Verify your Luxury Scent Decants Account');
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Registration successful. Please verify your email with the 6-digit code sent to you.',
            'requires_verification' => true,
            'email' => $user->email,
        ], 201);
    }

    /**
     * Verify email with 6-digit code.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.'], 400);
        }

        if ($user->verification_code !== $validated['code']) {
            return response()->json([
                'errors' => [
                    'code' => ['The verification code you entered is invalid.']
                ]
            ], 422);
        }

        if (now()->greaterThan($user->verification_expires_at)) {
            return response()->json([
                'errors' => [
                    'code' => ['The verification code has expired. Please request a new one.']
                ]
            ], 422);
        }

        // Mark as verified
        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_expires_at' => null,
        ]);

        $token = $this->generateToken($user);

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Resend verification code.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.'], 400);
        }

        $code = strval(rand(100000, 999999));
        $expiresAt = now()->addMinutes(15);

        $user->update([
            'verification_code' => $code,
            'verification_expires_at' => $expiresAt,
        ]);

        \Illuminate\Support\Facades\Log::info("Resent verification code for {$user->email}: {$code}");

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Your new Luxury Scent Decants verification code is: {$code}. It will expire in 15 minutes.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Verify your Luxury Scent Decants Account');
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to resend verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'A new verification code has been sent to your email.'
        ]);
    }

    /**
     * Login a user.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        // Check if email is verified
        if ($user->email_verified_at === null) {
            if ($user->isAdmin()) {
                $user->update([
                    'email_verified_at' => now(),
                    'verification_code' => null,
                    'verification_expires_at' => null,
                ]);
            } else {
                $code = strval(rand(100000, 999999));
                $expiresAt = now()->addMinutes(15);
                $user->update([
                    'verification_code' => $code,
                    'verification_expires_at' => $expiresAt,
                ]);

                \Illuminate\Support\Facades\Log::info("Auto-sent verification code for unverified login {$user->email}: {$code}");
                try {
                    \Illuminate\Support\Facades\Mail::raw(
                        "Your Luxury Scent Decants verification code is: {$code}. It will expire in 15 minutes.",
                        function ($message) use ($user) {
                            $message->to($user->email)
                                    ->subject('Verify your Luxury Scent Decants Account');
                        }
                    );
                } catch (\Exception $e) {
                    // Log error
                }

                return response()->json([
                    'message' => 'Your email address is not verified. A verification code has been sent to your email.',
                    'requires_verification' => true,
                    'email' => $user->email,
                ], 403);
            }
        }

        // Handle concurrent admin session lock during login
        if ($user->isAdmin()) {
            $activeSessionId = $user->current_session_id;
            $lastActiveAt = $user->last_active_at ?? 0;

            if ($activeSessionId && (time() - $lastActiveAt < 600)) {
                return response()->json([
                    'message' => 'This account is being used by another admin.'
                ], 409);
            }
        }

        // Generate supabase_auth_id if not present
        if (!$user->supabase_auth_id) {
            $user->update([
                'supabase_auth_id' => (string) Str::uuid()
            ]);
        }

        $token = $this->generateToken($user);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Send password reset verification code.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'Email address not found.'], 404);
        }

        $code = strval(rand(100000, 999999));
        $expiresAt = now()->addMinutes(15);

        $user->update([
            'verification_code' => $code,
            'verification_expires_at' => $expiresAt,
        ]);

        \Illuminate\Support\Facades\Log::info("Password reset code for {$user->email}: {$code}");

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Your Luxury Scent Decants password reset code is: {$code}. It will expire in 15 minutes.",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Reset your Luxury Scent Decants Password');
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send reset email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'A 6-digit password reset code has been sent to your email.'
        ]);
    }

    /**
     * Reset password using verification code.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($user->verification_code !== $validated['code']) {
            return response()->json([
                'errors' => [
                    'code' => ['The reset code you entered is invalid.']
                ]
            ], 422);
        }

        if (now()->greaterThan($user->verification_expires_at)) {
            return response()->json([
                'errors' => [
                    'code' => ['The reset code has expired. Please request a new one.']
                ]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password']),
            'verification_code' => null,
            'verification_expires_at' => null,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]);

        // Sync to Admin table if admin
        if ($user->isAdmin()) {
            \App\Models\Admin::where('email', $user->email)->update([
                'password' => $user->password
            ]);
        }

        return response()->json([
            'message' => 'Password reset successfully.',
        ]);
    }

    /**
     * Logout a user.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user && $user->isAdmin()) {
            $user->update([
                'current_session_id' => null,
                'last_active_at' => null,
            ]);
        }

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }
}
