<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ── 权限定义 ──────────────────────────────────────────
        $permissions = [
            // 企业管理
            'companies.list',
            'companies.create',
            'companies.update',
            'companies.delete',
            'companies.tree',
            'companies.review',

            // 人员管理
            'personnels.list',
            'personnels.create',
            'personnels.update',
            'personnels.delete',

            // 用户管理
            'users.list',
            'users.create',
            'users.update',
            'users.delete',

            // 基础数据 (字典类型: 列表/详情 + 写操作)
            'base-data.view',
            'base-data.manage',

            // 系统管理
            'roles.list',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.list',
            'roles.assign',

            // ── Phase 3: 业务模块 ──────────────────────

            // 建筑管理
            'buildings.list',
            'buildings.create',
            'buildings.update',
            'buildings.delete',

            // 作业管理
            'job-management.list',
            'job-management.create',
            'job-management.update',
            'job-management.delete',

            // 安全架构
            'safety-architectures.list',
            'safety-architectures.create',
            'safety-architectures.update',

            // 安全生产标准化
            'production-standardizations.list',
            'production-standardizations.create',
            'production-standardizations.update',

            // 职业健康安全管理体系
            'occupational-health-safeties.list',
            'occupational-health-safeties.create',
            'occupational-health-safeties.update',

            // 安全管理人员
            'safety-management.list',
            'safety-management.create',
            'safety-management.update',
            'safety-management.delete',

            // 持证情况
            'certificate-statuses.list',
            'certificate-statuses.create',
            'certificate-statuses.update',
            'certificate-statuses.delete',

            // 淘汰控制人员（含原「消防控制室人员」— 已合并路径）
            'elimination-control-staff.list',
            'elimination-control-staff.create',
            'elimination-control-staff.update',
            'elimination-control-staff.delete',

            // 技术服务单位
            'skill-units.list',
            'skill-units.create',
            'skill-units.update',
            'skill-units.delete',

            // 设计单位
            'design-units.list',
            'design-units.create',
            'design-units.update',
            'design-units.delete',

            // 评价单位
            'evaluation-units.list',
            'evaluation-units.create',
            'evaluation-units.update',
            'evaluation-units.delete',

            // 施工单位
            'construction-units.list',
            'construction-units.create',
            'construction-units.update',
            'construction-units.delete',

            // 技术服务单位（独立权限；与 skill-units 是不同的资源）
            'technical-service-units.list',
            'technical-service-units.create',
            'technical-service-units.update',
            'technical-service-units.delete',

            // 变更管理
            'change-manages.list',
            'change-manages.create',
            'change-manages.update',
            'change-manages.delete',

            // 文件上传
            'upload.file',
            'upload.oss',

            // 备案/许可管理
            'filing-permissions.list',
            'filing-permissions.create',
            'filing-permissions.update',
            'filing-permissions.delete',

            // 检查清单库
            'checklist-libraries.list',
            'checklist-libraries.create',
            'checklist-libraries.update',
            'checklist-libraries.delete',

            // 报表配置
            'report-configs.list',
            'report-configs.create',
            'report-configs.update',
            'report-configs.delete',

            // ── Phase 4: 安全台账 + 职业健康 ──────────────────────

            // 特种设备
            'special-equipment.list',
            'special-equipment.create',
            'special-equipment.update',
            'special-equipment.delete',

            // 特种设备人员
            'special-equipment-staff.list',
            'special-equipment-staff.create',
            'special-equipment-staff.update',
            'special-equipment-staff.delete',

            // 危险化工设备
            'dangerous-equipment.list',
            'dangerous-equipment.create',
            'dangerous-equipment.update',
            'dangerous-equipment.delete',

            // 危险化学品
            'hazardous-chemicals.list',
            'hazardous-chemicals.create',
            'hazardous-chemicals.update',
            'hazardous-chemicals.delete',

            // 危险化工工艺
            'hazardous-processes.list',
            'hazardous-processes.create',
            'hazardous-processes.update',
            'hazardous-processes.delete',

            // 重大危险源
            'major-hazards.list',
            'major-hazards.create',
            'major-hazards.update',
            'major-hazards.delete',

            // 重点监管危险化工工艺
            'major-hazardous-processes.list',
            'major-hazardous-processes.create',
            'major-hazardous-processes.update',
            'major-hazardous-processes.delete',

            // 有限空间作业
            'space-works.list',
            'space-works.create',
            'space-works.update',
            'space-works.delete',

            // 职业危害清单
            'occupational-hazards.list',
            'occupational-hazards.create',
            'occupational-hazards.update',
            'occupational-hazards.delete',

            // 职业健康体系 (无删除)
            'health-systems.list',
            'health-systems.create',
            'health-systems.update',

            // 健康档案
            'health-files.list',
            'health-files.create',
            'health-files.update',
            'health-files.delete',

            // 职业病报告
            'health-reports.list',
            'health-reports.create',
            'health-reports.update',
            'health-reports.delete',

            // 职业健康体检
            'health-checkups.list',
            'health-checkups.create',
            'health-checkups.update',
            'health-checkups.delete',

            // 职业卫生评价
            'hygiene-evaluations.list',
            'hygiene-evaluations.create',
            'hygiene-evaluations.update',
            'hygiene-evaluations.delete',

            // ── Phase 4.3+4.4: 消防 + 应急 + 培训 + 会议 + 通知 ──────────────────────

            // 消防管理
            'fire-safeties.list',
            'fire-safeties.create',
            'fire-safeties.update',
            'fire-safeties.delete',

            // 消防器材
            'fire-equipment.list',
            'fire-equipment.create',
            'fire-equipment.update',
            'fire-equipment.delete',

            // 消防设施
            'fire-facilities.list',
            'fire-facilities.create',
            'fire-facilities.update',
            'fire-facilities.delete',

            // 应急演练
            'emergency-drills.list',
            'emergency-drills.create',
            'emergency-drills.update',
            'emergency-drills.delete',

            // 应急物资
            'emergency-supplies.list',
            'emergency-supplies.create',
            'emergency-supplies.update',
            'emergency-supplies.delete',

            // 应急队伍
            'emergency-teams.list',
            'emergency-teams.create',
            'emergency-teams.update',
            'emergency-teams.delete',

            // 三同时管理
            'three-togethers.list',
            'three-togethers.create',
            'three-togethers.update',
            'three-togethers.delete',

            // 内部培训
            'internal-trainings.list',
            'internal-trainings.create',
            'internal-trainings.update',
            'internal-trainings.delete',

            // 外部培训
            'external-trainings.list',
            'external-trainings.create',
            'external-trainings.update',
            'external-trainings.delete',

            // 其他培训
            'other-trainings.list',
            'other-trainings.create',
            'other-trainings.update',
            'other-trainings.delete',

            // 培训材料
            'training-files.list',
            'training-files.create',
            'training-files.update',
            'training-files.delete',

            // 培训视频
            'training-videos.list',
            'training-videos.create',
            'training-videos.update',
            'training-videos.delete',

            // 培训课程
            'training-classes.list',
            'training-classes.create',
            'training-classes.update',
            'training-classes.delete',

            // 培训课程详情
            'training-class-infos.list',
            'training-class-infos.create',
            'training-class-infos.update',
            'training-class-infos.delete',

            // 会议管理
            'meetings.list',
            'meetings.create',
            'meetings.update',
            'meetings.delete',

            // 会议报名
            'meeting-sign-ups.list',
            'meeting-sign-ups.create',
            'meeting-sign-ups.update',
            'meeting-sign-ups.delete',

            // 内部会议
            'internal-meetings.list',
            'internal-meetings.create',
            'internal-meetings.update',
            'internal-meetings.delete',

            // 通知公告
            'office-notifies.list',
            'office-notifies.create',
            'office-notifies.update',
            'office-notifies.delete',

            // 新通知
            'new-notifies.list',
            'new-notifies.create',
            'new-notifies.update',
            'new-notifies.delete',

            // 安全投入计划
            'security-investments.list',
            'security-investments.create',
            'security-investments.update',
            'security-investments.delete',

            // 经费执行情况
            'funding-executions.list',
            'funding-executions.create',
            'funding-executions.update',
            'funding-executions.delete',

            // ── Phase 5: 隐患整改 + 风险管控 ──────────────────────

            // 隐患信息
            'hidden-danger-infos.list',
            'hidden-danger-infos.create',
            'hidden-danger-infos.update',
            'hidden-danger-infos.delete',

            // 整改单
            'rectification-sheets.list',
            'rectification-sheets.create',
            'rectification-sheets.update',
            'rectification-sheets.delete',

            // 危险有害因素
            'hazards.list',
            'hazards.create',
            'hazards.update',
            'hazards.delete',

            // 风险日志
            'risk-logs.list',
            'risk-logs.create',
            'risk-logs.update',
            'risk-logs.delete',

            // 固有风险日志
            'inherent-risk-logs.list',
            'inherent-risk-logs.create',
            'inherent-risk-logs.update',
            'inherent-risk-logs.delete',

            // 动态风险日志
            'float-risk-logs.list',
            'float-risk-logs.create',
            'float-risk-logs.update',
            'float-risk-logs.delete',

            // 风险分布图 (无删除)
            'risk-distribution-maps.list',
            'risk-distribution-maps.create',
            'risk-distribution-maps.update',

            // 月度排查
            'monthly-investigations.list',
            'monthly-investigations.create',
            'monthly-investigations.update',
            'monthly-investigations.delete',

            // ── Phase 6: 事故快报 + 统计 + 集团管控 ──────────────────────

            // 事故快报
            'accident-bulletins.list',
            'accident-bulletins.create',
            'accident-bulletins.update',
            'accident-bulletins.delete',

            // 制度草案
            'information-drafts.list',
            'information-drafts.create',
            'information-drafts.update',
            'information-drafts.delete',

            // 专家检查
            'expert-inspections.list',
            'expert-inspections.create',
            'expert-inspections.update',
            'expert-inspections.delete',

            // 月度统计
            'month-statistics.list',
            'month-statistics.create',
            'month-statistics.update',
            'month-statistics.delete',

            // 年度统计
            'year-statistics.list',
            'year-statistics.create',
            'year-statistics.update',
            'year-statistics.delete',

            // 考核填报（日常检查）
            'daily-checks.list',
            'daily-checks.create',
            'daily-checks.update',
            'daily-checks.delete',
            'daily-check-templates.list',
            'daily-check-templates.create',
            'daily-check-templates.update',
            'daily-check-templates.delete',

            // 考核评分（事故 / 加分 / 规范 / 体系）
            'accident-checks.list',
            'accident-checks.create',
            'accident-checks.update',
            'accident-checks.delete',
            'accident-check-templates.list',
            'accident-check-templates.create',
            'accident-check-templates.update',
            'accident-check-templates.delete',
            'add-points.list',
            'add-points.create',
            'add-points.update',
            'add-points.delete',
            'add-points-templates.list',
            'add-points-templates.create',
            'add-points-templates.update',
            'add-points-templates.delete',
            'norm-checks.list',
            'norm-checks.create',
            'norm-checks.update',
            'norm-checks.delete',
            'system-checks.list',
            'system-checks.create',
            'system-checks.update',
            'system-checks.delete',

            // 集团专家
            'bloc-experts.list',
            'bloc-experts.create',
            'bloc-experts.delete',

            // 集团风险
            'bloc-risks.list',

            // 集团通知
            'bloc-notices.list',

            // 集团事故快报
            'bloc-accident-bulletins.list',

            // 集团评论
            'bloc-comments.list',

            // 待办事项
            'todos.list',

            // 首页
            'homes.list',

            // 企业地图
            'company-map.list',

            // 企业报表
            'enterprise-report.list',

            // 在线检查
            'online-inspection.list',

            // 可见性统计

            // 重点监管企业
            'focus-companies.list',
            'focus-companies.create',
            'focus-companies.delete',

            // ── 补充模块 ──────────────────────────────
            'assess-detects.list',
            'assess-detects.create',
            'assess-detects.update',
            'assess-detects.delete',

            'regulation-libraries.list',
            'regulation-libraries.create',
            'regulation-libraries.update',
            'regulation-libraries.delete',

            'risks.portrait',
            'company-map.view',
            'rectification-sheet-count.view',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'api']);
        }

        // ── 角色定义 ──────────────────────────────────────────

        // 超级管理员：所有权限
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        $superAdmin->syncPermissions(Permission::where('guard_name', 'api')->get());

        // 管理员：企业管理 + 人员管理 + 用户管理 + 基础数据 + Phase 3 业务模块（不含系统管理）
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $adminPerms = collect($permissions)
            ->reject(fn (string $p) => str_starts_with($p, 'roles.') || str_starts_with($p, 'permissions.') || $p === 'companies.review')
            ->values()
            ->all();
        $admin->syncPermissions($adminPerms);

        // 审核员：查看 + 审核企业 + 基础数据 + 业务模块只读
        $reviewer = Role::firstOrCreate(['name' => 'reviewer', 'guard_name' => 'api']);
        $reviewerPerms = collect($permissions)
            ->filter(fn (string $p) => str_ends_with($p, '.list') || str_ends_with($p, '.view') || str_ends_with($p, '.tree') || $p === 'companies.review')
            ->values()
            ->all();
        $reviewer->syncPermissions($reviewerPerms);

        // 普通用户：只读
        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'api']);
        $userPerms = collect($permissions)
            ->filter(fn (string $p) => str_ends_with($p, '.list') || str_ends_with($p, '.view') || str_ends_with($p, '.tree'))
            ->values()
            ->all();
        $user->syncPermissions($userPerms);
    }
}
