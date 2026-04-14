<?php

use App\Models\EvaluationUnit;

describe('EvaluationUnit API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            EvaluationUnit::create([
                'company_id' => $company->id,
                'name' => '评价单位',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/evaluation-units');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = EvaluationUnit::create([
                'company_id' => $company->id,
                'name' => '评价单位',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/evaluation-units/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/evaluation-units/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/evaluation-units', [
                    'company_id' => $company->id,
                    'name' => '新评价单位',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/evaluation-units', [
                    'company_id' => $company->id,
                    'name' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/evaluation-units', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = EvaluationUnit::create([
                'company_id' => $company->id,
                'name' => '旧名称',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/evaluation-units/{$record->id}", ['name' => '新名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = EvaluationUnit::create([
                'company_id' => $company->id,
                'name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/evaluation-units/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = EvaluationUnit::create([
                'company_id' => $company->id,
                'name' => '待删除',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/evaluation-units/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = EvaluationUnit::create([
                'company_id' => $company->id,
                'name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/evaluation-units/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
