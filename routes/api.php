<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FilingPermissionsController;
use App\Http\Controllers\Api\V1\UploadController;
use App\Http\Controllers\Api\V1\UploadOssController;
use App\Http\Controllers\Api\V1\BaseDataController;
use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\CertificateStatusController;
use App\Http\Controllers\Api\V1\ChangeManageController;
use App\Http\Controllers\Api\V1\ChecklistLibraryController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\DangerousCraftTypeController;
use App\Http\Controllers\Api\V1\DangerousEquipmentController;
use App\Http\Controllers\Api\V1\DesignUnitController;
use App\Http\Controllers\Api\V1\EliminationControlStaffController;
use App\Http\Controllers\Api\V1\EvaluationUnitController;
use App\Http\Controllers\Api\V1\HealthCheckupController;
use App\Http\Controllers\Api\V1\HealthFileController;
use App\Http\Controllers\Api\V1\HealthReportController;
use App\Http\Controllers\Api\V1\HealthSystemController;
use App\Http\Controllers\Api\V1\HazardousChemicalController;
use App\Http\Controllers\Api\V1\HazardousProcessController;
use App\Http\Controllers\Api\V1\HygieneEvaluationController;
use App\Http\Controllers\Api\V1\JobManagementController;
use App\Http\Controllers\Api\V1\MajorHazardController;
use App\Http\Controllers\Api\V1\MajorHazardousProcessController;
use App\Http\Controllers\Api\V1\OccupationalHazardController;
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
use App\Http\Controllers\Api\V1\SpaceWorkController;
use App\Http\Controllers\Api\V1\SpaceWorkTypeController;
use App\Http\Controllers\Api\V1\SpecialEquipmentController;
use App\Http\Controllers\Api\V1\SpecialEquipmentStaffController;
use App\Http\Controllers\Api\V1\SpecialTypeController;
use App\Http\Controllers\Api\V1\TrainingClassTypeController;
use App\Http\Controllers\Api\V1\FireSafetyController;
use App\Http\Controllers\Api\V1\FireEquipmentController;
use App\Http\Controllers\Api\V1\FireFacilityController;
use App\Http\Controllers\Api\V1\EmergencyDrillController;
use App\Http\Controllers\Api\V1\EmergencySuppliesController;
use App\Http\Controllers\Api\V1\EmergencyTeamController;
use App\Http\Controllers\Api\V1\ThreeTogetherController;
use App\Http\Controllers\Api\V1\InternalTrainingController;
use App\Http\Controllers\Api\V1\ExternalTrainingController;
use App\Http\Controllers\Api\V1\OtherTrainingController;
use App\Http\Controllers\Api\V1\TrainingFileController;
use App\Http\Controllers\Api\V1\TrainingVideoController;
use App\Http\Controllers\Api\V1\TrainingClassController;
use App\Http\Controllers\Api\V1\TrainingClassInfoController;
use App\Http\Controllers\Api\V1\MeetingController;
use App\Http\Controllers\Api\V1\MeetingSignUpController;
use App\Http\Controllers\Api\V1\InternalMeetingController;
use App\Http\Controllers\Api\V1\OfficeNotifyController;
use App\Http\Controllers\Api\V1\NewNotifyController;
use App\Http\Controllers\Api\V1\SecurityInvestmentController;
use App\Http\Controllers\Api\V1\FundingExecutionController;
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

        // ── 文件上传 ──────────────────────────────
        Route::middleware('permission:upload.file')->group(function () {
            Route::post('/upload', [UploadController::class, 'upload']);
        });
        Route::middleware('permission:upload.oss')->group(function () {
            Route::get('/upload/oss-signature', [UploadOssController::class, 'getSignature']);
        });
        // OSS callback — no auth middleware, verified by signature
        Route::post('/upload/oss-callback', [UploadOssController::class, 'callback']);

        // ── 备案/许可管理 ──────────────────────────────
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

        // ══════════════════════════════════════════════
        // Phase 4 批次 4.1: 安全台账 (10 modules)
        // ══════════════════════════════════════════════

        // ── 特种设备 ──────────────────────────────
        Route::middleware('permission:special-equipment.list')->group(function () {
            Route::get('/special-equipment', [SpecialEquipmentController::class, 'index']);
            Route::get('/special-equipment/{id}', [SpecialEquipmentController::class, 'show']);
        });
        Route::middleware('permission:special-equipment.create')->group(function () {
            Route::post('/special-equipment', [SpecialEquipmentController::class, 'store']);
        });
        Route::middleware('permission:special-equipment.update')->group(function () {
            Route::put('/special-equipment/{id}', [SpecialEquipmentController::class, 'update']);
            Route::patch('/special-equipment/{id}', [SpecialEquipmentController::class, 'update']);
        });
        Route::middleware('permission:special-equipment.delete')->group(function () {
            Route::delete('/special-equipment/{id}', [SpecialEquipmentController::class, 'destroy']);
        });

        // ── 特种设备人员 ──────────────────────────────
        Route::middleware('permission:special-equipment-staff.list')->group(function () {
            Route::get('/special-equipment-staff', [SpecialEquipmentStaffController::class, 'index']);
            Route::get('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'show']);
        });
        Route::middleware('permission:special-equipment-staff.create')->group(function () {
            Route::post('/special-equipment-staff', [SpecialEquipmentStaffController::class, 'store']);
        });
        Route::middleware('permission:special-equipment-staff.update')->group(function () {
            Route::put('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'update']);
            Route::patch('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'update']);
        });
        Route::middleware('permission:special-equipment-staff.delete')->group(function () {
            Route::delete('/special-equipment-staff/{id}', [SpecialEquipmentStaffController::class, 'destroy']);
        });

        // ── 危险化工设备 ──────────────────────────────
        Route::middleware('permission:dangerous-equipment.list')->group(function () {
            Route::get('/dangerous-equipment', [DangerousEquipmentController::class, 'index']);
            Route::get('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'show']);
        });
        Route::middleware('permission:dangerous-equipment.create')->group(function () {
            Route::post('/dangerous-equipment', [DangerousEquipmentController::class, 'store']);
        });
        Route::middleware('permission:dangerous-equipment.update')->group(function () {
            Route::put('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'update']);
            Route::patch('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'update']);
        });
        Route::middleware('permission:dangerous-equipment.delete')->group(function () {
            Route::delete('/dangerous-equipment/{id}', [DangerousEquipmentController::class, 'destroy']);
        });

        // ── 危险化学品 ──────────────────────────────
        Route::middleware('permission:hazardous-chemicals.list')->group(function () {
            Route::get('/hazardous-chemicals', [HazardousChemicalController::class, 'index']);
            Route::get('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'show']);
        });
        Route::middleware('permission:hazardous-chemicals.create')->group(function () {
            Route::post('/hazardous-chemicals', [HazardousChemicalController::class, 'store']);
        });
        Route::middleware('permission:hazardous-chemicals.update')->group(function () {
            Route::put('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'update']);
            Route::patch('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'update']);
        });
        Route::middleware('permission:hazardous-chemicals.delete')->group(function () {
            Route::delete('/hazardous-chemicals/{id}', [HazardousChemicalController::class, 'destroy']);
        });

        // ── 危险化工工艺 ──────────────────────────────
        Route::middleware('permission:hazardous-processes.list')->group(function () {
            Route::get('/hazardous-processes', [HazardousProcessController::class, 'index']);
            Route::get('/hazardous-processes/{id}', [HazardousProcessController::class, 'show']);
        });
        Route::middleware('permission:hazardous-processes.create')->group(function () {
            Route::post('/hazardous-processes', [HazardousProcessController::class, 'store']);
        });
        Route::middleware('permission:hazardous-processes.update')->group(function () {
            Route::put('/hazardous-processes/{id}', [HazardousProcessController::class, 'update']);
            Route::patch('/hazardous-processes/{id}', [HazardousProcessController::class, 'update']);
        });
        Route::middleware('permission:hazardous-processes.delete')->group(function () {
            Route::delete('/hazardous-processes/{id}', [HazardousProcessController::class, 'destroy']);
        });

        // ── 重大危险源 ──────────────────────────────
        Route::middleware('permission:major-hazards.list')->group(function () {
            Route::get('/major-hazards', [MajorHazardController::class, 'index']);
            Route::get('/major-hazards/{id}', [MajorHazardController::class, 'show']);
        });
        Route::middleware('permission:major-hazards.create')->group(function () {
            Route::post('/major-hazards', [MajorHazardController::class, 'store']);
        });
        Route::middleware('permission:major-hazards.update')->group(function () {
            Route::put('/major-hazards/{id}', [MajorHazardController::class, 'update']);
            Route::patch('/major-hazards/{id}', [MajorHazardController::class, 'update']);
        });
        Route::middleware('permission:major-hazards.delete')->group(function () {
            Route::delete('/major-hazards/{id}', [MajorHazardController::class, 'destroy']);
        });

        // ── 重点监管危险化工工艺 ──────────────────────────────
        Route::middleware('permission:major-hazardous-processes.list')->group(function () {
            Route::get('/major-hazardous-processes', [MajorHazardousProcessController::class, 'index']);
            Route::get('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'show']);
        });
        Route::middleware('permission:major-hazardous-processes.create')->group(function () {
            Route::post('/major-hazardous-processes', [MajorHazardousProcessController::class, 'store']);
        });
        Route::middleware('permission:major-hazardous-processes.update')->group(function () {
            Route::put('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'update']);
            Route::patch('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'update']);
        });
        Route::middleware('permission:major-hazardous-processes.delete')->group(function () {
            Route::delete('/major-hazardous-processes/{id}', [MajorHazardousProcessController::class, 'destroy']);
        });

        // ── 有限空间作业 ──────────────────────────────
        Route::middleware('permission:space-works.list')->group(function () {
            Route::get('/space-works', [SpaceWorkController::class, 'index']);
            Route::get('/space-works/{id}', [SpaceWorkController::class, 'show']);
        });
        Route::middleware('permission:space-works.create')->group(function () {
            Route::post('/space-works', [SpaceWorkController::class, 'store']);
        });
        Route::middleware('permission:space-works.update')->group(function () {
            Route::put('/space-works/{id}', [SpaceWorkController::class, 'update']);
            Route::patch('/space-works/{id}', [SpaceWorkController::class, 'update']);
        });
        Route::middleware('permission:space-works.delete')->group(function () {
            Route::delete('/space-works/{id}', [SpaceWorkController::class, 'destroy']);
        });

        // ══════════════════════════════════════════════
        // Phase 4 批次 4.2: 职业健康 (6 modules)
        // ══════════════════════════════════════════════

        // ── 职业危害清单 ──────────────────────────────
        Route::middleware('permission:occupational-hazards.list')->group(function () {
            Route::get('/occupational-hazards', [OccupationalHazardController::class, 'index']);
            Route::get('/occupational-hazards/{id}', [OccupationalHazardController::class, 'show']);
        });
        Route::middleware('permission:occupational-hazards.create')->group(function () {
            Route::post('/occupational-hazards', [OccupationalHazardController::class, 'store']);
        });
        Route::middleware('permission:occupational-hazards.update')->group(function () {
            Route::put('/occupational-hazards/{id}', [OccupationalHazardController::class, 'update']);
            Route::patch('/occupational-hazards/{id}', [OccupationalHazardController::class, 'update']);
        });
        Route::middleware('permission:occupational-hazards.delete')->group(function () {
            Route::delete('/occupational-hazards/{id}', [OccupationalHazardController::class, 'destroy']);
        });

        // ── 职业健康体系 (仅 index/store/update) ──────────────────────────────
        Route::middleware('permission:health-systems.list')->group(function () {
            Route::get('/health-systems', [HealthSystemController::class, 'index']);
        });
        Route::middleware('permission:health-systems.create')->group(function () {
            Route::post('/health-systems', [HealthSystemController::class, 'store']);
        });
        Route::middleware('permission:health-systems.update')->group(function () {
            Route::put('/health-systems/{id}', [HealthSystemController::class, 'update']);
            Route::patch('/health-systems/{id}', [HealthSystemController::class, 'update']);
        });

        // ── 健康档案 ──────────────────────────────
        Route::middleware('permission:health-files.list')->group(function () {
            Route::get('/health-files', [HealthFileController::class, 'index']);
            Route::get('/health-files/{id}', [HealthFileController::class, 'show']);
        });
        Route::middleware('permission:health-files.create')->group(function () {
            Route::post('/health-files', [HealthFileController::class, 'store']);
        });
        Route::middleware('permission:health-files.update')->group(function () {
            Route::put('/health-files/{id}', [HealthFileController::class, 'update']);
            Route::patch('/health-files/{id}', [HealthFileController::class, 'update']);
        });
        Route::middleware('permission:health-files.delete')->group(function () {
            Route::delete('/health-files/{id}', [HealthFileController::class, 'destroy']);
        });

        // ── 职业病报告 ──────────────────────────────
        Route::middleware('permission:health-reports.list')->group(function () {
            Route::get('/health-reports', [HealthReportController::class, 'index']);
            Route::get('/health-reports/{id}', [HealthReportController::class, 'show']);
        });
        Route::middleware('permission:health-reports.create')->group(function () {
            Route::post('/health-reports', [HealthReportController::class, 'store']);
        });
        Route::middleware('permission:health-reports.update')->group(function () {
            Route::put('/health-reports/{id}', [HealthReportController::class, 'update']);
            Route::patch('/health-reports/{id}', [HealthReportController::class, 'update']);
        });
        Route::middleware('permission:health-reports.delete')->group(function () {
            Route::delete('/health-reports/{id}', [HealthReportController::class, 'destroy']);
        });

        // ── 职业健康体检 ──────────────────────────────
        Route::middleware('permission:health-checkups.list')->group(function () {
            Route::get('/health-checkups', [HealthCheckupController::class, 'index']);
            Route::get('/health-checkups/{id}', [HealthCheckupController::class, 'show']);
        });
        Route::middleware('permission:health-checkups.create')->group(function () {
            Route::post('/health-checkups', [HealthCheckupController::class, 'store']);
        });
        Route::middleware('permission:health-checkups.update')->group(function () {
            Route::put('/health-checkups/{id}', [HealthCheckupController::class, 'update']);
            Route::patch('/health-checkups/{id}', [HealthCheckupController::class, 'update']);
        });
        Route::middleware('permission:health-checkups.delete')->group(function () {
            Route::delete('/health-checkups/{id}', [HealthCheckupController::class, 'destroy']);
        });

        // ── 职业卫生评价 ──────────────────────────────
        Route::middleware('permission:hygiene-evaluations.list')->group(function () {
            Route::get('/hygiene-evaluations', [HygieneEvaluationController::class, 'index']);
            Route::get('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'show']);
        });
        Route::middleware('permission:hygiene-evaluations.create')->group(function () {
            Route::post('/hygiene-evaluations', [HygieneEvaluationController::class, 'store']);
        });
        Route::middleware('permission:hygiene-evaluations.update')->group(function () {
            Route::put('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'update']);
            Route::patch('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'update']);
        });
        Route::middleware('permission:hygiene-evaluations.delete')->group(function () {
            Route::delete('/hygiene-evaluations/{id}', [HygieneEvaluationController::class, 'destroy']);
        });

        // ══════════════════════════════════════════════
        // Phase 4 批次 4.3+4.4: 消防 + 应急 + 培训 + 会议 + 通知 (26 modules)
        // ══════════════════════════════════════════════

        // ── 消防管理 ──────────────────────────────
        Route::middleware('permission:fire-safeties.list')->group(function () {
            Route::get('/fire-safeties', [FireSafetyController::class, 'index']);
            Route::get('/fire-safeties/{id}', [FireSafetyController::class, 'show']);
        });
        Route::middleware('permission:fire-safeties.create')->group(function () {
            Route::post('/fire-safeties', [FireSafetyController::class, 'store']);
        });
        Route::middleware('permission:fire-safeties.update')->group(function () {
            Route::put('/fire-safeties/{id}', [FireSafetyController::class, 'update']);
            Route::patch('/fire-safeties/{id}', [FireSafetyController::class, 'update']);
        });
        Route::middleware('permission:fire-safeties.delete')->group(function () {
            Route::delete('/fire-safeties/{id}', [FireSafetyController::class, 'destroy']);
        });

        // ── 消防器材 ──────────────────────────────
        Route::middleware('permission:fire-equipment.list')->group(function () {
            Route::get('/fire-equipment', [FireEquipmentController::class, 'index']);
            Route::get('/fire-equipment/{id}', [FireEquipmentController::class, 'show']);
        });
        Route::middleware('permission:fire-equipment.create')->group(function () {
            Route::post('/fire-equipment', [FireEquipmentController::class, 'store']);
        });
        Route::middleware('permission:fire-equipment.update')->group(function () {
            Route::put('/fire-equipment/{id}', [FireEquipmentController::class, 'update']);
            Route::patch('/fire-equipment/{id}', [FireEquipmentController::class, 'update']);
        });
        Route::middleware('permission:fire-equipment.delete')->group(function () {
            Route::delete('/fire-equipment/{id}', [FireEquipmentController::class, 'destroy']);
        });

        // ── 消防设施 ──────────────────────────────
        Route::middleware('permission:fire-facilities.list')->group(function () {
            Route::get('/fire-facilities', [FireFacilityController::class, 'index']);
            Route::get('/fire-facilities/{id}', [FireFacilityController::class, 'show']);
        });
        Route::middleware('permission:fire-facilities.create')->group(function () {
            Route::post('/fire-facilities', [FireFacilityController::class, 'store']);
        });
        Route::middleware('permission:fire-facilities.update')->group(function () {
            Route::put('/fire-facilities/{id}', [FireFacilityController::class, 'update']);
            Route::patch('/fire-facilities/{id}', [FireFacilityController::class, 'update']);
        });
        Route::middleware('permission:fire-facilities.delete')->group(function () {
            Route::delete('/fire-facilities/{id}', [FireFacilityController::class, 'destroy']);
        });

        // ── 应急演练 ──────────────────────────────
        Route::middleware('permission:emergency-drills.list')->group(function () {
            Route::get('/emergency-drills', [EmergencyDrillController::class, 'index']);
            Route::get('/emergency-drills/{id}', [EmergencyDrillController::class, 'show']);
        });
        Route::middleware('permission:emergency-drills.create')->group(function () {
            Route::post('/emergency-drills', [EmergencyDrillController::class, 'store']);
        });
        Route::middleware('permission:emergency-drills.update')->group(function () {
            Route::put('/emergency-drills/{id}', [EmergencyDrillController::class, 'update']);
            Route::patch('/emergency-drills/{id}', [EmergencyDrillController::class, 'update']);
        });
        Route::middleware('permission:emergency-drills.delete')->group(function () {
            Route::delete('/emergency-drills/{id}', [EmergencyDrillController::class, 'destroy']);
        });

        // ── 应急物资 ──────────────────────────────
        Route::middleware('permission:emergency-supplies.list')->group(function () {
            Route::get('/emergency-supplies', [EmergencySuppliesController::class, 'index']);
            Route::get('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'show']);
        });
        Route::middleware('permission:emergency-supplies.create')->group(function () {
            Route::post('/emergency-supplies', [EmergencySuppliesController::class, 'store']);
        });
        Route::middleware('permission:emergency-supplies.update')->group(function () {
            Route::put('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'update']);
            Route::patch('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'update']);
        });
        Route::middleware('permission:emergency-supplies.delete')->group(function () {
            Route::delete('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'destroy']);
        });

        // ── 应急队伍 ──────────────────────────────
        Route::middleware('permission:emergency-teams.list')->group(function () {
            Route::get('/emergency-teams', [EmergencyTeamController::class, 'index']);
            Route::get('/emergency-teams/{id}', [EmergencyTeamController::class, 'show']);
        });
        Route::middleware('permission:emergency-teams.create')->group(function () {
            Route::post('/emergency-teams', [EmergencyTeamController::class, 'store']);
        });
        Route::middleware('permission:emergency-teams.update')->group(function () {
            Route::put('/emergency-teams/{id}', [EmergencyTeamController::class, 'update']);
            Route::patch('/emergency-teams/{id}', [EmergencyTeamController::class, 'update']);
        });
        Route::middleware('permission:emergency-teams.delete')->group(function () {
            Route::delete('/emergency-teams/{id}', [EmergencyTeamController::class, 'destroy']);
        });

        // ── 三同时管理 ──────────────────────────────
        Route::middleware('permission:three-togethers.list')->group(function () {
            Route::get('/three-togethers', [ThreeTogetherController::class, 'index']);
            Route::get('/three-togethers/{id}', [ThreeTogetherController::class, 'show']);
        });
        Route::middleware('permission:three-togethers.create')->group(function () {
            Route::post('/three-togethers', [ThreeTogetherController::class, 'store']);
        });
        Route::middleware('permission:three-togethers.update')->group(function () {
            Route::put('/three-togethers/{id}', [ThreeTogetherController::class, 'update']);
            Route::patch('/three-togethers/{id}', [ThreeTogetherController::class, 'update']);
        });
        Route::middleware('permission:three-togethers.delete')->group(function () {
            Route::delete('/three-togethers/{id}', [ThreeTogetherController::class, 'destroy']);
        });

        // ── 内部培训 ──────────────────────────────
        Route::middleware('permission:internal-trainings.list')->group(function () {
            Route::get('/internal-trainings', [InternalTrainingController::class, 'index']);
            Route::get('/internal-trainings/{id}', [InternalTrainingController::class, 'show']);
        });
        Route::middleware('permission:internal-trainings.create')->group(function () {
            Route::post('/internal-trainings', [InternalTrainingController::class, 'store']);
        });
        Route::middleware('permission:internal-trainings.update')->group(function () {
            Route::put('/internal-trainings/{id}', [InternalTrainingController::class, 'update']);
            Route::patch('/internal-trainings/{id}', [InternalTrainingController::class, 'update']);
        });
        Route::middleware('permission:internal-trainings.delete')->group(function () {
            Route::delete('/internal-trainings/{id}', [InternalTrainingController::class, 'destroy']);
        });

        // ── 外部培训 ──────────────────────────────
        Route::middleware('permission:external-trainings.list')->group(function () {
            Route::get('/external-trainings', [ExternalTrainingController::class, 'index']);
            Route::get('/external-trainings/{id}', [ExternalTrainingController::class, 'show']);
        });
        Route::middleware('permission:external-trainings.create')->group(function () {
            Route::post('/external-trainings', [ExternalTrainingController::class, 'store']);
        });
        Route::middleware('permission:external-trainings.update')->group(function () {
            Route::put('/external-trainings/{id}', [ExternalTrainingController::class, 'update']);
            Route::patch('/external-trainings/{id}', [ExternalTrainingController::class, 'update']);
        });
        Route::middleware('permission:external-trainings.delete')->group(function () {
            Route::delete('/external-trainings/{id}', [ExternalTrainingController::class, 'destroy']);
        });

        // ── 其他培训 ──────────────────────────────
        Route::middleware('permission:other-trainings.list')->group(function () {
            Route::get('/other-trainings', [OtherTrainingController::class, 'index']);
            Route::get('/other-trainings/{id}', [OtherTrainingController::class, 'show']);
        });
        Route::middleware('permission:other-trainings.create')->group(function () {
            Route::post('/other-trainings', [OtherTrainingController::class, 'store']);
        });
        Route::middleware('permission:other-trainings.update')->group(function () {
            Route::put('/other-trainings/{id}', [OtherTrainingController::class, 'update']);
            Route::patch('/other-trainings/{id}', [OtherTrainingController::class, 'update']);
        });
        Route::middleware('permission:other-trainings.delete')->group(function () {
            Route::delete('/other-trainings/{id}', [OtherTrainingController::class, 'destroy']);
        });

        // ── 培训材料 ──────────────────────────────
        Route::middleware('permission:training-files.list')->group(function () {
            Route::get('/training-files', [TrainingFileController::class, 'index']);
            Route::get('/training-files/{id}', [TrainingFileController::class, 'show']);
        });
        Route::middleware('permission:training-files.create')->group(function () {
            Route::post('/training-files', [TrainingFileController::class, 'store']);
        });
        Route::middleware('permission:training-files.update')->group(function () {
            Route::put('/training-files/{id}', [TrainingFileController::class, 'update']);
            Route::patch('/training-files/{id}', [TrainingFileController::class, 'update']);
        });
        Route::middleware('permission:training-files.delete')->group(function () {
            Route::delete('/training-files/{id}', [TrainingFileController::class, 'destroy']);
        });

        // ── 培训视频 ──────────────────────────────
        Route::middleware('permission:training-videos.list')->group(function () {
            Route::get('/training-videos', [TrainingVideoController::class, 'index']);
            Route::get('/training-videos/{id}', [TrainingVideoController::class, 'show']);
        });
        Route::middleware('permission:training-videos.create')->group(function () {
            Route::post('/training-videos', [TrainingVideoController::class, 'store']);
        });
        Route::middleware('permission:training-videos.update')->group(function () {
            Route::put('/training-videos/{id}', [TrainingVideoController::class, 'update']);
            Route::patch('/training-videos/{id}', [TrainingVideoController::class, 'update']);
        });
        Route::middleware('permission:training-videos.delete')->group(function () {
            Route::delete('/training-videos/{id}', [TrainingVideoController::class, 'destroy']);
        });

        // ── 培训课程 ──────────────────────────────
        Route::middleware('permission:training-classes.list')->group(function () {
            Route::get('/training-classes', [TrainingClassController::class, 'index']);
            Route::get('/training-classes/{id}', [TrainingClassController::class, 'show']);
        });
        Route::middleware('permission:training-classes.create')->group(function () {
            Route::post('/training-classes', [TrainingClassController::class, 'store']);
        });
        Route::middleware('permission:training-classes.update')->group(function () {
            Route::put('/training-classes/{id}', [TrainingClassController::class, 'update']);
            Route::patch('/training-classes/{id}', [TrainingClassController::class, 'update']);
        });
        Route::middleware('permission:training-classes.delete')->group(function () {
            Route::delete('/training-classes/{id}', [TrainingClassController::class, 'destroy']);
        });

        // ── 培训课程详情 ──────────────────────────────
        Route::middleware('permission:training-class-infos.list')->group(function () {
            Route::get('/training-class-infos', [TrainingClassInfoController::class, 'index']);
            Route::get('/training-class-infos/{id}', [TrainingClassInfoController::class, 'show']);
        });
        Route::middleware('permission:training-class-infos.create')->group(function () {
            Route::post('/training-class-infos', [TrainingClassInfoController::class, 'store']);
        });
        Route::middleware('permission:training-class-infos.update')->group(function () {
            Route::put('/training-class-infos/{id}', [TrainingClassInfoController::class, 'update']);
            Route::patch('/training-class-infos/{id}', [TrainingClassInfoController::class, 'update']);
        });
        Route::middleware('permission:training-class-infos.delete')->group(function () {
            Route::delete('/training-class-infos/{id}', [TrainingClassInfoController::class, 'destroy']);
        });

        // ── 会议管理 ──────────────────────────────
        Route::middleware('permission:meetings.list')->group(function () {
            Route::get('/meetings', [MeetingController::class, 'index']);
            Route::get('/meetings/{id}', [MeetingController::class, 'show']);
        });
        Route::middleware('permission:meetings.create')->group(function () {
            Route::post('/meetings', [MeetingController::class, 'store']);
        });
        Route::middleware('permission:meetings.update')->group(function () {
            Route::put('/meetings/{id}', [MeetingController::class, 'update']);
            Route::patch('/meetings/{id}', [MeetingController::class, 'update']);
        });
        Route::middleware('permission:meetings.delete')->group(function () {
            Route::delete('/meetings/{id}', [MeetingController::class, 'destroy']);
        });

        // ── 会议报名 ──────────────────────────────
        Route::middleware('permission:meeting-sign-ups.list')->group(function () {
            Route::get('/meeting-sign-ups', [MeetingSignUpController::class, 'index']);
            Route::get('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'show']);
        });
        Route::middleware('permission:meeting-sign-ups.create')->group(function () {
            Route::post('/meeting-sign-ups', [MeetingSignUpController::class, 'store']);
        });
        Route::middleware('permission:meeting-sign-ups.update')->group(function () {
            Route::put('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'update']);
            Route::patch('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'update']);
        });
        Route::middleware('permission:meeting-sign-ups.delete')->group(function () {
            Route::delete('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'destroy']);
        });

        // ── 内部会议 ──────────────────────────────
        Route::middleware('permission:internal-meetings.list')->group(function () {
            Route::get('/internal-meetings', [InternalMeetingController::class, 'index']);
            Route::get('/internal-meetings/{id}', [InternalMeetingController::class, 'show']);
        });
        Route::middleware('permission:internal-meetings.create')->group(function () {
            Route::post('/internal-meetings', [InternalMeetingController::class, 'store']);
        });
        Route::middleware('permission:internal-meetings.update')->group(function () {
            Route::put('/internal-meetings/{id}', [InternalMeetingController::class, 'update']);
            Route::patch('/internal-meetings/{id}', [InternalMeetingController::class, 'update']);
        });
        Route::middleware('permission:internal-meetings.delete')->group(function () {
            Route::delete('/internal-meetings/{id}', [InternalMeetingController::class, 'destroy']);
        });

        // ── 通知公告 ──────────────────────────────
        Route::middleware('permission:office-notifies.list')->group(function () {
            Route::get('/office-notifies', [OfficeNotifyController::class, 'index']);
            Route::get('/office-notifies/{id}', [OfficeNotifyController::class, 'show']);
        });
        Route::middleware('permission:office-notifies.create')->group(function () {
            Route::post('/office-notifies', [OfficeNotifyController::class, 'store']);
        });
        Route::middleware('permission:office-notifies.update')->group(function () {
            Route::put('/office-notifies/{id}', [OfficeNotifyController::class, 'update']);
            Route::patch('/office-notifies/{id}', [OfficeNotifyController::class, 'update']);
        });
        Route::middleware('permission:office-notifies.delete')->group(function () {
            Route::delete('/office-notifies/{id}', [OfficeNotifyController::class, 'destroy']);
        });

        // ── 新通知 ──────────────────────────────
        Route::middleware('permission:new-notifies.list')->group(function () {
            Route::get('/new-notifies', [NewNotifyController::class, 'index']);
            Route::get('/new-notifies/{id}', [NewNotifyController::class, 'show']);
        });
        Route::middleware('permission:new-notifies.create')->group(function () {
            Route::post('/new-notifies', [NewNotifyController::class, 'store']);
        });
        Route::middleware('permission:new-notifies.update')->group(function () {
            Route::put('/new-notifies/{id}', [NewNotifyController::class, 'update']);
            Route::patch('/new-notifies/{id}', [NewNotifyController::class, 'update']);
        });
        Route::middleware('permission:new-notifies.delete')->group(function () {
            Route::delete('/new-notifies/{id}', [NewNotifyController::class, 'destroy']);
        });

        // ── 安全投入计划 ──────────────────────────────
        Route::middleware('permission:security-investments.list')->group(function () {
            Route::get('/security-investments', [SecurityInvestmentController::class, 'index']);
            Route::get('/security-investments/{id}', [SecurityInvestmentController::class, 'show']);
        });
        Route::middleware('permission:security-investments.create')->group(function () {
            Route::post('/security-investments', [SecurityInvestmentController::class, 'store']);
        });
        Route::middleware('permission:security-investments.update')->group(function () {
            Route::put('/security-investments/{id}', [SecurityInvestmentController::class, 'update']);
            Route::patch('/security-investments/{id}', [SecurityInvestmentController::class, 'update']);
        });
        Route::middleware('permission:security-investments.delete')->group(function () {
            Route::delete('/security-investments/{id}', [SecurityInvestmentController::class, 'destroy']);
        });

        // ── 经费执行情况 ──────────────────────────────
        Route::middleware('permission:funding-executions.list')->group(function () {
            Route::get('/funding-executions', [FundingExecutionController::class, 'index']);
            Route::get('/funding-executions/{id}', [FundingExecutionController::class, 'show']);
        });
        Route::middleware('permission:funding-executions.create')->group(function () {
            Route::post('/funding-executions', [FundingExecutionController::class, 'store']);
        });
        Route::middleware('permission:funding-executions.update')->group(function () {
            Route::put('/funding-executions/{id}', [FundingExecutionController::class, 'update']);
            Route::patch('/funding-executions/{id}', [FundingExecutionController::class, 'update']);
        });
        Route::middleware('permission:funding-executions.delete')->group(function () {
            Route::delete('/funding-executions/{id}', [FundingExecutionController::class, 'destroy']);
        });
    });
});
