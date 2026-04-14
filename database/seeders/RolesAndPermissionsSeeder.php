<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

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

            // 淘汰控制人员
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
