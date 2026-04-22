<?php

use App\Models\Company;
use App\Models\CompanyGroup;
use App\Models\CompanyGroupKid;

describe('CompanyGroup API', function () {
    describe('Index', function () {
        it('lists groups scoped to the given company_id', function () {
            [$user, $company] = createAdminWithCompany();
            $other = Company::factory()->create(['pid' => $company->id]);
            CompanyGroup::create(['name' => '分组A', 'company_id' => $company->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);
            CompanyGroup::create(['name' => '分组B', 'company_id' => $company->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);
            CompanyGroup::create(['name' => '他家分组', 'company_id' => $other->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/company-groups?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonCount(2, 'data');
        });

        it('requires company_id', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')->getJson('/api/v1/company-groups');

            $response->assertStatus(422);
        });
    });

    describe('Store / Update / Destroy', function () {
        it('creates, updates, and deletes a group', function () {
            [$user, $company] = createAdminWithCompany();

            $create = $this->actingAs($user, 'api')
                ->postJson('/api/v1/company-groups', ['name' => '新分组', 'company_id' => $company->id]);
            $create->assertOk()->assertJsonPath('data.name', '新分组');
            $id = $create->json('data.id');

            $update = $this->actingAs($user, 'api')
                ->putJson("/api/v1/company-groups/{$id}", ['name' => '改名']);
            $update->assertOk()->assertJsonPath('data.name', '改名');

            $delete = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/company-groups/{$id}");
            $delete->assertOk();
            $this->assertSoftDeleted('company_groups', ['id' => $id]);
        });
    });

    describe('Sync kids', function () {
        it('replaces group members on each call', function () {
            [$user, $company] = createAdminWithCompany();
            $c1 = Company::factory()->create(['pid' => $company->id]);
            $c2 = Company::factory()->create(['pid' => $company->id]);
            $c3 = Company::factory()->create(['pid' => $company->id]);
            $group = CompanyGroup::create(['name' => 'G', 'company_id' => $company->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);
            CompanyGroupKid::create(['company_group_id' => $group->id, 'company_id' => $c1->id]);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/company-groups/{$group->id}/sync-kids", [
                    'company_ids' => [$c2->id, $c3->id],
                ]);

            $response->assertOk();
            $this->assertDatabaseMissing('company_group_kids', ['company_group_id' => $group->id, 'company_id' => $c1->id]);
            $this->assertDatabaseHas('company_group_kids', ['company_group_id' => $group->id, 'company_id' => $c2->id]);
            $this->assertDatabaseHas('company_group_kids', ['company_group_id' => $group->id, 'company_id' => $c3->id]);
        });

        it('accepts empty list to clear all members', function () {
            [$user, $company] = createAdminWithCompany();
            $c1 = Company::factory()->create(['pid' => $company->id]);
            $group = CompanyGroup::create(['name' => 'G', 'company_id' => $company->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);
            CompanyGroupKid::create(['company_group_id' => $group->id, 'company_id' => $c1->id]);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/company-groups/{$group->id}/sync-kids", ['company_ids' => []]);

            $response->assertOk();
            expect(CompanyGroupKid::where('company_group_id', $group->id)->count())->toBe(0);
        });

        it('returns 404 when the group does not exist', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/company-groups/999999/sync-kids', ['company_ids' => []]);

            $response->assertStatus(404);
        });
    });
});
