<?php

use App\Models\ExpertCompany;
use App\Models\ExpertInspection;
use App\Models\ExpertInspectionUser;

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

    describe('Company Confirm', function () {
        it('auto-fills confirm_time when confirming an expert_company', function () {
            [$user, $company] = createAdminWithCompany();
            $inspection = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '待确认',
            ]);
            $expertCompany = ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/expert-inspection-companies/{$expertCompany->id}/confirm");

            $response->assertOk();
            expect($expertCompany->fresh()->confirm_time)->not->toBeNull();
        });
    });

    describe('Company Notifications', function () {
        it('returns pending items; null notify_company_time counts as immediate', function () {
            [$user, $company] = createAdminWithCompany();
            $inspection = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '通知测试',
            ]);
            // pending with notify time in past
            ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
                'notify_company_time' => now()->subHour(),
            ]);
            // pending with null notify time — should still be shown (immediate)
            ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
                'notify_company_time' => null,
            ]);
            // future notify: should be excluded
            ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
                'notify_company_time' => now()->addDay(),
            ]);
            // already confirmed: should be excluded
            ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
                'notify_company_time' => now()->subHour(),
                'confirm_time' => now(),
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/expert-inspection-notifications/company?company_id={$company->id}");

            $response->assertOk()->assertJsonCount(2, 'data');
        });
    });

    describe('Role-scoped endpoints', function () {
        it('my-check-inspections returns all expert_companies for a company without permission middleware', function () {
            [$user, $company] = createUserWithCompany();
            $inspection = ExpertInspection::create(['company_id' => $company->id, 'title' => 'X']);
            ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/my-check-inspections?company_id={$company->id}");

            $response->assertOk()->assertJsonCount(1, 'data.data');
        });

        it('my-expert-assignments returns records for the logged-in expert', function () {
            [$user, $company] = createUserWithCompany();
            $inspection = ExpertInspection::create(['company_id' => $company->id, 'title' => 'X']);
            $ec = ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
            ]);
            ExpertInspectionUser::create([
                'expert_user_id' => $user->id,
                'expert_company_id' => $ec->id,
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/my-expert-assignments');

            $response->assertOk()->assertJsonCount(1, 'data.data');
        });
    });

    describe('Expert Confirm', function () {
        it('auto-fills confirm_time when expert confirms', function () {
            [$user, $company] = createAdminWithCompany();
            $inspection = ExpertInspection::create([
                'company_id' => $company->id,
                'title' => '专家确认测试',
            ]);
            $expertCompany = ExpertCompany::create([
                'expert_inspection_id' => $inspection->id,
                'check_company_id' => $company->id,
                'company_id' => $company->id,
            ]);
            $expertUser = ExpertInspectionUser::create([
                'expert_user_id' => $user->id,
                'expert_company_id' => $expertCompany->id,
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/expert-inspection-users/{$expertUser->id}/confirm");

            $response->assertOk();
            expect($expertUser->fresh()->confirm_time)->not->toBeNull();
        });
    });
});
