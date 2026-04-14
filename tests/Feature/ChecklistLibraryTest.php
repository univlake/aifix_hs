<?php

use App\Models\ChecklistLibrary;

describe('ChecklistLibrary API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            ChecklistLibrary::create([
                'company_id' => $company->id,
                'title' => '检查清单A',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/checklist-libraries');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/checklist-libraries', [
                    'company_id' => $company->id,
                    'title' => '新检查清单',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/checklist-libraries', [
                    'company_id' => $company->id,
                    'title' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/checklist-libraries', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ChecklistLibrary::create([
                'company_id' => $company->id,
                'title' => '旧标题',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/checklist-libraries/{$record->id}", ['title' => '新标题', 'company_id' => $company->id]);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ChecklistLibrary::create([
                'company_id' => $company->id,
                'title' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/checklist-libraries/{$record->id}", ['title' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ChecklistLibrary::create([
                'company_id' => $company->id,
                'title' => '待删除',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/checklist-libraries/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ChecklistLibrary::create([
                'company_id' => $company->id,
                'title' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/checklist-libraries/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
