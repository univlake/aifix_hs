<?php

use App\Models\HygieneEvaluation;

describe('HygieneEvaluation API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            HygieneEvaluation::create([
                'company_id' => $company->id,
                'name' => '评价项目A',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/hygiene-evaluations');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = HygieneEvaluation::create([
                'company_id' => $company->id,
                'name' => '评价详情',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/hygiene-evaluations/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.name', '评价详情');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/hygiene-evaluations/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/hygiene-evaluations', [
                    'company_id' => $company->id,
                    'name' => '新评价',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/hygiene-evaluations', [
                    'company_id' => $company->id,
                    'name' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/hygiene-evaluations', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = HygieneEvaluation::create([
                'company_id' => $company->id,
                'name' => '旧名称',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/hygiene-evaluations/{$record->id}", ['name' => '新名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = HygieneEvaluation::create([
                'company_id' => $company->id,
                'name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/hygiene-evaluations/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = HygieneEvaluation::create([
                'company_id' => $company->id,
                'name' => '待删除',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/hygiene-evaluations/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = HygieneEvaluation::create([
                'company_id' => $company->id,
                'name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/hygiene-evaluations/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
