<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\FilterController;
use App\Http\Controllers\Api\V1\InquiryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\UserProfileController;
use App\Http\Controllers\Api\V1\Admin\AdminChatController;
use App\Http\Controllers\Api\V1\Admin\AdminInquiryController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminVolumePricingController;
use App\Http\Controllers\Api\V1\Admin\AdminStatsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:100,1')->group(function () {

    // ─── Authentication Routes ───────────────────────────────────────────────
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth.supabase:required');

    // ─── Public Routes (No Auth) ─────────────────────────────────────────────
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::get('brands', [FilterController::class, 'brands']);
    Route::get('filters', [FilterController::class, 'index']);

    // ─── Customer Routes (Authenticated/Optional) ────────────────────────────
    Route::middleware('auth.supabase:optional')->group(function () {
        Route::post('inquiries', [InquiryController::class, 'store']);

        // Live Chat — open to guests and authenticated users
        Route::post('chat/sessions', [ChatController::class, 'startSession']);
        Route::get('chat/sessions/{sessionId}/messages', [ChatController::class, 'getMessages']);
        Route::post('chat/sessions/{sessionId}/messages', [ChatController::class, 'sendMessage']);
        Route::post('chat/sessions/{sessionId}/escalate', [ChatController::class, 'escalateSession']);
    });

    Route::middleware('auth.supabase:required')->group(function () {
        Route::get('me', [UserProfileController::class, 'show']);
        Route::put('me', [UserProfileController::class, 'update']);
        Route::post('me/logout', [UserProfileController::class, 'logout']);
        
        Route::get('inquiries', [InquiryController::class, 'index']);
        Route::get('inquiries/{id}', [InquiryController::class, 'show']);
    });

    // ─── Admin Routes (Strict Admin Auth) ────────────────────────────────────
    Route::middleware(['auth.supabase:required', 'auth.admin'])->prefix('admin')->group(function () {
        // Inquiry Management
        Route::get('inquiries', [AdminInquiryController::class, 'index']);
        Route::get('inquiries/{id}', [AdminInquiryController::class, 'show']);
        Route::patch('inquiries/{id}/status', [AdminInquiryController::class, 'updateStatus']);

        // Catalog Management
        Route::get('products', [AdminProductController::class, 'index']);
        Route::post('products', [AdminProductController::class, 'store']);
        Route::put('products/{id}', [AdminProductController::class, 'update']);
        Route::patch('products/{id}/toggle', [AdminProductController::class, 'toggleActive']);
        Route::post('products/upload', [AdminProductController::class, 'uploadImage']);
        Route::get('uploads', [AdminProductController::class, 'listUploads']);
        Route::delete('products/{id}', [AdminProductController::class, 'destroy']);

        // Volume Pricing Management
        Route::post('products/{productId}/volumes', [AdminVolumePricingController::class, 'store']);
        Route::put('volumes/{id}', [AdminVolumePricingController::class, 'update']);
        Route::delete('volumes/{id}', [AdminVolumePricingController::class, 'destroy']);

        // Dashboard Stats
        Route::get('stats', [AdminStatsController::class, 'index']);

        // Live Chat Admin
        Route::get('chat/sessions', [AdminChatController::class, 'index']);
        Route::get('chat/sessions/{sessionId}', [AdminChatController::class, 'show']);
        Route::post('chat/sessions/{sessionId}/reply', [AdminChatController::class, 'reply']);
    });
});
