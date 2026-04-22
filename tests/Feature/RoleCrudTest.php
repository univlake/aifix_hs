<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

describe('Role CRUD API', function () {
    describe('Index', function () {
        it('returns all roles with permissions eager-loaded', function () {
            [$superAdmin] = createSuperAdminWithCompany();

            $response = $this->actingAs($superAdmin, 'api')->getJson('/api/v1/roles');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => [['id', 'name', 'guard_name', 'permissions']]]);
            $names = collect($response->json('data'))->pluck('name')->all();
            expect($names)->toContain('super-admin', 'admin', 'reviewer', 'user');
        });

        it('rejects users without roles.list', function () {
            [$admin] = createAdminWithCompany();

            $response = $this->actingAs($admin, 'api')->getJson('/api/v1/roles');

            $response->assertStatus(403);
        });
    });

    describe('Store (Create)', function () {
        it('creates a custom role with selected permissions', function () {
            [$superAdmin] = createSuperAdminWithCompany();

            $response = $this->actingAs($superAdmin, 'api')
                ->postJson('/api/v1/roles', [
                    'name' => 'hse-manager',
                    'permissions' => ['hazards.list', 'hazards.create', 'hazards.update'],
                ]);

            $response->assertOk()->assertJsonPath('data.name', 'hse-manager');
            $role = Role::where('name', 'hse-manager')->firstOrFail();
            expect($role->permissions->pluck('name')->all())
                ->toEqualCanonicalizing(['hazards.list', 'hazards.create', 'hazards.update']);
        });

        it('rejects duplicate role name', function () {
            [$superAdmin] = createSuperAdminWithCompany();

            $response = $this->actingAs($superAdmin, 'api')
                ->postJson('/api/v1/roles', ['name' => 'admin']);

            $response->assertStatus(422);
        });

        it('rejects missing name', function () {
            [$superAdmin] = createSuperAdminWithCompany();

            $response = $this->actingAs($superAdmin, 'api')->postJson('/api/v1/roles', []);

            $response->assertStatus(422);
        });

        it('denies users without roles.create', function () {
            [$admin] = createAdminWithCompany();

            $response = $this->actingAs($admin, 'api')
                ->postJson('/api/v1/roles', ['name' => 'x']);

            $response->assertStatus(403);
        });
    });

    describe('Update', function () {
        it('updates permissions on a custom role', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $role = Role::create(['name' => 'custom', 'guard_name' => 'api']);
            $role->givePermissionTo('hazards.list');

            $response = $this->actingAs($superAdmin, 'api')
                ->putJson("/api/v1/roles/{$role->id}", [
                    'permissions' => ['hazards.list', 'hazards.update'],
                ]);

            $response->assertOk();
            expect($role->fresh()->permissions->pluck('name')->all())
                ->toEqualCanonicalizing(['hazards.list', 'hazards.update']);
        });

        it('rejects changes to super-admin', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $saRole = Role::where('name', 'super-admin')->firstOrFail();

            $response = $this->actingAs($superAdmin, 'api')
                ->putJson("/api/v1/roles/{$saRole->id}", ['permissions' => []]);

            $response->assertStatus(400);
        });

        it('allows updating permissions of built-in admin role (name locked on frontend)', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $adminRole = Role::where('name', 'admin')->firstOrFail();
            $before = $adminRole->permissions->count();

            $response = $this->actingAs($superAdmin, 'api')
                ->putJson("/api/v1/roles/{$adminRole->id}", [
                    'permissions' => ['hazards.list'],
                ]);

            $response->assertOk();
            expect($adminRole->fresh()->permissions->count())->toBe(1)->not->toBe($before);
        });
    });

    describe('Destroy', function () {
        it('deletes a custom role', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $role = Role::create(['name' => 'to-delete', 'guard_name' => 'api']);

            $response = $this->actingAs($superAdmin, 'api')
                ->deleteJson("/api/v1/roles/{$role->id}");

            $response->assertOk();
            expect(Role::find($role->id))->toBeNull();
        });

        it('rejects deleting built-in roles', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $adminRole = Role::where('name', 'admin')->firstOrFail();

            $response = $this->actingAs($superAdmin, 'api')
                ->deleteJson("/api/v1/roles/{$adminRole->id}");

            $response->assertStatus(400);
        });

        it('rejects deletion when users still hold the role', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $role = Role::create(['name' => 'occupied', 'guard_name' => 'api']);
            $userRole = User::factory()->create();
            $userRole->assignRole($role);

            $response = $this->actingAs($superAdmin, 'api')
                ->deleteJson("/api/v1/roles/{$role->id}");

            $response->assertStatus(400);
        });
    });
});
