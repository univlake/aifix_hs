<?php

use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\CertificateStatusController;
use App\Http\Controllers\Api\V1\ChangeManageController;
use App\Http\Controllers\Api\V1\ConstructionUnitController;
use App\Http\Controllers\Api\V1\DesignUnitController;
use App\Http\Controllers\Api\V1\EliminationControlStaffController;
use App\Http\Controllers\Api\V1\EvaluationUnitController;
use App\Http\Controllers\Api\V1\FilingPermissionsController;
use App\Http\Controllers\Api\V1\JobManagementController;
use App\Http\Controllers\Api\V1\OccupationalHealthSafetyController;
use App\Http\Controllers\Api\V1\ProductionStandardizationController;
use App\Http\Controllers\Api\V1\SafetyArchitectureController;
use App\Http\Controllers\Api\V1\SafetyManagementController;
use App\Http\Controllers\Api\V1\SkillUnitController;
use App\Http\Controllers\Api\V1\TechnicalServiceUnitController;
use App\Http\Controllers\Api\V1\UploadController;
use App\Http\Controllers\Api\V1\UploadOssController;
use Illuminate\Support\Facades\Route;

// ── 建筑管理 ─────────────────────────────────────────────────────
Route::middleware('permission:buildings.list')->group(function () {
    Route::get('/buildings', [BuildingController::class, 'index']);
    Route::get('/buildings/{id}', [BuildingController::class, 'show']);
});
Route::middleware('permission:buildings.create')->group(function () {
    Route::post('/buildings', [BuildingController::class, 'store']);
});
Route::middleware('permission:buildings.update')->group(function () {
    Route::put('/buildings/{id}', [BuildingController::class, 'update']);
    Route::patch('/buildings/{id}', [BuildingController::class, 'update']);
});
Route::middleware('permission:buildings.delete')->group(function () {
    Route::delete('/buildings/{id}', [BuildingController::class, 'destroy']);
});

// ── 作业管理 ─────────────────────────────────────────────────────
Route::middleware('permission:job-management.list')->group(function () {
    Route::get('/job-management', [JobManagementController::class, 'index']);
    Route::get('/job-management/{id}', [JobManagementController::class, 'show']);
});
Route::middleware('permission:job-management.create')->group(function () {
    Route::post('/job-management', [JobManagementController::class, 'store']);
});
Route::middleware('permission:job-management.update')->group(function () {
    Route::put('/job-management/{id}', [JobManagementController::class, 'update']);
    Route::patch('/job-management/{id}', [JobManagementController::class, 'update']);
});
Route::middleware('permission:job-management.delete')->group(function () {
    Route::delete('/job-management/{id}', [JobManagementController::class, 'destroy']);
});

// ── 安全架构 ─────────────────────────────────────────────────────
Route::middleware('permission:safety-architectures.list')->group(function () {
    Route::get('/safety-architectures', [SafetyArchitectureController::class, 'index']);
});
Route::middleware('permission:safety-architectures.create')->group(function () {
    Route::post('/safety-architectures', [SafetyArchitectureController::class, 'store']);
});
Route::middleware('permission:safety-architectures.update')->group(function () {
    Route::put('/safety-architectures/{id}', [SafetyArchitectureController::class, 'update']);
    Route::patch('/safety-architectures/{id}', [SafetyArchitectureController::class, 'update']);
});

// ── 安全生产标准化 ─────────────────────────────────────────────────────
Route::middleware('permission:production-standardizations.list')->group(function () {
    Route::get('/production-standardizations', [ProductionStandardizationController::class, 'index']);
});
Route::middleware('permission:production-standardizations.create')->group(function () {
    Route::post('/production-standardizations', [ProductionStandardizationController::class, 'store']);
});
Route::middleware('permission:production-standardizations.update')->group(function () {
    Route::put('/production-standardizations/{id}', [ProductionStandardizationController::class, 'update']);
    Route::patch('/production-standardizations/{id}', [ProductionStandardizationController::class, 'update']);
});

// ── 职业健康安全管理体系 ──────────────────────────────────────────────────
Route::middleware('permission:occupational-health-safeties.list')->group(function () {
    Route::get('/occupational-health-safeties', [OccupationalHealthSafetyController::class, 'index']);
});
Route::middleware('permission:occupational-health-safeties.create')->group(function () {
    Route::post('/occupational-health-safeties', [OccupationalHealthSafetyController::class, 'store']);
});
Route::middleware('permission:occupational-health-safeties.update')->group(function () {
    Route::put('/occupational-health-safeties/{id}', [OccupationalHealthSafetyController::class, 'update']);
    Route::patch('/occupational-health-safeties/{id}', [OccupationalHealthSafetyController::class, 'update']);
});

// ── 安全管理人员 ─────────────────────────────────────────────────────
Route::middleware('permission:safety-management.create')->group(function () {
    Route::get('/safety-management/template', [SafetyManagementController::class, 'template']);
    Route::post('/safety-management/import', [SafetyManagementController::class, 'import']);
});
Route::middleware('permission:safety-management.list')->group(function () {
    Route::get('/safety-management', [SafetyManagementController::class, 'index']);
    Route::get('/safety-management/{id}', [SafetyManagementController::class, 'show']);
});
Route::middleware('permission:safety-management.create')->group(function () {
    Route::post('/safety-management', [SafetyManagementController::class, 'store']);
});
Route::middleware('permission:safety-management.update')->group(function () {
    Route::put('/safety-management/{id}', [SafetyManagementController::class, 'update']);
    Route::patch('/safety-management/{id}', [SafetyManagementController::class, 'update']);
});
Route::middleware('permission:safety-management.delete')->group(function () {
    Route::delete('/safety-management/{id}', [SafetyManagementController::class, 'destroy']);
});

// ── 持证情况 ─────────────────────────────────────────────────────
Route::middleware('permission:certificate-statuses.list')->group(function () {
    Route::get('/certificate-statuses', [CertificateStatusController::class, 'index']);
    Route::get('/certificate-statuses/{id}', [CertificateStatusController::class, 'show']);
});
Route::middleware('permission:certificate-statuses.create')->group(function () {
    Route::post('/certificate-statuses', [CertificateStatusController::class, 'store']);
});
Route::middleware('permission:certificate-statuses.update')->group(function () {
    Route::put('/certificate-statuses/{id}', [CertificateStatusController::class, 'update']);
    Route::patch('/certificate-statuses/{id}', [CertificateStatusController::class, 'update']);
});
Route::middleware('permission:certificate-statuses.delete')->group(function () {
    Route::delete('/certificate-statuses/{id}', [CertificateStatusController::class, 'destroy']);
});

// ── 消防控制室人员 (uses elimination_control_staff table) ────────────
Route::middleware('permission:fire-control-room-personnels.create')->group(function () {
    Route::get('/fire-control-room-personnels/template', [EliminationControlStaffController::class, 'template']);
    Route::post('/fire-control-room-personnels/import', [EliminationControlStaffController::class, 'import']);
});
Route::middleware('permission:fire-control-room-personnels.list')->group(function () {
    Route::get('/fire-control-room-personnels', [EliminationControlStaffController::class, 'index']);
    Route::get('/fire-control-room-personnels/{id}', [EliminationControlStaffController::class, 'show']);
});
Route::middleware('permission:fire-control-room-personnels.create')->group(function () {
    Route::post('/fire-control-room-personnels', [EliminationControlStaffController::class, 'store']);
});
Route::middleware('permission:fire-control-room-personnels.update')->group(function () {
    Route::put('/fire-control-room-personnels/{id}', [EliminationControlStaffController::class, 'update']);
    Route::patch('/fire-control-room-personnels/{id}', [EliminationControlStaffController::class, 'update']);
});
Route::middleware('permission:fire-control-room-personnels.delete')->group(function () {
    Route::delete('/fire-control-room-personnels/{id}', [EliminationControlStaffController::class, 'destroy']);
});

// ── 淘汰控制人员 ─────────────────────────────────────────────────────
Route::middleware('permission:elimination-control-staff.list')->group(function () {
    Route::get('/elimination-control-staff', [EliminationControlStaffController::class, 'index']);
    Route::get('/elimination-control-staff/{id}', [EliminationControlStaffController::class, 'show']);
});
Route::middleware('permission:elimination-control-staff.create')->group(function () {
    Route::post('/elimination-control-staff', [EliminationControlStaffController::class, 'store']);
});
Route::middleware('permission:elimination-control-staff.update')->group(function () {
    Route::put('/elimination-control-staff/{id}', [EliminationControlStaffController::class, 'update']);
    Route::patch('/elimination-control-staff/{id}', [EliminationControlStaffController::class, 'update']);
});
Route::middleware('permission:elimination-control-staff.delete')->group(function () {
    Route::delete('/elimination-control-staff/{id}', [EliminationControlStaffController::class, 'destroy']);
});

// ── 技术服务单位 ─────────────────────────────────────────────────────
Route::middleware('permission:skill-units.list')->group(function () {
    Route::get('/skill-units', [SkillUnitController::class, 'index']);
    Route::get('/skill-units/{id}', [SkillUnitController::class, 'show']);
});
Route::middleware('permission:skill-units.create')->group(function () {
    Route::post('/skill-units', [SkillUnitController::class, 'store']);
});
Route::middleware('permission:skill-units.update')->group(function () {
    Route::put('/skill-units/{id}', [SkillUnitController::class, 'update']);
    Route::patch('/skill-units/{id}', [SkillUnitController::class, 'update']);
});
Route::middleware('permission:skill-units.delete')->group(function () {
    Route::delete('/skill-units/{id}', [SkillUnitController::class, 'destroy']);
});

// ── 设计单位 ─────────────────────────────────────────────────────
Route::middleware('permission:design-units.list')->group(function () {
    Route::get('/design-units', [DesignUnitController::class, 'index']);
    Route::get('/design-units/{id}', [DesignUnitController::class, 'show']);
});
Route::middleware('permission:design-units.create')->group(function () {
    Route::post('/design-units', [DesignUnitController::class, 'store']);
});
Route::middleware('permission:design-units.update')->group(function () {
    Route::put('/design-units/{id}', [DesignUnitController::class, 'update']);
    Route::patch('/design-units/{id}', [DesignUnitController::class, 'update']);
});
Route::middleware('permission:design-units.delete')->group(function () {
    Route::delete('/design-units/{id}', [DesignUnitController::class, 'destroy']);
});

// ── 评价单位 ─────────────────────────────────────────────────────
Route::middleware('permission:evaluation-units.list')->group(function () {
    Route::get('/evaluation-units', [EvaluationUnitController::class, 'index']);
    Route::get('/evaluation-units/{id}', [EvaluationUnitController::class, 'show']);
});
Route::middleware('permission:evaluation-units.create')->group(function () {
    Route::post('/evaluation-units', [EvaluationUnitController::class, 'store']);
});
Route::middleware('permission:evaluation-units.update')->group(function () {
    Route::put('/evaluation-units/{id}', [EvaluationUnitController::class, 'update']);
    Route::patch('/evaluation-units/{id}', [EvaluationUnitController::class, 'update']);
});
Route::middleware('permission:evaluation-units.delete')->group(function () {
    Route::delete('/evaluation-units/{id}', [EvaluationUnitController::class, 'destroy']);
});

// ── 变更管理 ─────────────────────────────────────────────────────
Route::middleware('permission:change-manages.list')->group(function () {
    Route::get('/change-manages', [ChangeManageController::class, 'index']);
    Route::get('/change-manages/{id}', [ChangeManageController::class, 'show']);
});
Route::middleware('permission:change-manages.create')->group(function () {
    Route::post('/change-manages', [ChangeManageController::class, 'store']);
});
Route::middleware('permission:change-manages.update')->group(function () {
    Route::put('/change-manages/{id}', [ChangeManageController::class, 'update']);
    Route::patch('/change-manages/{id}', [ChangeManageController::class, 'update']);
});
Route::middleware('permission:change-manages.delete')->group(function () {
    Route::delete('/change-manages/{id}', [ChangeManageController::class, 'destroy']);
});

// ── 文件上传 ─────────────────────────────────────────────────────
Route::middleware('permission:upload.file')->group(function () {
    Route::post('/upload', [UploadController::class, 'upload']);
});
Route::middleware('permission:upload.oss')->group(function () {
    Route::get('/upload/oss-signature', [UploadOssController::class, 'getSignature']);
});
// Generate a pre-signed URL for a private OSS object (no extra permission needed)
Route::get('/upload/oss-sign', [UploadOssController::class, 'signedUrl']);
// OSS callback — no auth middleware, verified by signature
Route::post('/upload/oss-callback', [UploadOssController::class, 'callback']);

// ── 备案/许可管理 ─────────────────────────────────────────────────────
Route::middleware('permission:filing-permissions.list')->group(function () {
    Route::get('/filing-permissions', [FilingPermissionsController::class, 'index']);
    Route::get('/filing-permissions/{id}', [FilingPermissionsController::class, 'show']);
});
Route::middleware('permission:filing-permissions.create')->group(function () {
    Route::post('/filing-permissions', [FilingPermissionsController::class, 'store']);
});
Route::middleware('permission:filing-permissions.update')->group(function () {
    Route::put('/filing-permissions/{id}', [FilingPermissionsController::class, 'update']);
    Route::patch('/filing-permissions/{id}', [FilingPermissionsController::class, 'update']);
});
Route::middleware('permission:filing-permissions.delete')->group(function () {
    Route::delete('/filing-permissions/{id}', [FilingPermissionsController::class, 'destroy']);
});

// ── 施工单位 ─────────────────────────────────────────────────────
Route::middleware('permission:construction-units.list')->group(function () {
    Route::get('/construction-units', [ConstructionUnitController::class, 'index']);
    Route::get('/construction-units/{id}', [ConstructionUnitController::class, 'show']);
});
Route::middleware('permission:construction-units.create')->group(function () {
    Route::post('/construction-units', [ConstructionUnitController::class, 'store']);
});
Route::middleware('permission:construction-units.update')->group(function () {
    Route::put('/construction-units/{id}', [ConstructionUnitController::class, 'update']);
    Route::patch('/construction-units/{id}', [ConstructionUnitController::class, 'update']);
});
Route::middleware('permission:construction-units.delete')->group(function () {
    Route::delete('/construction-units/{id}', [ConstructionUnitController::class, 'destroy']);
});

// ── 技术服务单位 ─────────────────────────────────────────────────────
Route::middleware('permission:technical-service-units.list')->group(function () {
    Route::get('/technical-service-units', [TechnicalServiceUnitController::class, 'index']);
    Route::get('/technical-service-units/{id}', [TechnicalServiceUnitController::class, 'show']);
});
Route::middleware('permission:technical-service-units.create')->group(function () {
    Route::post('/technical-service-units', [TechnicalServiceUnitController::class, 'store']);
});
Route::middleware('permission:technical-service-units.update')->group(function () {
    Route::put('/technical-service-units/{id}', [TechnicalServiceUnitController::class, 'update']);
    Route::patch('/technical-service-units/{id}', [TechnicalServiceUnitController::class, 'update']);
});
Route::middleware('permission:technical-service-units.delete')->group(function () {
    Route::delete('/technical-service-units/{id}', [TechnicalServiceUnitController::class, 'destroy']);
});
