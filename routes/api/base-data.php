<?php

use App\Http\Controllers\Api\V1\ChecklistLibraryController;
use App\Http\Controllers\Api\V1\DangerousCraftTypeController;
use App\Http\Controllers\Api\V1\ProcessTypeController;
use App\Http\Controllers\Api\V1\RegulationLibraryTypeController;
use App\Http\Controllers\Api\V1\ReportConfigController;
use App\Http\Controllers\Api\V1\SafetyManagementTypeController;
use App\Http\Controllers\Api\V1\SpaceWorkTypeController;
use App\Http\Controllers\Api\V1\SpecialTypeController;
use App\Http\Controllers\Api\V1\TrainingClassTypeController;
use Illuminate\Support\Facades\Route;

// ── 字典/类型表 (base-data 权限) ──────────────────────────────────

Route::middleware('permission:base-data.view')->group(function () {
    Route::get('/dangerous-craft-types', [DangerousCraftTypeController::class, 'index']);
    Route::get('/process-types', [ProcessTypeController::class, 'index']);
    Route::get('/special-types', [SpecialTypeController::class, 'index']);
    Route::get('/space-work-types', [SpaceWorkTypeController::class, 'index']);
    Route::get('/safety-management-types', [SafetyManagementTypeController::class, 'index']);
    Route::get('/regulation-library-types', [RegulationLibraryTypeController::class, 'index']);
    Route::get('/training-class-types', [TrainingClassTypeController::class, 'index']);
    Route::get('/checklist-libraries', [ChecklistLibraryController::class, 'index']);
    Route::get('/report-configs', [ReportConfigController::class, 'index']);
});

Route::middleware('permission:base-data.manage')->group(function () {
    Route::post('/dangerous-craft-types', [DangerousCraftTypeController::class, 'store']);
    Route::put('/dangerous-craft-types/{id}', [DangerousCraftTypeController::class, 'update']);
    Route::patch('/dangerous-craft-types/{id}', [DangerousCraftTypeController::class, 'update']);
    Route::delete('/dangerous-craft-types/{id}', [DangerousCraftTypeController::class, 'destroy']);

    Route::post('/process-types', [ProcessTypeController::class, 'store']);
    Route::put('/process-types/{id}', [ProcessTypeController::class, 'update']);
    Route::patch('/process-types/{id}', [ProcessTypeController::class, 'update']);
    Route::delete('/process-types/{id}', [ProcessTypeController::class, 'destroy']);

    Route::post('/special-types', [SpecialTypeController::class, 'store']);
    Route::put('/special-types/{id}', [SpecialTypeController::class, 'update']);
    Route::patch('/special-types/{id}', [SpecialTypeController::class, 'update']);
    Route::delete('/special-types/{id}', [SpecialTypeController::class, 'destroy']);

    Route::post('/space-work-types', [SpaceWorkTypeController::class, 'store']);
    Route::put('/space-work-types/{id}', [SpaceWorkTypeController::class, 'update']);
    Route::patch('/space-work-types/{id}', [SpaceWorkTypeController::class, 'update']);
    Route::delete('/space-work-types/{id}', [SpaceWorkTypeController::class, 'destroy']);

    Route::post('/safety-management-types', [SafetyManagementTypeController::class, 'store']);
    Route::put('/safety-management-types/{id}', [SafetyManagementTypeController::class, 'update']);
    Route::patch('/safety-management-types/{id}', [SafetyManagementTypeController::class, 'update']);
    Route::delete('/safety-management-types/{id}', [SafetyManagementTypeController::class, 'destroy']);

    Route::post('/regulation-library-types', [RegulationLibraryTypeController::class, 'store']);
    Route::put('/regulation-library-types/{id}', [RegulationLibraryTypeController::class, 'update']);
    Route::patch('/regulation-library-types/{id}', [RegulationLibraryTypeController::class, 'update']);
    Route::delete('/regulation-library-types/{id}', [RegulationLibraryTypeController::class, 'destroy']);

    Route::post('/training-class-types', [TrainingClassTypeController::class, 'store']);
    Route::put('/training-class-types/{id}', [TrainingClassTypeController::class, 'update']);
    Route::patch('/training-class-types/{id}', [TrainingClassTypeController::class, 'update']);
    Route::delete('/training-class-types/{id}', [TrainingClassTypeController::class, 'destroy']);

    Route::post('/checklist-libraries', [ChecklistLibraryController::class, 'store']);
    Route::put('/checklist-libraries/{id}', [ChecklistLibraryController::class, 'update']);
    Route::patch('/checklist-libraries/{id}', [ChecklistLibraryController::class, 'update']);
    Route::delete('/checklist-libraries/{id}', [ChecklistLibraryController::class, 'destroy']);

    Route::post('/report-configs', [ReportConfigController::class, 'store']);
    Route::put('/report-configs/{id}', [ReportConfigController::class, 'update']);
    Route::patch('/report-configs/{id}', [ReportConfigController::class, 'update']);
    Route::delete('/report-configs/{id}', [ReportConfigController::class, 'destroy']);
});
