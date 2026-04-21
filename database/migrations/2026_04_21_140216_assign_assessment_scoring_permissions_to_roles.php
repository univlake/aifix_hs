<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * 为 super-admin / admin 补齐考核评分模块的权限（事故 / 加分 / 规范 / 体系 + 对应模板）。
 */
return new class extends Migration
{
    /** @var array<string> */
    protected array $newPermissions = [
        'accident-checks.list', 'accident-checks.create', 'accident-checks.update', 'accident-checks.delete',
        'accident-check-templates.list', 'accident-check-templates.create', 'accident-check-templates.update', 'accident-check-templates.delete',
        'add-points.list', 'add-points.create', 'add-points.update', 'add-points.delete',
        'add-points-templates.list', 'add-points-templates.create', 'add-points-templates.update', 'add-points-templates.delete',
        'norm-checks.list', 'norm-checks.create', 'norm-checks.update', 'norm-checks.delete',
        'system-checks.list', 'system-checks.create', 'system-checks.update', 'system-checks.delete',
    ];

    public function up(): void
    {
        foreach ($this->newPermissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'api']);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['super-admin', 'admin'] as $roleName) {
            $role = Role::where(['name' => $roleName, 'guard_name' => 'api'])->first();
            if ($role) {
                $role->givePermissionTo($this->newPermissions);
            }
        }
    }

    public function down(): void
    {
        foreach (['super-admin', 'admin'] as $roleName) {
            $role = Role::where(['name' => $roleName, 'guard_name' => 'api'])->first();
            if ($role) {
                $role->revokePermissionTo($this->newPermissions);
            }
        }

        Permission::whereIn('name', $this->newPermissions)
            ->where('guard_name', 'api')
            ->delete();
    }
};
