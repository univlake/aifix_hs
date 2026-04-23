<?php

use App\Http\Controllers\Api\V1\ChecklistLibraryController;
use App\Http\Controllers\Api\V1\DangerousCraftTypeController;
use App\Http\Controllers\Api\V1\EnterpriseTypeController;
use App\Http\Controllers\Api\V1\OperationalTypeController;
use App\Http\Controllers\Api\V1\ProcessTypeController;
use App\Http\Controllers\Api\V1\RecordTypeController;
use App\Http\Controllers\Api\V1\RegulationLibraryTypeController;
use App\Http\Controllers\Api\V1\SafetyManagementTypeController;
use App\Http\Controllers\Api\V1\SpaceWorkTypeController;
use App\Http\Controllers\Api\V1\SpecialTypeController;
use Illuminate\Support\Facades\Route;

// ── 字典/类型表 (base-data 权限) ──────────────────────────────────

Route::middleware('permission:base-data.view')->group(function () {
    Route::get('/enterprise-types', [EnterpriseTypeController::class, 'index']);
    Route::get('/operational-types', [OperationalTypeController::class, 'index']);
    Route::get('/record-types', [RecordTypeController::class, 'index']);
    Route::get('/process-types', [ProcessTypeController::class, 'index']);
    Route::get('/special-types', [SpecialTypeController::class, 'index']);
    Route::get('/space-work-types', [SpaceWorkTypeController::class, 'index']);
    Route::get('/safety-management-types', [SafetyManagementTypeController::class, 'index']);
    Route::get('/dangerous-craft-types', [DangerousCraftTypeController::class, 'index']);
    Route::get('/regulation-library-types', [RegulationLibraryTypeController::class, 'index']);
});

// 检查表库 — 使用独立权限命名（checklist-libraries.*）以与前端 gate 对齐
Route::middleware('permission:checklist-libraries.list')->group(function () {
    Route::get('/checklist-libraries', [ChecklistLibraryController::class, 'index']);
    Route::get('/checklist-libraries/export', [ChecklistLibraryController::class, 'export']);
});

Route::middleware('permission:base-data.manage')->group(function () {
    // 企业类型
    Route::post('/enterprise-types', [EnterpriseTypeController::class, 'store']);
    Route::put('/enterprise-types/{id}', [EnterpriseTypeController::class, 'update']);
    Route::patch('/enterprise-types/{id}', [EnterpriseTypeController::class, 'update']);
    Route::delete('/enterprise-types/{id}', [EnterpriseTypeController::class, 'destroy']);

    // 经营类型
    Route::post('/operational-types', [OperationalTypeController::class, 'store']);
    Route::put('/operational-types/{id}', [OperationalTypeController::class, 'update']);
    Route::patch('/operational-types/{id}', [OperationalTypeController::class, 'update']);
    Route::delete('/operational-types/{id}', [OperationalTypeController::class, 'destroy']);

    // 备案/许可类型
    Route::post('/record-types', [RecordTypeController::class, 'store']);
    Route::put('/record-types/{id}', [RecordTypeController::class, 'update']);
    Route::patch('/record-types/{id}', [RecordTypeController::class, 'update']);
    Route::delete('/record-types/{id}', [RecordTypeController::class, 'destroy']);

    // 工艺类型
    Route::post('/process-types', [ProcessTypeController::class, 'store']);
    Route::put('/process-types/{id}', [ProcessTypeController::class, 'update']);
    Route::patch('/process-types/{id}', [ProcessTypeController::class, 'update']);
    Route::delete('/process-types/{id}', [ProcessTypeController::class, 'destroy']);

    // 特种设备类型
    Route::post('/special-types', [SpecialTypeController::class, 'store']);
    Route::put('/special-types/{id}', [SpecialTypeController::class, 'update']);
    Route::patch('/special-types/{id}', [SpecialTypeController::class, 'update']);
    Route::delete('/special-types/{id}', [SpecialTypeController::class, 'destroy']);

    // 作业类型
    Route::post('/space-work-types', [SpaceWorkTypeController::class, 'store']);
    Route::put('/space-work-types/{id}', [SpaceWorkTypeController::class, 'update']);
    Route::patch('/space-work-types/{id}', [SpaceWorkTypeController::class, 'update']);
    Route::delete('/space-work-types/{id}', [SpaceWorkTypeController::class, 'destroy']);

    // 安全管理人员类型
    Route::post('/safety-management-types', [SafetyManagementTypeController::class, 'store']);
    Route::put('/safety-management-types/{id}', [SafetyManagementTypeController::class, 'update']);
    Route::patch('/safety-management-types/{id}', [SafetyManagementTypeController::class, 'update']);
    Route::delete('/safety-management-types/{id}', [SafetyManagementTypeController::class, 'destroy']);

    // 危险工艺类型
    Route::post('/dangerous-craft-types', [DangerousCraftTypeController::class, 'store']);
    Route::put('/dangerous-craft-types/{id}', [DangerousCraftTypeController::class, 'update']);
    Route::patch('/dangerous-craft-types/{id}', [DangerousCraftTypeController::class, 'update']);
    Route::delete('/dangerous-craft-types/{id}', [DangerousCraftTypeController::class, 'destroy']);

    // 法规库分类
    Route::post('/regulation-library-types', [RegulationLibraryTypeController::class, 'store']);
    Route::put('/regulation-library-types/{id}', [RegulationLibraryTypeController::class, 'update']);
    Route::patch('/regulation-library-types/{id}', [RegulationLibraryTypeController::class, 'update']);
    Route::delete('/regulation-library-types/{id}', [RegulationLibraryTypeController::class, 'destroy']);
});

Route::middleware('permission:checklist-libraries.create')->group(function () {
    Route::post('/checklist-libraries', [ChecklistLibraryController::class, 'store']);
});
Route::middleware('permission:checklist-libraries.update')->group(function () {
    Route::put('/checklist-libraries/{id}', [ChecklistLibraryController::class, 'update']);
    Route::patch('/checklist-libraries/{id}', [ChecklistLibraryController::class, 'update']);
});
Route::middleware('permission:checklist-libraries.delete')->group(function () {
    Route::delete('/checklist-libraries/{id}', [ChecklistLibraryController::class, 'destroy']);
});
