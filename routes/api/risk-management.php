<?php

use App\Http\Controllers\Api\V1\AssessDetectController;
use App\Http\Controllers\Api\V1\BlocMonthlyInvestigationsController;
use App\Http\Controllers\Api\V1\FloatRiskLogController;
use App\Http\Controllers\Api\V1\HazardController;
use App\Http\Controllers\Api\V1\HiddenDangerInfoController;
use App\Http\Controllers\Api\V1\InherentRiskLogController;
use App\Http\Controllers\Api\V1\MonthlyInvestigationController;
use App\Http\Controllers\Api\V1\RectificationSheetController;
use App\Http\Controllers\Api\V1\RiskDistributionMapController;
use App\Http\Controllers\Api\V1\RiskLogController;
use Illuminate\Support\Facades\Route;

// ── 隐患信息 ─────────────────────────────────────────────────────
Route::middleware('permission:hidden-danger-infos.list')->group(function () {
    Route::get('/hidden-danger-infos', [HiddenDangerInfoController::class, 'index']);
    Route::get('/hidden-danger-infos/{id}', [HiddenDangerInfoController::class, 'show']);
});
Route::middleware('permission:hidden-danger-infos.create')->group(function () {
    Route::post('/hidden-danger-infos', [HiddenDangerInfoController::class, 'store']);
});
Route::middleware('permission:hidden-danger-infos.update')->group(function () {
    Route::put('/hidden-danger-infos/{id}', [HiddenDangerInfoController::class, 'update']);
    Route::patch('/hidden-danger-infos/{id}', [HiddenDangerInfoController::class, 'update']);
});
Route::middleware('permission:hidden-danger-infos.delete')->group(function () {
    Route::delete('/hidden-danger-infos/{id}', [HiddenDangerInfoController::class, 'destroy']);
});
// 整改流程：整改 / 整改确认 / 归档（登录态即可，前端按角色显示按钮）
Route::post('/hidden-danger-infos/{id}/rectify', [HiddenDangerInfoController::class, 'rectify']);
Route::post('/hidden-danger-infos/{id}/confirm-rectification', [HiddenDangerInfoController::class, 'confirmRectification']);
Route::post('/hidden-danger-infos/{id}/archive', [HiddenDangerInfoController::class, 'archive']);

// ── 整改单 ─────────────────────────────────────────────────────
Route::middleware('permission:rectification-sheets.list')->group(function () {
    Route::get('/rectification-sheets', [RectificationSheetController::class, 'index']);
    Route::get('/rectification-sheets/{id}', [RectificationSheetController::class, 'show']);
});
Route::middleware('permission:rectification-sheets.create')->group(function () {
    Route::post('/rectification-sheets', [RectificationSheetController::class, 'store']);
});
Route::middleware('permission:rectification-sheets.update')->group(function () {
    Route::put('/rectification-sheets/{id}', [RectificationSheetController::class, 'update']);
    Route::patch('/rectification-sheets/{id}', [RectificationSheetController::class, 'update']);
});
Route::middleware('permission:rectification-sheets.delete')->group(function () {
    Route::delete('/rectification-sheets/{id}', [RectificationSheetController::class, 'destroy']);
});

// ── 危险有害因素 ─────────────────────────────────────────────────────
Route::middleware('permission:hazards.list')->group(function () {
    Route::get('/hazards', [HazardController::class, 'index']);
    Route::get('/hazards/{id}', [HazardController::class, 'show']);
});
Route::middleware('permission:hazards.create')->group(function () {
    Route::post('/hazards', [HazardController::class, 'store']);
});
Route::middleware('permission:hazards.update')->group(function () {
    Route::put('/hazards/{id}', [HazardController::class, 'update']);
    Route::patch('/hazards/{id}', [HazardController::class, 'update']);
});
Route::middleware('permission:hazards.delete')->group(function () {
    Route::delete('/hazards/{id}', [HazardController::class, 'destroy']);
});

// ── 风险日志 ─────────────────────────────────────────────────────
Route::middleware('permission:risk-logs.list')->group(function () {
    Route::get('/risk-logs', [RiskLogController::class, 'index']);
    Route::get('/risk-logs/{id}', [RiskLogController::class, 'show']);
});
Route::middleware('permission:risk-logs.create')->group(function () {
    Route::post('/risk-logs', [RiskLogController::class, 'store']);
});
Route::middleware('permission:risk-logs.update')->group(function () {
    Route::put('/risk-logs/{id}', [RiskLogController::class, 'update']);
    Route::patch('/risk-logs/{id}', [RiskLogController::class, 'update']);
});
Route::middleware('permission:risk-logs.delete')->group(function () {
    Route::delete('/risk-logs/{id}', [RiskLogController::class, 'destroy']);
});

// ── 固有风险日志 ─────────────────────────────────────────────────────
Route::middleware('permission:inherent-risk-logs.list')->group(function () {
    Route::get('/inherent-risk-logs', [InherentRiskLogController::class, 'index']);
    Route::get('/inherent-risk-logs/{id}', [InherentRiskLogController::class, 'show']);
});
Route::middleware('permission:inherent-risk-logs.create')->group(function () {
    Route::post('/inherent-risk-logs', [InherentRiskLogController::class, 'store']);
});
Route::middleware('permission:inherent-risk-logs.update')->group(function () {
    Route::put('/inherent-risk-logs/{id}', [InherentRiskLogController::class, 'update']);
    Route::patch('/inherent-risk-logs/{id}', [InherentRiskLogController::class, 'update']);
});
Route::middleware('permission:inherent-risk-logs.delete')->group(function () {
    Route::delete('/inherent-risk-logs/{id}', [InherentRiskLogController::class, 'destroy']);
});

// ── 动态风险日志 ─────────────────────────────────────────────────────
Route::middleware('permission:float-risk-logs.list')->group(function () {
    Route::get('/float-risk-logs', [FloatRiskLogController::class, 'index']);
    Route::get('/float-risk-logs/{id}', [FloatRiskLogController::class, 'show']);
});
Route::middleware('permission:float-risk-logs.create')->group(function () {
    Route::post('/float-risk-logs', [FloatRiskLogController::class, 'store']);
});
Route::middleware('permission:float-risk-logs.update')->group(function () {
    Route::put('/float-risk-logs/{id}', [FloatRiskLogController::class, 'update']);
    Route::patch('/float-risk-logs/{id}', [FloatRiskLogController::class, 'update']);
});
Route::middleware('permission:float-risk-logs.delete')->group(function () {
    Route::delete('/float-risk-logs/{id}', [FloatRiskLogController::class, 'destroy']);
});

// ── 风险分布图 ─────────────────────────────────────────────────────
Route::middleware('permission:risk-distribution-maps.list')->group(function () {
    Route::get('/risk-distribution-maps', [RiskDistributionMapController::class, 'index']);
});
Route::middleware('permission:risk-distribution-maps.create')->group(function () {
    Route::post('/risk-distribution-maps', [RiskDistributionMapController::class, 'store']);
});
Route::middleware('permission:risk-distribution-maps.update')->group(function () {
    Route::put('/risk-distribution-maps/{id}', [RiskDistributionMapController::class, 'update']);
    Route::patch('/risk-distribution-maps/{id}', [RiskDistributionMapController::class, 'update']);
});

// ── 月度排查 ─────────────────────────────────────────────────────
Route::middleware('permission:monthly-investigations.list')->group(function () {
    Route::get('/monthly-investigations', [MonthlyInvestigationController::class, 'index']);
    Route::get('/monthly-investigations/{id}', [MonthlyInvestigationController::class, 'show']);
    Route::get('/bloc-monthly-investigations', [BlocMonthlyInvestigationsController::class, 'index']);
});
Route::middleware('permission:monthly-investigations.create')->group(function () {
    Route::post('/monthly-investigations', [MonthlyInvestigationController::class, 'store']);
});
Route::middleware('permission:monthly-investigations.update')->group(function () {
    Route::put('/monthly-investigations/{id}', [MonthlyInvestigationController::class, 'update']);
    Route::patch('/monthly-investigations/{id}', [MonthlyInvestigationController::class, 'update']);
});
Route::middleware('permission:monthly-investigations.delete')->group(function () {
    Route::delete('/monthly-investigations/{id}', [MonthlyInvestigationController::class, 'destroy']);
});

// ── 安全评价和检测 ─────────────────────────────────────────────────────
Route::middleware('permission:assess-detects.list')->group(function () {
    Route::get('/assess-detects', [AssessDetectController::class, 'index']);
    Route::get('/assess-detects/{id}', [AssessDetectController::class, 'show']);
});
Route::middleware('permission:assess-detects.create')->group(function () {
    Route::post('/assess-detects', [AssessDetectController::class, 'store']);
});
Route::middleware('permission:assess-detects.update')->group(function () {
    Route::put('/assess-detects/{id}', [AssessDetectController::class, 'update']);
    Route::patch('/assess-detects/{id}', [AssessDetectController::class, 'update']);
});
Route::middleware('permission:assess-detects.delete')->group(function () {
    Route::delete('/assess-detects/{id}', [AssessDetectController::class, 'destroy']);
});
