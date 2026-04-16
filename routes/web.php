<?php

use Illuminate\Support\Facades\Route;

// ── 公开页面 ──────────────────────────────────────────────────
Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'auth/Login')->name('login');
Route::inertia('/register', 'auth/Register')->name('register');

// ── 需要认证的页面 ────────────────────────────────────────────
// Auth is enforced client-side (token in localStorage) via AppLayout's auth guard.
// API routes are still protected by auth:api — only the Inertia page shells are open,
// which render nothing useful without a valid token anyway.
Route::group([], function () {

    // 仪表板
    Route::inertia('/dashboard', 'dashboard/Dashboard')->name('dashboard');

    // ── 企业管理 ──────────────────────────────────────────────
    Route::inertia('/enterprise/current', 'enterprise/current/Index');
    Route::inertia('/enterprise/subsidiaries', 'enterprise/subsidiaries/Index');
    Route::inertia('/enterprise/approval', 'enterprise/approval/Index');
    Route::inertia('/enterprise/grouping', 'enterprise/grouping/Index');

    // ── 风险监测 ──────────────────────────────────────────────
    Route::inertia('/risk-monitoring/enterprise-map', 'risk-monitoring/enterprise-map/Index');
    Route::inertia('/risk-monitoring/hazard-map', 'risk-monitoring/hazard-map/Index');
    Route::inertia('/risk-monitoring/online-inspection', 'risk-monitoring/online-inspection/Index');
    Route::inertia('/risk-monitoring/risk-monitor', 'risk-monitoring/risk-monitor/Index');

    // ── 风险管控 ──────────────────────────────────────────────
    Route::inertia('/risk-control/monthly-inspection', 'risk-control/monthly-inspection/Index');
    Route::inertia('/risk-control/expert-inspection', 'risk-control/expert-inspection/Index');

    // ── 系统管理 ──────────────────────────────────────────────
    Route::inertia('/system/companies', 'system/companies/Index');
    Route::inertia('/system/users', 'system/users/Index');
    Route::inertia('/system/roles', 'system/roles/Index');
    Route::inertia('/system/permissions', 'system/permissions/Index');
    Route::inertia('/system/enterprise-types', 'system/enterprise-types/Index');
    Route::inertia('/system/operational-types', 'system/operational-types/Index');
    Route::inertia('/system/dangerous-craft-types', 'system/dangerous-craft-types/Index');
    Route::inertia('/system/special-types', 'system/special-types/Index');
    Route::inertia('/system/process-types', 'system/process-types/Index');
    Route::inertia('/system/space-work-types', 'system/space-work-types/Index');
    Route::inertia('/system/training-class-types', 'system/training-class-types/Index');
    Route::inertia('/system/safety-management-types', 'system/safety-management-types/Index');
    Route::inertia('/system/report-configs', 'system/report-configs/Index');
    Route::inertia('/system/record-types', 'system/record-types/Index');
    Route::inertia('/system/regulation-library-types', 'system/regulation-library-types/Index');

    // ── 企业管理 ──────────────────────────────────────────────
    Route::inertia('/safety/buildings', 'safety/buildings/Index');
    Route::inertia('/safety/job-management', 'safety/job-management/Index');
    Route::inertia('/safety/personnels', 'safety/personnels/Index');
    Route::inertia('/safety/special-equipment', 'safety/special-equipment/Index');
    Route::inertia('/safety/hazardous-chemicals', 'safety/hazardous-chemicals/Index');
    Route::inertia('/safety/major-hazards', 'safety/major-hazards/Index');
    Route::inertia('/safety/fire-safeties', 'safety/fire-safeties/Index');

    // ── 风险管理 ──────────────────────────────────────────────
    Route::inertia('/risk/hazards', 'risk/hazards/Index');
    Route::inertia('/risk/risk-logs', 'risk/risk-logs/Index');
    Route::inertia('/risk/hidden-danger', 'risk/hidden-danger/Index');
    Route::inertia('/risk/rectification-sheets', 'risk/rectification-sheets/Index');
    Route::inertia('/risk/monthly-investigations', 'risk/monthly-investigations/Index');

    // ── 检查管理 ──────────────────────────────────────────────
    Route::inertia('/inspection/daily-checks', 'inspection/daily-checks/Index');
    Route::inertia('/inspection/double-checks', 'inspection/double-checks/Index');
    Route::inertia('/inspection/system-checks', 'inspection/system-checks/Index');
    Route::inertia('/inspection/norm-checks', 'inspection/norm-checks/Index');
    Route::inertia('/inspection/accident-checks', 'inspection/accident-checks/Index');

    // ── 职业健康 ──────────────────────────────────────────────
    Route::inertia('/health/occupational-hazards', 'health/occupational-hazards/Index');
    Route::inertia('/health/health-files', 'health/health-files/Index');
    Route::inertia('/health/health-checkups', 'health/health-checkups/Index');
    Route::inertia('/health/hygiene-evaluations', 'health/hygiene-evaluations/Index');

    // ── 应急管理 ──────────────────────────────────────────────
    Route::inertia('/emergency/fire-safety', 'emergency/fire-safety/Index');
    Route::inertia('/emergency/emergency-drills', 'emergency/emergency-drills/Index');
    Route::inertia('/emergency/emergency-supplies', 'emergency/emergency-supplies/Index');
    Route::inertia('/emergency/emergency-teams', 'emergency/emergency-teams/Index');

    // ── 培训管理 ──────────────────────────────────────────────
    Route::inertia('/training/training-classes', 'training/training-classes/Index');
    Route::inertia('/training/training-files', 'training/training-files/Index');
    Route::inertia('/training/training-videos', 'training/training-videos/Index');
    Route::inertia('/training/internal-trainings', 'training/internal-trainings/Index');
    Route::inertia('/training/external-trainings', 'training/external-trainings/Index');
    Route::inertia('/training/other-trainings', 'training/other-trainings/Index');
    Route::inertia('/training/education', 'training/education/Index');

    // ── 会议管理 ──────────────────────────────────────────────
    Route::inertia('/meeting/meetings', 'meeting/meetings/Index');
    Route::inertia('/meeting/meeting-sign-ups', 'meeting/meeting-sign-ups/Index');
    Route::inertia('/meeting/internal-meetings', 'meeting/internal-meetings/Index');

    // ── 统计报表 ──────────────────────────────────────────────
    Route::inertia('/statistics/month-statistics', 'statistics/month-statistics/Index');
    Route::inertia('/statistics/year-statistics', 'statistics/year-statistics/Index');
    Route::inertia('/statistics/expert-inspections', 'statistics/expert-inspections/Index');
    Route::inertia('/statistics/accident-bulletins', 'statistics/accident-bulletins/Index');

    // ── 法规库 ────────────────────────────────────────────────
    Route::inertia('/regulation/libraries', 'regulation/libraries/Index');

    // ── 空间作业 ──────────────────────────────────────────────
    Route::inertia('/space-work/space-works', 'space-work/space-works/Index');
    Route::inertia('/space-work/three-togethers', 'space-work/three-togethers/Index');

    // ── 安全档案 ──────────────────────────────────────────────
    Route::inertia('/safety-archives/org-structure', 'safety-archives/org-structure/Index');
    Route::inertia('/safety-archives/qualifications', 'safety-archives/qualifications/Index');
    Route::inertia('/safety-archives/safety-investment', 'safety-archives/safety-investment/Index');

    // ── 设备信息 ──────────────────────────────────────────────
    Route::inertia('/equipment/major-hazardous', 'equipment/major-hazardous/Index');

    // ── 工艺信息 ──────────────────────────────────────────────
    Route::inertia('/process/key-hazardous', 'process/key-hazardous/Index');
    Route::inertia('/process/hazardous', 'process/hazardous/Index');
    Route::inertia('/process/confined-space', 'process/confined-space/Index');

    // ── 风险管理（生产端）─────────────────────────────────────
    Route::inertia('/risk/safety-assessment', 'risk/safety-assessment/Index');
    Route::inertia('/risk/expert-inspection', 'risk/expert-inspection/Index');
    Route::inertia('/risk/risk-warning', 'risk/risk-warning/Index');

    // ── 第三方管理 ────────────────────────────────────────────
    Route::inertia('/third-party/design-units', 'third-party/design-units/Index');
    Route::inertia('/third-party/construction-units', 'third-party/construction-units/Index');
    Route::inertia('/third-party/technical-services', 'third-party/technical-services/Index');

    // ── 职业健康（扩展）──────────────────────────────────────
    Route::inertia('/health/disease-report', 'health/disease-report/Index');

    // ── 消防安全（扩展）──────────────────────────────────────
    Route::inertia('/fire/equipment', 'fire/equipment/Index');
    Route::inertia('/fire/facilities', 'fire/facilities/Index');

    // ── 事故应急 ──────────────────────────────────────────────
    Route::inertia('/accident/report', 'accident/report/Index');
    Route::inertia('/accident/emergency', 'accident/emergency/Index');

    // ── 任务管理（生产端）────────────────────────────────────
    Route::inertia('/tasks/notices', 'tasks/notices/Index');
    Route::inertia('/tasks/manuscripts', 'tasks/manuscripts/Index');
    Route::inertia('/tasks/monthly-report', 'tasks/monthly-report/Index');
    Route::inertia('/tasks/annual-report', 'tasks/annual-report/Index');

    // ── 变更管理 ──────────────────────────────────────────────
    Route::inertia('/change-management', 'change-management/Index');

    // ── 知识管理（生产端）────────────────────────────────────
    Route::inertia('/knowledge/checklists', 'knowledge/checklists/Index');

    // ── 年度考核（生产端）────────────────────────────────────
    Route::inertia('/assessment/filing', 'assessment/filing/Index');

    // ── 账号管理 ──────────────────────────────────────────────
    Route::inertia('/account', 'account/Index');

    // ── 风险监测（集团端扩展）────────────────────────────────
    Route::inertia('/risk-monitoring/special-equipment', 'risk-monitoring/special-equipment/Index');

    // ── 风险管控（集团端扩展）────────────────────────────────
    Route::inertia('/risk-control/hidden-danger', 'risk-control/hidden-danger/Index');

    // ── 管理端（集团视图）────────────────────────────────────
    Route::inertia('/management/training/relevant-party', 'management/training/relevant-party/Index');
    Route::inertia('/management/knowledge/checklists', 'management/knowledge/checklists/Index');
    Route::inertia('/management/tasks/meeting-notices', 'management/tasks/meeting-notices/Index');
    Route::inertia('/management/tasks/notices', 'management/tasks/notices/Index');
    Route::inertia('/management/tasks/disposal-notices', 'management/tasks/disposal-notices/Index');
    Route::inertia('/management/tasks/manuscripts', 'management/tasks/manuscripts/Index');
    Route::inertia('/management/accidents/management', 'management/accidents/management/Index');
    Route::inertia('/management/accidents/report', 'management/accidents/report/Index');
    Route::inertia('/management/experts', 'management/experts/Index');
    Route::inertia('/management/assessment/filing', 'management/assessment/filing/Index');
    Route::inertia('/management/assessment/scoring', 'management/assessment/scoring/Index');
    Route::inertia('/management/assessment/results', 'management/assessment/results/Index');
    Route::inertia('/management/assessment/summary', 'management/assessment/summary/Index');
    Route::inertia('/management/statistics/monthly-stats', 'management/statistics/monthly-stats/Index');
    Route::inertia('/management/statistics/annual-stats', 'management/statistics/annual-stats/Index');
    Route::inertia('/management/statistics/notice-stats', 'management/statistics/notice-stats/Index');
    Route::inertia('/management/training-center/upload-materials', 'management/training-center/upload-materials/Index');
    Route::inertia('/management/training-center/upload-videos', 'management/training-center/upload-videos/Index');
});
