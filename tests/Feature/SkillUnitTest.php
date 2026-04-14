<?php

use App\Models\SkillUnit;

describe('SkillUnit API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            SkillUnit::create([
                'company_id' => $company->id,
                'name' => '技术单位',
                'serving_type' => '检测',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/skill-units');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SkillUnit::create([
                'company_id' => $company->id,
                'name' => '技术单位',
                'serving_type' => '检测',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/skill-units/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/skill-units/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/skill-units', [
                    'company_id' => $company->id,
                    'name' => '新单位',
                    'serving_type' => '评价',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/skill-units', [
                    'company_id' => $company->id,
                    'name' => '越权',
                    'serving_type' => '评价',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/skill-units', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SkillUnit::create([
                'company_id' => $company->id,
                'name' => '旧单位',
                'serving_type' => '检测',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/skill-units/{$record->id}", ['name' => '新名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = SkillUnit::create([
                'company_id' => $company->id,
                'name' => '测试',
                'serving_type' => '检测',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/skill-units/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SkillUnit::create([
                'company_id' => $company->id,
                'name' => '待删除',
                'serving_type' => '检测',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/skill-units/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = SkillUnit::create([
                'company_id' => $company->id,
                'name' => '测试',
                'serving_type' => '检测',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/skill-units/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
