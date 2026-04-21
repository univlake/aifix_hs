<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * 为 super-admin / admin 角色补齐 daily-checks.* / daily-check-templates.* 权限，
 * 避免历史环境在未重跑 RolesAndPermissionsSeeder 的情况下出现"无权限"提示。
 */
return new class extends Migration
{
    /** @var array<string> */
    protected array $newPermissions = [
        'daily-checks.list',
        'daily-checks.create',
        'daily-checks.update',
        'daily-checks.delete',
        'daily-check-templates.list',
        'daily-check-templates.create',
        'daily-check-templates.update',
        'daily-check-templates.delete',
    ];

    public function up(): void
    {
        // Ensure permissions exist.
        foreach ($this->newPermissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'api']);
        }

        // Invalidate Spatie's permission cache so the sync sees the fresh rows.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Super admin gets everything.
        $superAdmin = Role::where(['name' => 'super-admin', 'guard_name' => 'api'])->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($this->newPermissions);
        }

        // Admin also gets the daily-checks business permissions.
        $admin = Role::where(['name' => 'admin', 'guard_name' => 'api'])->first();
        if ($admin) {
            $admin->givePermissionTo($this->newPermissions);
        }
    }

    public function down(): void
    {
        $superAdmin = Role::where(['name' => 'super-admin', 'guard_name' => 'api'])->first();
        if ($superAdmin) {
            $superAdmin->revokePermissionTo($this->newPermissions);
        }

        $admin = Role::where(['name' => 'admin', 'guard_name' => 'api'])->first();
        if ($admin) {
            $admin->revokePermissionTo($this->newPermissions);
        }

        Permission::whereIn('name', $this->newPermissions)
            ->where('guard_name', 'api')
            ->delete();

        DB::table('model_has_permissions')->whereNotIn('permission_id', Permission::pluck('id'))->delete();
    }
};
