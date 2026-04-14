<?php

use App\Models\ExpertInspection;

describe('ExpertInspection API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '专家检查A',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/expert-inspections');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '检查详情',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/expert-inspections/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.title', '检查详情');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/expert-inspections/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/expert-inspections', [
                    'company_id' => $company->id,
                    'title' => '新检查',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/expert-inspections', [
                    'company_id' => $company->id,
                    'title' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/expert-inspections', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '旧标题',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/expert-inspections/{$record->id}", ['title' => '新标题']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/expert-inspections/{$record->id}", ['title' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '待删除',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/expert-inspections/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/expert-inspections/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
