<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BaseDataController;
use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\CertificateStatusController;
use App\Http\Controllers\Api\V1\ChangeManageController;
use App\Http\Controllers\Api\V1\ChecklistLibraryController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\DangerousCraftTypeController;
use App\Http\Controllers\Api\V1\DesignUnitController;
use App\Http\Controllers\Api\V1\EliminationControlStaffController;
use App\Http\Controllers\Api\V1\EvaluationUnitController;
use App\Http\Controllers\Api\V1\JobManagementController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\PersonnelController;
use App\Http\Controllers\Api\V1\ProcessTypeController;
use App\Http\Controllers\Api\V1\ProductionStandardizationController;
use App\Http\Controllers\Api\V1\RegulationLibraryTypeController;
use App\Http\Controllers\Api\V1\ReportConfigController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SafetyArchitectureController;
use App\Http\Controllers\Api\V1\SafetyManagementController;
use App\Http\Controllers\Api\V1\SafetyManagementTypeController;
use App\Http\Controllers\Api\V1\SkillUnitController;
use App\Http\Controllers\Api\V1\SpaceWorkTypeController;
use App\Http\Controllers\Api\V1\SpecialTypeController;
use App\Http\Controllers\Api\V1\TrainingClassTypeController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes (with rate limiting)
    Route::middleware('throttle:login')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
    });

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        // Auth (所有登录用户可访问)
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user-info', [AuthController::class, 'userInfo']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // ── 企业管理 ──────────────────────────────
        Route::middleware('permission:companies.list')->group(function () {
            Route::get('/companies', [CompanyController::class, 'index']);
            Route::get('/companies/{company}', [CompanyController::class, 'show']);
            Route::get('/companies-tree', [CompanyController::class, 'tree']);
        });
        Route::middleware('permission:companies.create')->group(function () {
            Route::post('/companies', [CompanyController::class, 'store']);
        });
        Route::middleware('permission:companies.update')->group(function () {
            Route::put('/companies/{company}', [CompanyController::class, 'update']);
            Route::patch('/companies/{company}', [CompanyController::class, 'update']);
        });
        Route::middleware('permission:companies.delete')->group(function () {
            Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);
        });
        Route::middleware('permission:companies.review')->group(function () {
            Route::get('/companies-review-list', [CompanyController::class, 'reviewList']);
            Route::post('/companies/{id}/review', [CompanyController::class, 'review']);
        });

        // ── 人员管理 ──────────────────────────────
        Route::middleware('permission:personnels.list')->group(function () {
            Route::get('/personnels', [PersonnelController::class, 'index']);
            Route::get('/personnels/{personnel}', [PersonnelController::class, 'show']);
        });
        Route::middleware('permission:personnels.create')->group(function () {
            Route::post('/personnels', [PersonnelController::class, 'store']);
        });
        Route::middleware('permission:personnels.update')->group(function () {
            Route::put('/personnels/{personnel}', [PersonnelController::class, 'update']);
            Route::patch('/personnels/{personnel}', [PersonnelController::class, 'update']);
        });
        Route::middleware('permission:personnels.delete')->group(function () {
            Route::delete('/personnels/{personnel}', [PersonnelController::class, 'destroy']);
        });

        // ── 基础数据 ──────────────────────────────
        Route::middleware('permission:base-data.view')->group(function () {
            Route::get('/enterprise-types', [BaseDataController::class, 'enterpriseTypes']);
            Route::get('/operational-types', [BaseDataController::class, 'operationalTypes']);
            Route::get('/base-areas', [BaseDataController::class, 'baseAreas']);
            Route::get('/record-types', [BaseDataController::class, 'recordTypes']);
        });

        // ── 用户管理 ──────────────────────────────
        Route::middleware('permission:users.list')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{user}', [UserController::class, 'show']);
        });
        Route::middleware('permission:users.create')->group(function () {
            Route::post('/users', [UserController::class, 'store']);
        });
        Route::middleware('permission:users.update')->group(function () {
            Route::put('/users/{user}', [UserController::class, 'update']);
        });
        Route::middleware('permission:users.delete')->group(function () {
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });
        Route::middleware('permission:roles.assign')->group(function () {
            Route::put('/users/{user}/role', [UserController::class, 'assignRole']);
        });
        Route::put('/users/{user}/password', [UserController::class, 'resetPassword'])
            ->middleware('permission:users.update');

        // ── 角色管理 ──────────────────────────────
        Route::middleware('permission:roles.list')->group(function () {
            Route::get('/roles', [RoleController::class, 'index']);
            Route::get('/roles/{role}', [RoleController::class, 'show']);
        });
        Route::middleware('permission:roles.create')->group(function () {
            Route::post('/roles', [RoleController::class, 'store']);
        });
        Route::middleware('permission:roles.update')->group(function () {
            Route::put('/roles/{role}', [RoleController::class, 'update']);
        });
        Route::middleware('permission:roles.delete')->group(function () {
            Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
        });

        // ── 权限查看 ──────────────────────────────
        Route::middleware('permission:permissions.list')->group(function () {
            Route::get('/permissions', [PermissionController::class, 'index']);
        });

        // ══════════════════════════════════════════════
        // Phase 3 批次 3.1: 字典/类型表 (base-data 权限)
        // ══════════════════════════════════════════════

        Route::middleware('permission:base-data.view')->group(function () {
            // 危险工艺类型
            Route::get('/dangerous-craft-types', [DangerousCraftTypeController::class, 'index']);
            // 工艺名称类型
            Route::get('/process-types', [ProcessTypeController::class, 'index']);
            // 设备类型
            Route::get('/special-types', [SpecialTypeController::class, 'index']);
            // 有限空间辨识类型
            Route::get('/space-work-types', [SpaceWorkTypeController::class, 'index']);
            // 安全管理人员类型
            Route::get('/safety-management-types', [SafetyManagementTypeController::class, 'index']);
            // 法规类型
            Route::get('/regulation-library-types', [RegulationLibraryTypeController::class, 'index']);
            // 培训课类型
            Route::get('/training-class-types', [TrainingClassTypeController::class, 'index']);
            // 检查清单库
            Route::get('/checklist-libraries', [ChecklistLibraryController::class, 'index']);
            // 报表配置
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

        // ══════════════════════════════════════════════
        // Phase 3 批次 3.2: 业务 CRUD 模块
        // ══════════════════════════════════════════════

        // ── 建筑管理 ──────────────────────────────
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

        // ── 作业管理 ──────────────────────────────
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

        // ── 安全架构 (仅 index/store/update) ──────────────────────────────
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

        // ── 安全生产标准化 (仅 index/store/update) ──────────────────────────────
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

        // ── 安全管理人员 ──────────────────────────────
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

        // ── 持证情况 ──────────────────────────────
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

        // ── 淘汰控制人员 ──────────────────────────────
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

        // ── 技术服务单位 ──────────────────────────────
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

        // ── 设计单位 ──────────────────────────────
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

        // ── 评价单位 ──────────────────────────────
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

        // ── 变更管理 ──────────────────────────────
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
    });
});
