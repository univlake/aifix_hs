<?php

use App\Http\Controllers\Api\V1\AccidentBulletinsController;
use App\Http\Controllers\Api\V1\BlocAccidentBulletinsController;
use App\Http\Controllers\Api\V1\BlocCommentsController;
use App\Http\Controllers\Api\V1\BlocExpertsController;
use App\Http\Controllers\Api\V1\BlocNoticesController;
use App\Http\Controllers\Api\V1\BlocRisksController;
use App\Http\Controllers\Api\V1\CompanyMapController;
use App\Http\Controllers\Api\V1\EnterpriseReportController;
use App\Http\Controllers\Api\V1\ExpertInspectionsController;
use App\Http\Controllers\Api\V1\FocusCompaniesController;
use App\Http\Controllers\Api\V1\HomesController;
use App\Http\Controllers\Api\V1\InformationDraftsController;
use App\Http\Controllers\Api\V1\MajorHazardMapController;
use App\Http\Controllers\Api\V1\MonthStatisticsController;
use App\Http\Controllers\Api\V1\NoticeStatsController;
use App\Http\Controllers\Api\V1\OnlineInspectionController;
use App\Http\Controllers\Api\V1\RectificationSheetCountController;
use App\Http\Controllers\Api\V1\RegulationLibraryController;
use App\Http\Controllers\Api\V1\RisksController;
use App\Http\Controllers\Api\V1\SpecialEquipmentStatisticsController;
use App\Http\Controllers\Api\V1\TodosController;
use App\Http\Controllers\Api\V1\VisibleController;
use App\Http\Controllers\Api\V1\YearStatisticsController;
use Illuminate\Support\Facades\Route;

// ── 事故快报 ─────────────────────────────────────────────────────
Route::middleware('permission:accident-bulletins.list')->group(function () {
    Route::get('/accident-bulletins', [AccidentBulletinsController::class, 'index']);
    Route::get('/accident-bulletins/{id}', [AccidentBulletinsController::class, 'show']);
});
Route::middleware('permission:accident-bulletins.create')->group(function () {
    Route::post('/accident-bulletins', [AccidentBulletinsController::class, 'store']);
});
Route::middleware('permission:accident-bulletins.update')->group(function () {
    Route::put('/accident-bulletins/{id}', [AccidentBulletinsController::class, 'update']);
    Route::patch('/accident-bulletins/{id}', [AccidentBulletinsController::class, 'update']);
});
Route::middleware('permission:accident-bulletins.delete')->group(function () {
    Route::delete('/accident-bulletins/{id}', [AccidentBulletinsController::class, 'destroy']);
});

// ── 制度草案 ─────────────────────────────────────────────────────
Route::middleware('permission:information-drafts.list')->group(function () {
    Route::get('/information-drafts', [InformationDraftsController::class, 'index']);
    Route::get('/information-drafts/dashboard/readings', [InformationDraftsController::class, 'dashboardReadings']);
    Route::get('/information-drafts/dashboard/pending', [InformationDraftsController::class, 'dashboardPending']);
    Route::get('/information-drafts/{id}', [InformationDraftsController::class, 'show']);
});
Route::middleware('permission:information-drafts.create')->group(function () {
    Route::post('/information-drafts', [InformationDraftsController::class, 'store']);
});
Route::middleware('permission:information-drafts.update')->group(function () {
    Route::put('/information-drafts/{id}', [InformationDraftsController::class, 'update']);
    Route::patch('/information-drafts/{id}', [InformationDraftsController::class, 'update']);
});
Route::middleware('permission:information-drafts.delete')->group(function () {
    Route::delete('/information-drafts/{id}', [InformationDraftsController::class, 'destroy']);
});

// ── 专家检查 ─────────────────────────────────────────────────────
Route::middleware('permission:expert-inspections.list')->group(function () {
    Route::get('/expert-inspections', [ExpertInspectionsController::class, 'index']);
    Route::get('/expert-inspections/{id}', [ExpertInspectionsController::class, 'show']);
    Route::get('/expert-inspection-companies', [ExpertInspectionsController::class, 'companies']);
    Route::get('/expert-inspection-users', [ExpertInspectionsController::class, 'users']);
});
Route::middleware('permission:expert-inspections.create')->group(function () {
    Route::post('/expert-inspections', [ExpertInspectionsController::class, 'store']);
    Route::post('/expert-inspection-companies', [ExpertInspectionsController::class, 'storeCompany']);
    Route::post('/expert-inspection-users', [ExpertInspectionsController::class, 'storeUser']);
});
Route::middleware('permission:expert-inspections.update')->group(function () {
    Route::put('/expert-inspections/{id}', [ExpertInspectionsController::class, 'update']);
    Route::patch('/expert-inspections/{id}', [ExpertInspectionsController::class, 'update']);
    Route::put('/expert-inspection-companies/{id}', [ExpertInspectionsController::class, 'updateCompany']);
    Route::patch('/expert-inspection-companies/{id}', [ExpertInspectionsController::class, 'updateCompany']);
    Route::put('/expert-inspection-users/{id}', [ExpertInspectionsController::class, 'updateUser']);
    Route::patch('/expert-inspection-users/{id}', [ExpertInspectionsController::class, 'updateUser']);
});
Route::middleware('permission:expert-inspections.delete')->group(function () {
    Route::delete('/expert-inspections/{id}', [ExpertInspectionsController::class, 'destroy']);
    Route::delete('/expert-inspection-companies/{id}', [ExpertInspectionsController::class, 'destroyCompany']);
    Route::delete('/expert-inspection-users/{id}', [ExpertInspectionsController::class, 'destroyUser']);
});
// 企业/专家端通知与确认（不走权限中间件，登录态即可）
Route::get('/expert-inspection-notifications/company', [ExpertInspectionsController::class, 'companyNotifications']);
Route::get('/expert-inspection-notifications/expert', [ExpertInspectionsController::class, 'expertNotifications']);
Route::get('/my-check-inspections', [ExpertInspectionsController::class, 'myCheckInspections']);
Route::get('/my-expert-assignments', [ExpertInspectionsController::class, 'myExpertAssignments']);
Route::post('/expert-inspection-companies/{id}/confirm', [ExpertInspectionsController::class, 'confirmCompany']);
Route::post('/expert-inspection-users/{id}/confirm', [ExpertInspectionsController::class, 'confirmUser']);

// ── 月度统计 ─────────────────────────────────────────────────────
Route::middleware('permission:month-statistics.list')->group(function () {
    Route::get('/month-statistics', [MonthStatisticsController::class, 'index']);
    Route::get('/month-statistics/stuff', [MonthStatisticsController::class, 'stuff']);
    Route::get('/month-statistics/statistics', [MonthStatisticsController::class, 'statistics']);
    Route::get('/month-statistics/{id}', [MonthStatisticsController::class, 'show']);
});
Route::middleware('permission:month-statistics.create')->group(function () {
    Route::post('/month-statistics', [MonthStatisticsController::class, 'store']);
});
Route::middleware('permission:month-statistics.update')->group(function () {
    Route::put('/month-statistics/{id}', [MonthStatisticsController::class, 'update']);
    Route::patch('/month-statistics/{id}', [MonthStatisticsController::class, 'update']);
});
Route::middleware('permission:month-statistics.delete')->group(function () {
    Route::delete('/month-statistics/{id}', [MonthStatisticsController::class, 'destroy']);
});

// ── 年度统计 ─────────────────────────────────────────────────────
Route::middleware('permission:year-statistics.list')->group(function () {
    Route::get('/year-statistics', [YearStatisticsController::class, 'index']);
    Route::get('/year-statistics/stuff', [YearStatisticsController::class, 'stuff']);
    Route::get('/year-statistics/statistics', [YearStatisticsController::class, 'statistics']);
    Route::get('/year-statistics/{id}', [YearStatisticsController::class, 'show']);
});
Route::middleware('permission:year-statistics.create')->group(function () {
    Route::post('/year-statistics', [YearStatisticsController::class, 'store']);
});
Route::middleware('permission:year-statistics.update')->group(function () {
    Route::put('/year-statistics/{id}', [YearStatisticsController::class, 'update']);
    Route::patch('/year-statistics/{id}', [YearStatisticsController::class, 'update']);
});
Route::middleware('permission:year-statistics.delete')->group(function () {
    Route::delete('/year-statistics/{id}', [YearStatisticsController::class, 'destroy']);
});

// ── 通知公告反馈统计（只读，使用 office-notifies.list 权限） ─────
Route::middleware('permission:office-notifies.list')->group(function () {
    Route::get('/notice-stats/summary', [NoticeStatsController::class, 'summary']);
    Route::get('/notice-stats/pending', [NoticeStatsController::class, 'pending']);
});

// ── 集团专家 ─────────────────────────────────────────────────────
Route::middleware('permission:bloc-experts.list')->group(function () {
    Route::get('/bloc-experts', [BlocExpertsController::class, 'index']);
    Route::get('/bloc-experts/{id}', [BlocExpertsController::class, 'show']);
    Route::get('/bloc-experts-list', [BlocExpertsController::class, 'list']);
});
Route::middleware('permission:bloc-experts.create')->group(function () {
    Route::post('/bloc-experts', [BlocExpertsController::class, 'store']);
});
Route::middleware('permission:bloc-experts.delete')->group(function () {
    Route::delete('/bloc-experts/{id}', [BlocExpertsController::class, 'destroy']);
});

// ── 集团风险 ─────────────────────────────────────────────────────
Route::middleware('permission:bloc-risks.list')->group(function () {
    Route::get('/bloc-risks', [BlocRisksController::class, 'index']);
    Route::get('/bloc-risks-inherent', [BlocRisksController::class, 'getInherentRiskNum']);
    Route::get('/bloc-risks-float', [BlocRisksController::class, 'getFloatRiskNum']);
    Route::get('/bloc-risks-float-statistics', [BlocRisksController::class, 'floatRiskStatistics']);
    Route::get('/bloc-risks-inherent-statistics', [BlocRisksController::class, 'inherentRiskStatistics']);
    Route::get('/bloc-risks-log', [BlocRisksController::class, 'getRiskLog']);
    Route::get('/bloc-risks-sort', [BlocRisksController::class, 'riskSort']);
    Route::get('/bloc-hidden-danger-sort', [BlocRisksController::class, 'hiddenDangerSort']);
});

// ── 集团通知 ─────────────────────────────────────────────────────
Route::middleware('permission:bloc-notices.list')->group(function () {
    Route::get('/bloc-notices', [BlocNoticesController::class, 'index']);
});

// ── 集团事故快报 ─────────────────────────────────────────────────────
Route::middleware('permission:bloc-accident-bulletins.list')->group(function () {
    Route::get('/bloc-accident-bulletins', [BlocAccidentBulletinsController::class, 'index']);
    Route::get('/bloc-accident-bulletins/annual-stats', [BlocAccidentBulletinsController::class, 'annualStats']);
});

// ── 集团评论/公告 ─────────────────────────────────────────────────────
Route::middleware('permission:bloc-comments.list')->group(function () {
    Route::get('/bloc-comments', [BlocCommentsController::class, 'getInfo']);
});

// ── 待办事项 ─────────────────────────────────────────────────────
Route::middleware('permission:todos.list')->group(function () {
    Route::get('/todos', [TodosController::class, 'index']);
    Route::get('/todos-list-table', [TodosController::class, 'listTable']);
});

// ── 首页 ─────────────────────────────────────────────────────
Route::middleware('permission:homes.list')->group(function () {
    Route::get('/homes-early-warning', [HomesController::class, 'earlyWarning']);
    Route::get('/homes-company-info', [HomesController::class, 'companyInfo']);
});

// ── 企业地图 ─────────────────────────────────────────────────────
Route::middleware('permission:company-map.list')->group(function () {
    Route::get('/company-map', [CompanyMapController::class, 'index']);
});

// ── 企业报表 ─────────────────────────────────────────────────────
Route::middleware('permission:enterprise-report.list')->group(function () {
    Route::get('/enterprise-report', [EnterpriseReportController::class, 'index']);
});

// ── 在线检查 ─────────────────────────────────────────────────────
Route::middleware('permission:online-inspection.list')->group(function () {
    Route::get('/online-inspection-personnel-certificate', [OnlineInspectionController::class, 'personnelCertificate']);
    Route::get('/online-inspection-personnel-certificate-expand', [OnlineInspectionController::class, 'personnelCertificateExpand']);
    Route::get('/online-inspection-equipment', [OnlineInspectionController::class, 'equipment']);
    Route::get('/online-inspection-equipment-expand', [OnlineInspectionController::class, 'equipmentExpand']);
    Route::get('/online-inspection-monthly-investigation', [OnlineInspectionController::class, 'monthlyInvestigation']);
    Route::get('/online-inspection-monthly-investigation-expand', [OnlineInspectionController::class, 'monthlyInvestigationExpand']);
    Route::get('/online-inspection-production-standardization', [OnlineInspectionController::class, 'productionStandardization']);
});

// ── 可见性统计 ─────────────────────────────────────────────────────
Route::middleware('permission:visible.list')->group(function () {
    Route::get('/visible', [VisibleController::class, 'index']);
});

// ── 重点监管企业 ─────────────────────────────────────────────────────
Route::middleware('permission:focus-companies.list')->group(function () {
    Route::get('/focus-companies', [FocusCompaniesController::class, 'index']);
});
Route::middleware('permission:focus-companies.create')->group(function () {
    Route::post('/focus-companies', [FocusCompaniesController::class, 'store']);
});
Route::middleware('permission:focus-companies.delete')->group(function () {
    Route::delete('/focus-companies/{id}', [FocusCompaniesController::class, 'destroy']);
});

// ── 法律法规库 ─────────────────────────────────────────────────────
Route::middleware('permission:regulation-libraries.list')->group(function () {
    Route::get('/regulation-libraries', [RegulationLibraryController::class, 'index']);
    Route::get('/regulation-libraries/{id}', [RegulationLibraryController::class, 'show']);
});
Route::middleware('permission:regulation-libraries.create')->group(function () {
    Route::post('/regulation-libraries', [RegulationLibraryController::class, 'store']);
});
Route::middleware('permission:regulation-libraries.update')->group(function () {
    Route::put('/regulation-libraries/{id}', [RegulationLibraryController::class, 'update']);
    Route::patch('/regulation-libraries/{id}', [RegulationLibraryController::class, 'update']);
});
Route::middleware('permission:regulation-libraries.delete')->group(function () {
    Route::delete('/regulation-libraries/{id}', [RegulationLibraryController::class, 'destroy']);
});

// ── 风险画像 ─────────────────────────────────────────────────────
Route::middleware('permission:risks.portrait')->group(function () {
    Route::get('/risks/portrait', [RisksController::class, 'portrait']);
    Route::get('/risks/log', [RisksController::class, 'riskLog']);
});

// ── 重大危险源地图 ─────────────────────────────────────────────────────
Route::middleware('permission:company-map.view')->group(function () {
    Route::get('/major-hazard-map', [MajorHazardMapController::class, 'index']);
});

// ── 整改统计 ─────────────────────────────────────────────────────
Route::middleware('permission:rectification-sheet-count.view')->group(function () {
    Route::get('/rectification-sheet-count', [RectificationSheetCountController::class, 'getStatistics']);
});

// ── 特种设备数据统计 ─────────────────────────────────────────────────────
Route::get('/special-equipment-statistics', [SpecialEquipmentStatisticsController::class, 'index']);
