<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supabase Configuration
    |--------------------------------------------------------------------------
    |
    | These values are used for Supabase Auth JWT validation and API calls.
    | The JWT secret is found in Supabase Dashboard > Settings > API > JWT Secret.
    |
    */

    'url' => env('SUPABASE_URL', ''),

    'anon_key' => env('SUPABASE_ANON_KEY', ''),

    'jwt_secret' => env('SUPABASE_JWT_SECRET', ''),

    'facebook_page_id' => env('FACEBOOK_PAGE_ID', 'LuxuryScentDecants'),

    'admin_email' => env('ADMIN_EMAIL', ''),

];
