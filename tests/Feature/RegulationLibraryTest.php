<?php

use App\Models\RegulationLibrary;

describe('RegulationLibrary API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            RegulationLibrary::create([
                'company_id' => $company->id,
                'title' => '法规库A',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/regulation-libraries?company_id=' . $company->id);

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = RegulationLibrary::create([
                'company_id' => $company->id,
                'title' => '法规详情',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/regulation-libraries/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.title', '法规详情');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/regulation-libraries/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/regulation-libraries', [
                    'company_id' => $company->id,
                    'title' => '新法规',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/regulation-libraries', [
                    'company_id' => $company->id,
                    'title' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/regulation-libraries', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = RegulationLibrary::create([
                'company_id' => $company->id,
                'title' => '旧标题',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/regulation-libraries/{$record->id}", ['title' => '新标题']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = RegulationLibrary::create([
                'company_id' => $company->id,
                'title' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/regulation-libraries/{$record->id}", ['title' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = RegulationLibrary::create([
                'company_id' => $company->id,
                'title' => '待删除',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/regulation-libraries/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = RegulationLibrary::create([
                'company_id' => $company->id,
                'title' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/regulation-libraries/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
