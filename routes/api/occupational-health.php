<?php

use App\Http\Controllers\Api\V1\HealthCheckupController;
use App\Http\Controllers\Api\V1\HealthFileController;
use App\Http\Controllers\Api\V1\HealthReportController;
use App\Http\Controllers\Api\V1\HealthSystemController;
use App\Http\Controllers\Api\V1\HygieneEvaluationController;
use App\Http\Controllers\Api\V1\OccupationalHazardController;
use Illuminate\Support\Facades\Route;

// ── 职业危害清单 ─────────────────────────────────────────────────────
Route::middleware('permission:occupational-hazards.list')->group(function () {
    Route::get('/occupational-hazards', [OccupationalHazardController::class, 'index']);
    Route::get('/occupational-hazards/{id}', [OccupationalHazardController::class, 'show']);
    Route::get('/occupational-hazards-export', [OccupationalHazardController::class, 'export']);
    Route::get('/occupational-hazards-template', [OccupationalHazardController::class, 'template']);
});
Route::middleware('permission:occupational-hazards.create')->group(function () {
    Route::post('/occupational-hazards', [OccupationalHazardController::class, 'store']);
    Route::post('/occupational-hazards-import', [OccupationalHazardController::class, 'import']);
});
Route::middleware('permission:occupational-hazards.update')->group(function () {
    Route::put('/occupational-hazards/{id}', [OccupationalHazardController::class, 'update']);
});
Route::middleware('permission:occupational-hazards.delete')->group(function () {
    Route::delete('/occupational-hazards/{id}', [OccupationalHazardController::class, 'destroy']);
});

// ── 职业健康体系 ─────────────────────────────────────────────────────
Route::middleware('permission:health-systems.list')->group(function () {
    Route::get('/health-systems', [HealthSystemController::class, 'index']);
});
Route::middleware('permission:health-systems.create')->group(function () {
    Route::post('/health-systems', [HealthSystemController::class, 'store']);
});
Route::middleware('permission:health-systems.update')->group(function () {
    Route::put('/health-systems/{id}', [HealthSystemController::class, 'update']);
});

// ── 健康档案 ─────────────────────────────────────────────────────
Route::middleware('permission:health-files.list')->group(function () {
    Route::get('/health-files', [HealthFileController::class, 'index']);
    Route::get('/health-files/{id}', [HealthFileController::class, 'show']);
    Route::get('/health-files-export', [HealthFileController::class, 'export']);
    Route::get('/health-files-template', [HealthFileController::class, 'template']);
});
Route::middleware('permission:health-files.create')->group(function () {
    Route::post('/health-files', [HealthFileController::class, 'store']);
    Route::post('/health-files-import', [HealthFileController::class, 'import']);
});
Route::middleware('permission:health-files.update')->group(function () {
    Route::put('/health-files/{id}', [HealthFileController::class, 'update']);
});
Route::middleware('permission:health-files.delete')->group(function () {
    Route::delete('/health-files/{id}', [HealthFileController::class, 'destroy']);
});

// ── 职业病报告 ─────────────────────────────────────────────────────
Route::middleware('permission:health-reports.list')->group(function () {
    Route::get('/health-reports', [HealthReportController::class, 'index']);
    Route::get('/health-reports/{id}', [HealthReportController::class, 'show']);
});
Route::middleware('permission:health-reports.create')->group(function () {
    Route::post('/health-reports', [HealthReportController::class, 'store']);
});
Route::middleware('permission:health-reports.update')->group(function () {
    Route::put('/health-reports/{id}', [HealthReportController::class, 'update']);
});
Route::middleware('permission:health-reports.delete')->group(function () {
    Route::delete('/health-reports/{id}', [HealthReportController::class, 'destroy']);
});

// ── 职业健康体检 ─────────────────────────────────────────────────────
Route::middleware('permission:health-checkups.list')->group(function () {
    Route::get('/health-checkups', [HealthCheckupController::class, 'index']);
    Route::get('/health-checkups/{id}', [HealthCheckupController::class, 'show']);
});
Route::middleware('permission:health-checkups.create')->group(function () {
    Route::post('/health-checkups', [HealthCheckupController::class, 'store']);
});
Route::middleware('permission:health-checkups.update')->group(function () {
    Route::put('/health-checkups/{id}', [HealthCheckupController::class, 'update']);
});
Route::middleware('permission:health-checkups.delete')->group(function () {
    Route::delete('/health-checkups/{id}', [HealthCheckupController::class, 'destroy']);
});

// ── 职业卫生评价 ─────────────────────────────────────────────────────
Route::middleware('permission:hygiene-evaluations.list')->group(function () {
    Route::get('/hygiene-evaluations', [HygieneEvaluationController::class, 'index']);
    Route::get('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'show']);
});
Route::middleware('permission:hygiene-evaluations.create')->group(function () {
    Route::post('/hygiene-evaluations', [HygieneEvaluationController::class, 'store']);
});
Route::middleware('permission:hygiene-evaluations.update')->group(function () {
    Route::put('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'update']);
});
Route::middleware('permission:hygiene-evaluations.delete')->group(function () {
    Route::delete('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'destroy']);
});
