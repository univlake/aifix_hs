<?php

use App\Http\Controllers\Api\V1\DangerousEquipmentController;
use App\Http\Controllers\Api\V1\HazardousChemicalController;
use App\Http\Controllers\Api\V1\HazardousProcessController;
use App\Http\Controllers\Api\V1\MajorHazardController;
use App\Http\Controllers\Api\V1\MajorHazardousProcessController;
use App\Http\Controllers\Api\V1\SpaceWorkController;
use App\Http\Controllers\Api\V1\SpecialEquipmentController;
use App\Http\Controllers\Api\V1\SpecialEquipmentStaffController;
use Illuminate\Support\Facades\Route;

// ── 特种设备 ─────────────────────────────────────────────────────
// Static routes must come before {id} wildcard
Route::middleware('permission:special-equipment.create')->group(function () {
    Route::get('/special-equipment/template', [SpecialEquipmentController::class, 'template']);
    Route::post('/special-equipment/import', [SpecialEquipmentController::class, 'import']);
    Route::post('/special-equipment/copy', [SpecialEquipmentController::class, 'copy']);
});
Route::middleware('permission:special-equipment.list')->group(function () {
    Route::get('/special-equipment/export', [SpecialEquipmentController::class, 'export']);
    Route::get('/special-equipment', [SpecialEquipmentController::class, 'index']);
    Route::get('/special-equipment/{id}', [SpecialEquipmentController::class, 'show']);
});
Route::middleware('permission:special-equipment.create')->group(function () {
    Route::post('/special-equipment', [SpecialEquipmentController::class, 'store']);
});
Route::middleware('permission:special-equipment.update')->group(function () {
    Route::put('/special-equipment/{id}', [SpecialEquipmentController::class, 'update']);
});
Route::middleware('permission:special-equipment.delete')->group(function () {
    Route::delete('/special-equipment/{id}', [SpecialEquipmentController::class, 'destroy']);
});

// ── 特种设备人员 ─────────────────────────────────────────────────────
Route::middleware('permission:special-equipment-staff.create')->group(function () {
    Route::get('/special-equipment-staff/template', [SpecialEquipmentStaffController::class, 'template']);
    Route::post('/special-equipment-staff/import', [SpecialEquipmentStaffController::class, 'import']);
});
Route::middleware('permission:special-equipment-staff.list')->group(function () {
    Route::get('/special-equipment-staff', [SpecialEquipmentStaffController::class, 'index']);
    Route::get('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'show']);
});
Route::middleware('permission:special-equipment-staff.create')->group(function () {
    Route::post('/special-equipment-staff', [SpecialEquipmentStaffController::class, 'store']);
});
Route::middleware('permission:special-equipment-staff.update')->group(function () {
    Route::put('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'update']);
});
Route::middleware('permission:special-equipment-staff.delete')->group(function () {
    Route::delete('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'destroy']);
});

// ── 主要危险设备 ─────────────────────────────────────────────────────
// Static routes must come before {id} wildcard
Route::middleware('permission:dangerous-equipment.create')->group(function () {
    Route::get('/dangerous-equipment/template', [DangerousEquipmentController::class, 'template']);
    Route::post('/dangerous-equipment/import', [DangerousEquipmentController::class, 'import']);
    Route::post('/dangerous-equipment/copy', [DangerousEquipmentController::class, 'copy']);
});
Route::middleware('permission:dangerous-equipment.list')->group(function () {
    Route::get('/dangerous-equipment/export', [DangerousEquipmentController::class, 'export']);
    Route::get('/dangerous-equipment', [DangerousEquipmentController::class, 'index']);
    Route::get('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'show']);
});
Route::middleware('permission:dangerous-equipment.create')->group(function () {
    Route::post('/dangerous-equipment', [DangerousEquipmentController::class, 'store']);
});
Route::middleware('permission:dangerous-equipment.update')->group(function () {
    Route::put('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'update']);
});
Route::middleware('permission:dangerous-equipment.delete')->group(function () {
    Route::delete('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'destroy']);
});

// ── 危险化学品 ─────────────────────────────────────────────────────
Route::middleware('permission:hazardous-chemicals.list')->group(function () {
    Route::get('/hazardous-chemicals', [HazardousChemicalController::class, 'index']);
    Route::get('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'show']);
});
Route::middleware('permission:hazardous-chemicals.create')->group(function () {
    Route::post('/hazardous-chemicals', [HazardousChemicalController::class, 'store']);
});
Route::middleware('permission:hazardous-chemicals.update')->group(function () {
    Route::put('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'update']);
});
Route::middleware('permission:hazardous-chemicals.delete')->group(function () {
    Route::delete('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'destroy']);
});

// ── 危险化工工艺 ─────────────────────────────────────────────────────
Route::middleware('permission:hazardous-processes.list')->group(function () {
    Route::get('/hazardous-processes', [HazardousProcessController::class, 'index']);
    Route::get('/hazardous-processes/{id}', [HazardousProcessController::class, 'show']);
});
Route::middleware('permission:hazardous-processes.create')->group(function () {
    Route::post('/hazardous-processes', [HazardousProcessController::class, 'store']);
});
Route::middleware('permission:hazardous-processes.update')->group(function () {
    Route::put('/hazardous-processes/{id}', [HazardousProcessController::class, 'update']);
});
Route::middleware('permission:hazardous-processes.delete')->group(function () {
    Route::delete('/hazardous-processes/{id}', [HazardousProcessController::class, 'destroy']);
});

// ── 重大危险源 ─────────────────────────────────────────────────────
Route::middleware('permission:major-hazards.list')->group(function () {
    Route::get('/major-hazards', [MajorHazardController::class, 'index']);
    Route::get('/major-hazards/{id}', [MajorHazardController::class, 'show']);
});
Route::middleware('permission:major-hazards.create')->group(function () {
    Route::post('/major-hazards', [MajorHazardController::class, 'store']);
});
Route::middleware('permission:major-hazards.update')->group(function () {
    Route::put('/major-hazards/{id}', [MajorHazardController::class, 'update']);
});
Route::middleware('permission:major-hazards.delete')->group(function () {
    Route::delete('/major-hazards/{id}', [MajorHazardController::class, 'destroy']);
});

// ── 重点监管危险化工工艺 ─────────────────────────────────────────────────────
Route::middleware('permission:major-hazardous-processes.list')->group(function () {
    Route::get('/major-hazardous-processes', [MajorHazardousProcessController::class, 'index']);
    Route::get('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'show']);
});
Route::middleware('permission:major-hazardous-processes.create')->group(function () {
    Route::post('/major-hazardous-processes', [MajorHazardousProcessController::class, 'store']);
});
Route::middleware('permission:major-hazardous-processes.update')->group(function () {
    Route::put('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'update']);
});
Route::middleware('permission:major-hazardous-processes.delete')->group(function () {
    Route::delete('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'destroy']);
});

// ── 有限空间作业 ─────────────────────────────────────────────────────
Route::middleware('permission:space-works.list')->group(function () {
    Route::get('/space-works', [SpaceWorkController::class, 'index']);
    Route::get('/space-works/{id}', [SpaceWorkController::class, 'show']);
});
Route::middleware('permission:space-works.create')->group(function () {
    Route::post('/space-works', [SpaceWorkController::class, 'store']);
});
Route::middleware('permission:space-works.update')->group(function () {
    Route::put('/space-works/{id}', [SpaceWorkController::class, 'update']);
});
Route::middleware('permission:space-works.delete')->group(function () {
    Route::delete('/space-works/{id}', [SpaceWorkController::class, 'destroy']);
});
