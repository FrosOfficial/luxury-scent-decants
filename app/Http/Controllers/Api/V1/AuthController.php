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
        if ($user->role === 'admin') {
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
            'name' => 'required|string|max:255',
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
        $nameLower = strtolower($validated['name'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
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
        $role = (strtolower($validated['email']) === strtolower($adminEmail)) ? 'admin' : 'customer';

        $user = User::create([
            'supabase_auth_id' => (string) Str::uuid(),
            'full_name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
        ]);

        $token = $this->generateToken($user);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
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

        // Handle concurrent admin session lock during login
        if ($user->role === 'admin') {
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
     * Logout a user.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user && $user->role === 'admin') {
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
