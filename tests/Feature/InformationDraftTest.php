<?php

use App\Models\InformationDraft;

describe('InformationDraft API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            InformationDraft::create([
                'company_id' => $company->id,
                'name' => '制度草案A',
                'company_name' => $company->title,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/information-drafts');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = InformationDraft::create([
                'company_id' => $company->id,
                'name' => '草案详情',
                'company_name' => $company->title,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.name', '草案详情');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/information-drafts/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/information-drafts', [
                    'company_id' => $company->id,
                    'name' => '新草案',
                    'company_name' => $company->title,
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/information-drafts', [
                    'company_id' => $company->id,
                    'name' => '越权',
                    'company_name' => '测试',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/information-drafts', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = InformationDraft::create([
                'company_id' => $company->id,
                'name' => '旧名称',
                'company_name' => $company->title,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/information-drafts/{$record->id}", ['name' => '新名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = InformationDraft::create([
                'company_id' => $company->id,
                'name' => '测试',
                'company_name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/information-drafts/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = InformationDraft::create([
                'company_id' => $company->id,
                'name' => '待删除',
                'company_name' => $company->title,
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/information-drafts/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = InformationDraft::create([
                'company_id' => $company->id,
                'name' => '测试',
                'company_name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/information-drafts/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
