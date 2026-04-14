<?php

use App\Http\Controllers\Api\V1\AccidentChecksController;
use App\Http\Controllers\Api\V1\AccidentCheckTemplatesController;
use App\Http\Controllers\Api\V1\AddPointsController;
use App\Http\Controllers\Api\V1\AddPointsTemplatesController;
use App\Http\Controllers\Api\V1\CheckStatisticsController;
use App\Http\Controllers\Api\V1\DailyChecksController;
use App\Http\Controllers\Api\V1\DailyCheckTemplatesController;
use App\Http\Controllers\Api\V1\DoubleChecksController;
use App\Http\Controllers\Api\V1\DoubleCheckTemplatesController;
use App\Http\Controllers\Api\V1\NormChecksController;
use App\Http\Controllers\Api\V1\SystemChecksController;
use Illuminate\Support\Facades\Route;

// ── 日常检查模板 ─────────────────────────────────────────────────────
Route::middleware('permission:daily-check-templates.list')->group(function () {
    Route::get('/daily-check-templates', [DailyCheckTemplatesController::class, 'index']);
    Route::get('/daily-check-templates/{id}', [DailyCheckTemplatesController::class, 'show']);
});
Route::middleware('permission:daily-check-templates.create')->group(function () {
    Route::post('/daily-check-templates', [DailyCheckTemplatesController::class, 'store']);
});
Route::middleware('permission:daily-check-templates.update')->group(function () {
    Route::put('/daily-check-templates/{id}', [DailyCheckTemplatesController::class, 'update']);
    Route::patch('/daily-check-templates/{id}', [DailyCheckTemplatesController::class, 'update']);
});
Route::middleware('permission:daily-check-templates.delete')->group(function () {
    Route::delete('/daily-check-templates/{id}', [DailyCheckTemplatesController::class, 'destroy']);
});

// ── 日常检查 ─────────────────────────────────────────────────────
Route::middleware('permission:daily-checks.list')->group(function () {
    Route::get('/daily-checks', [DailyChecksController::class, 'index']);
    Route::get('/daily-checks/{id}', [DailyChecksController::class, 'show']);
});
Route::middleware('permission:daily-checks.create')->group(function () {
    Route::post('/daily-checks', [DailyChecksController::class, 'store']);
});
Route::middleware('permission:daily-checks.update')->group(function () {
    Route::put('/daily-checks/{id}', [DailyChecksController::class, 'update']);
    Route::patch('/daily-checks/{id}', [DailyChecksController::class, 'update']);
});
Route::middleware('permission:daily-checks.delete')->group(function () {
    Route::delete('/daily-checks/{id}', [DailyChecksController::class, 'destroy']);
});

// ── 双重预防检查模板 ─────────────────────────────────────────────────────
Route::middleware('permission:double-check-templates.list')->group(function () {
    Route::get('/double-check-templates', [DoubleCheckTemplatesController::class, 'index']);
    Route::get('/double-check-templates/{id}', [DoubleCheckTemplatesController::class, 'show']);
});
Route::middleware('permission:double-check-templates.create')->group(function () {
    Route::post('/double-check-templates', [DoubleCheckTemplatesController::class, 'store']);
});
Route::middleware('permission:double-check-templates.update')->group(function () {
    Route::put('/double-check-templates/{id}', [DoubleCheckTemplatesController::class, 'update']);
    Route::patch('/double-check-templates/{id}', [DoubleCheckTemplatesController::class, 'update']);
});
Route::middleware('permission:double-check-templates.delete')->group(function () {
    Route::delete('/double-check-templates/{id}', [DoubleCheckTemplatesController::class, 'destroy']);
});

// ── 双重预防检查 ─────────────────────────────────────────────────────
Route::middleware('permission:double-checks.list')->group(function () {
    Route::get('/double-checks', [DoubleChecksController::class, 'index']);
    Route::get('/double-checks/{id}', [DoubleChecksController::class, 'show']);
});
Route::middleware('permission:double-checks.create')->group(function () {
    Route::post('/double-checks', [DoubleChecksController::class, 'store']);
});
Route::middleware('permission:double-checks.update')->group(function () {
    Route::put('/double-checks/{id}', [DoubleChecksController::class, 'update']);
    Route::patch('/double-checks/{id}', [DoubleChecksController::class, 'update']);
});
Route::middleware('permission:double-checks.delete')->group(function () {
    Route::delete('/double-checks/{id}', [DoubleChecksController::class, 'destroy']);
});

// ── 系统检查 ─────────────────────────────────────────────────────
Route::middleware('permission:system-checks.list')->group(function () {
    Route::get('/system-checks', [SystemChecksController::class, 'index']);
    Route::get('/system-checks/{id}', [SystemChecksController::class, 'show']);
});
Route::middleware('permission:system-checks.create')->group(function () {
    Route::post('/system-checks', [SystemChecksController::class, 'store']);
});
Route::middleware('permission:system-checks.update')->group(function () {
    Route::put('/system-checks/{id}', [SystemChecksController::class, 'update']);
    Route::patch('/system-checks/{id}', [SystemChecksController::class, 'update']);
});
Route::middleware('permission:system-checks.delete')->group(function () {
    Route::delete('/system-checks/{id}', [SystemChecksController::class, 'destroy']);
});

// ── 规范检查 ─────────────────────────────────────────────────────
Route::middleware('permission:norm-checks.list')->group(function () {
    Route::get('/norm-checks', [NormChecksController::class, 'index']);
    Route::get('/norm-checks/{id}', [NormChecksController::class, 'show']);
});
Route::middleware('permission:norm-checks.create')->group(function () {
    Route::post('/norm-checks', [NormChecksController::class, 'store']);
});
Route::middleware('permission:norm-checks.update')->group(function () {
    Route::put('/norm-checks/{id}', [NormChecksController::class, 'update']);
    Route::patch('/norm-checks/{id}', [NormChecksController::class, 'update']);
});
Route::middleware('permission:norm-checks.delete')->group(function () {
    Route::delete('/norm-checks/{id}', [NormChecksController::class, 'destroy']);
});

// ── 事故检查模板 ─────────────────────────────────────────────────────
Route::middleware('permission:accident-check-templates.list')->group(function () {
    Route::get('/accident-check-templates', [AccidentCheckTemplatesController::class, 'index']);
    Route::get('/accident-check-templates/{id}', [AccidentCheckTemplatesController::class, 'show']);
});
Route::middleware('permission:accident-check-templates.create')->group(function () {
    Route::post('/accident-check-templates', [AccidentCheckTemplatesController::class, 'store']);
});
Route::middleware('permission:accident-check-templates.update')->group(function () {
    Route::put('/accident-check-templates/{id}', [AccidentCheckTemplatesController::class, 'update']);
    Route::patch('/accident-check-templates/{id}', [AccidentCheckTemplatesController::class, 'update']);
});
Route::middleware('permission:accident-check-templates.delete')->group(function () {
    Route::delete('/accident-check-templates/{id}', [AccidentCheckTemplatesController::class, 'destroy']);
});

// ── 事故检查 ─────────────────────────────────────────────────────
Route::middleware('permission:accident-checks.list')->group(function () {
    Route::get('/accident-checks', [AccidentChecksController::class, 'index']);
    Route::get('/accident-checks/{id}', [AccidentChecksController::class, 'show']);
});
Route::middleware('permission:accident-checks.create')->group(function () {
    Route::post('/accident-checks', [AccidentChecksController::class, 'store']);
});
Route::middleware('permission:accident-checks.update')->group(function () {
    Route::put('/accident-checks/{id}', [AccidentChecksController::class, 'update']);
    Route::patch('/accident-checks/{id}', [AccidentChecksController::class, 'update']);
});
Route::middleware('permission:accident-checks.delete')->group(function () {
    Route::delete('/accident-checks/{id}', [AccidentChecksController::class, 'destroy']);
});

// ── 加分模板 ─────────────────────────────────────────────────────
Route::middleware('permission:add-points-templates.list')->group(function () {
    Route::get('/add-points-templates', [AddPointsTemplatesController::class, 'index']);
    Route::get('/add-points-templates/{id}', [AddPointsTemplatesController::class, 'show']);
});
Route::middleware('permission:add-points-templates.create')->group(function () {
    Route::post('/add-points-templates', [AddPointsTemplatesController::class, 'store']);
});
Route::middleware('permission:add-points-templates.update')->group(function () {
    Route::put('/add-points-templates/{id}', [AddPointsTemplatesController::class, 'update']);
    Route::patch('/add-points-templates/{id}', [AddPointsTemplatesController::class, 'update']);
});
Route::middleware('permission:add-points-templates.delete')->group(function () {
    Route::delete('/add-points-templates/{id}', [AddPointsTemplatesController::class, 'destroy']);
});

// ── 加分检查 ─────────────────────────────────────────────────────
Route::middleware('permission:add-points.list')->group(function () {
    Route::get('/add-points', [AddPointsController::class, 'index']);
    Route::get('/add-points/{id}', [AddPointsController::class, 'show']);
});
Route::middleware('permission:add-points.create')->group(function () {
    Route::post('/add-points', [AddPointsController::class, 'store']);
});
Route::middleware('permission:add-points.update')->group(function () {
    Route::put('/add-points/{id}', [AddPointsController::class, 'update']);
    Route::patch('/add-points/{id}', [AddPointsController::class, 'update']);
});
Route::middleware('permission:add-points.delete')->group(function () {
    Route::delete('/add-points/{id}', [AddPointsController::class, 'destroy']);
});

// ── 检查统计 ─────────────────────────────────────────────────────
Route::middleware('permission:check-statistics.list')->group(function () {
    Route::get('/check-statistics', [CheckStatisticsController::class, 'index']);
});
