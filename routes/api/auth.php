<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

// ── 认证 (无需登录) ─────────────────────────────────────────────
Route::middleware('throttle:login')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// ── 认证 (需要登录) ─────────────────────────────────────────────
Route::middleware(['auth:api', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user-info', [AuthController::class, 'userInfo']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});
