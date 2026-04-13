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

            // 基础数据
            'base-data.view',

            // 系统管理
            'roles.list',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.list',
            'roles.assign',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'api']);
        }

        // ── 角色定义 ──────────────────────────────────────────

        // 超级管理员：所有权限
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        $superAdmin->syncPermissions(Permission::where('guard_name', 'api')->get());

        // 管理员：企业管理 + 人员管理 + 用户管理 + 基础数据（不含系统管理和审核）
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $admin->syncPermissions([
            'companies.list', 'companies.create', 'companies.update', 'companies.delete', 'companies.tree',
            'personnels.list', 'personnels.create', 'personnels.update', 'personnels.delete',
            'users.list', 'users.create', 'users.update',
            'base-data.view',
        ]);

        // 审核员：查看 + 审核企业 + 基础数据
        $reviewer = Role::firstOrCreate(['name' => 'reviewer', 'guard_name' => 'api']);
        $reviewer->syncPermissions([
            'companies.list', 'companies.tree', 'companies.review',
            'personnels.list',
            'base-data.view',
        ]);

        // 普通用户：只读
        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'api']);
        $user->syncPermissions([
            'companies.list', 'companies.tree',
            'personnels.list',
            'base-data.view',
        ]);
    }
}
