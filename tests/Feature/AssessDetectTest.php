<?php

use App\Models\AssessDetect;

describe('AssessDetect API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            AssessDetect::create([
                'company_id' => $company->id,
                'name' => '评价检测A',
                'assess_detect_type' => '安全评价',
                'skill_unit_id' => 1,
                'skill_unit_kid_id' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/assess-detects?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = AssessDetect::create([
                'company_id' => $company->id,
                'name' => '评价详情',
                'assess_detect_type' => '安全评价',
                'skill_unit_id' => 1,
                'skill_unit_kid_id' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/assess-detects/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.name', '评价详情');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/assess-detects/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/assess-detects', [
                    'company_id' => $company->id,
                    'name' => '新评价',
                ]);

            $response->assertOk();
        });

        it('persists all optional fields', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->postJson('/api/v1/assess-detects', [
                    'company_id' => $company->id,
                    'name' => '完整评价',
                    'assess_detect_type' => '安全现状评价',
                    'skill_unit_id' => 7,
                    'skill_unit_kid_id' => 42,
                    'valid_period' => '2026-12-31',
                    'annex_url' => 'https://example.com/a.pdf',
                ])
                ->assertOk();

            $record = AssessDetect::where('name', '完整评价')->first();
            expect($record)->not->toBeNull();
            expect($record->skill_unit_id)->toBe(7);
            expect($record->skill_unit_kid_id)->toBe(42);
            expect($record->valid_period)->toBe('2026-12-31');
            expect($record->annex_url)->toBe('https://example.com/a.pdf');
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/assess-detects', [
                    'company_id' => $company->id,
                    'name' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/assess-detects', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = AssessDetect::create([
                'company_id' => $company->id,
                'name' => '旧名称',
                'assess_detect_type' => '安全评价',
                'skill_unit_id' => 1,
                'skill_unit_kid_id' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/assess-detects/{$record->id}", ['name' => '新名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = AssessDetect::create([
                'company_id' => $company->id,
                'name' => '测试',
                'assess_detect_type' => '安全评价',
                'skill_unit_id' => 1,
                'skill_unit_kid_id' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/assess-detects/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = AssessDetect::create([
                'company_id' => $company->id,
                'name' => '待删除',
                'assess_detect_type' => '安全评价',
                'skill_unit_id' => 1,
                'skill_unit_kid_id' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/assess-detects/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = AssessDetect::create([
                'company_id' => $company->id,
                'name' => '测试',
                'assess_detect_type' => '安全评价',
                'skill_unit_id' => 1,
                'skill_unit_kid_id' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/assess-detects/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
