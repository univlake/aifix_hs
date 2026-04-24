<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CompanyController;
use Illuminate\Support\Facades\Route;

// ── 公开接口 (无需登录) ──────────────────────────────────────────
Route::get('/public-key', [AuthController::class, 'publicKey']);
Route::get('/companies-public', [CompanyController::class, 'publicList']);

Route::middleware('throttle:login')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// ── 认证 (需要登录) ─────────────────────────────────────────────
Route::middleware(['auth:api', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user-info', [AuthController::class, 'userInfo']);
    Route::put('/user-info', [AuthController::class, 'updateUserInfo']);
    Route::get('/username-availability', [AuthController::class, 'checkUsernameAvailability']);
    Route::post('/first-login-setup', [AuthController::class, 'firstLoginSetup']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});
