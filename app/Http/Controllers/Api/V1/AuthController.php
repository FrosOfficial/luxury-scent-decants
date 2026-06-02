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
