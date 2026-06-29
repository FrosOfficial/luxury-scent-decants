<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\JWK;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SupabaseAuthMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $guard = 'required'): Response
    {
        $authorization = $request->header('Authorization');

        if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
            if ($guard === 'optional') {
                return $next($request);
            }
            return response()->json(['message' => 'Unauthenticated. Missing or invalid Authorization header.'], 401);
        }

        $token = substr($authorization, 7);
        $jwtSecret = config('supabase.jwt_secret');

        if (!$jwtSecret) {
            return response()->json(['message' => 'Server configuration error: JWT secret not set.'], 500);
        }

        try {
            // Set leeway to 60 seconds to account for clock skew/drift between the local machine and Supabase servers
            JWT::$leeway = 60;

            // Determine the token algorithm from its header
            $alg = 'HS256';
            $parts = explode('.', $token);
            if (count($parts) >= 1) {
                $header = json_decode(base64_decode($parts[0]));
                if (isset($header->alg)) {
                    $alg = $header->alg;
                }
            }

            if ($alg === 'ES256') {
                // Fetch and parse the JWKS keys from the Supabase well-known endpoint
                $jwks = \Illuminate\Support\Facades\Cache::remember('supabase_jwks', 86400, function () {
                    $url = rtrim(config('supabase.url'), '/') . '/auth/v1/.well-known/jwks.json';
                    return \Illuminate\Support\Facades\Http::get($url)->json();
                });

                if (!$jwks) {
                    throw new Exception('Unable to fetch Supabase JWKS from endpoint.');
                }

                $keyset = JWK::parseKeySet($jwks);
                $decoded = JWT::decode($token, $keyset);
            } else {
                // Symmetric HS256 validation (original behavior / testing compatibility)
                $decodedKey = base64_decode($jwtSecret, true);
                if ($decodedKey === false) {
                    $decodedKey = $jwtSecret;
                }

                try {
                    // Decode the JWT using Firebase JWT library
                    $decoded = JWT::decode($token, new Key($decodedKey, 'HS256'));
                } catch (Exception $e) {
                    // If decoding fails, retry with the raw secret as a fallback (useful for tests)
                    if ($decodedKey !== $jwtSecret) {
                        $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
                    } else {
                        throw $e;
                    }
                }
            }

            // The 'sub' claim contains the Supabase auth user ID (UUID)
            $supabaseAuthId = $decoded->sub ?? null;

            if (!$supabaseAuthId) {
                return response()->json(['message' => 'Invalid token payload: missing sub claim.'], 401);
            }

            // Sync the user with our local database
            $user = User::where('supabase_auth_id', $supabaseAuthId)->first();

            if (!$user) {
                // Get email and full name from JWT metadata if available
                $email = $decoded->email ?? null;
                $fullName = $decoded->user_metadata->full_name ?? null;

                if (!$email) {
                    return response()->json(['message' => 'Invalid token payload: missing email.'], 401);
                }

                // If this is the admin email, associate it or create as admin, otherwise customer
                $adminEmail = config('supabase.admin_email') ?: 'admin@luxuryscentdecants.com';
                $isAdmin = (strtolower($email) === strtolower($adminEmail));

                // Look up by email first, to see if they were pre-seeded (like the admin)
                $user = User::where('email', $email)->first();

                $fullNameStr = $fullName ?? explode('@', $email)[0];
                $nameParts = explode(' ', trim($fullNameStr));
                $lastName = count($nameParts) > 1 ? array_pop($nameParts) : '';
                $firstName = implode(' ', $nameParts);
                $middleInitial = null;
                if (empty($firstName)) {
                    $firstName = $lastName;
                    $lastName = '';
                }

                if ($user) {
                    // Update their supabase_auth_id and name details if missing
                    $user->update([
                        'supabase_auth_id' => $supabaseAuthId,
                        'first_name' => $user->first_name ?: $firstName,
                        'last_name' => $user->last_name ?: $lastName,
                        'middle_initial' => $user->middle_initial ?: $middleInitial,
                    ]);
                } else {
                    // Create new user
                    $user = User::create([
                        'supabase_auth_id' => $supabaseAuthId,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'middle_initial' => $middleInitial,
                        'email' => $email,
                    ]);
                }

                if ($isAdmin) {
                    \App\Models\Admin::updateOrCreate(
                        ['email' => $email],
                        [
                            'supabase_auth_id' => $supabaseAuthId,
                            'first_name' => $user->first_name ?: $firstName,
                            'last_name' => $user->last_name ?: $lastName,
                            'middle_initial' => $user->middle_initial ?: $middleInitial,
                        ]
                    );
                }
            }

            // Set the authenticated user on the request context
            Auth::setUser($user);
            $request->setUserResolver(fn () => $user);

            // Handle concurrent admin session lock
            if ($user->isAdmin() && !$request->is('*/me/logout')) {
                $sessionId = $decoded->sid ?? md5($token);
                $activeSessionId = $user->current_session_id;
                $lastActiveAt = $user->last_active_at ?? 0;

                // If it is a different session and the session has not expired (active within 10 minutes)
                if ($activeSessionId && $activeSessionId !== $sessionId && (time() - $lastActiveAt < 600)) {
                    return response()->json([
                        'message' => 'This account is being used by another admin.'
                    ], 409);
                }

                // Update the active session in database
                $user->update([
                    'current_session_id' => $sessionId,
                    'last_active_at' => time()
                ]);
            }

        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Supabase Auth Middleware failure: ' . $e->getMessage(), [
                'token_snippet' => isset($token) ? substr($token, 0, 15) . '...' : 'none',
                'secret_len' => isset($jwtSecret) ? strlen($jwtSecret) : 0,
                'decoded_key_len' => isset($decodedKey) && $decodedKey !== false ? strlen($decodedKey) : 0,
            ]);
            if ($guard === 'optional') {
                return $next($request);
            }
            return response()->json([
                'message' => 'Unauthenticated. Token is invalid or expired.',
                'error' => $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}
