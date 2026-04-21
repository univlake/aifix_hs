<?php

use App\Models\Company;
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

    describe('Visibility', function () {
        it('includes owned drafts regardless of status when filtering by company_id', function () {
            [$user, $company] = createAdminWithCompany();
            $published = InformationDraft::create([
                'name' => '已发布',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $company->id,
                'status' => 1,
            ]);
            $unpublished = InformationDraft::create([
                'name' => '未发布',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $company->id,
                'status' => 0,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts?company_id={$company->id}");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->toContain($published->id, $unpublished->id);
        });

        it('scope=published returns only drafts authored and owned by viewer', function () {
            $parent = Company::factory()->create();
            [$user, $company] = createAdminWithCompany();
            $company->update(['pid' => $parent->id]);

            $mine = InformationDraft::create([
                'name' => '我发布',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $company->id,
                'status' => 0,
            ]);
            $reported = InformationDraft::create([
                'name' => '我上报',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $parent->id,
                'status' => 0,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts?company_id={$company->id}&scope=published");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->toContain($mine->id)
                ->and($ids)->not->toContain($reported->id);
        });

        it('scope=received includes subordinate reports and superior-published drafts', function () {
            $parent = Company::factory()->create();
            [$user, $company] = createAdminWithCompany();
            $company->update(['pid' => $parent->id]);
            $sub = Company::factory()->create();
            $sub->update(['pid' => $company->id]);

            $reportedIn = InformationDraft::create([
                'name' => '下级上报',
                'company_name' => $sub->title,
                'company_id' => $sub->id,
                'next_reviewer' => $company->id,
                'status' => 0,
            ]);
            $parentPublished = InformationDraft::create([
                'name' => '上级发布',
                'company_name' => $parent->title,
                'company_id' => $parent->id,
                'next_reviewer' => $parent->id,
                'status' => 1,
            ]);
            $parentUnpublished = InformationDraft::create([
                'name' => '上级未发布',
                'company_name' => $parent->title,
                'company_id' => $parent->id,
                'next_reviewer' => $parent->id,
                'status' => 0,
            ]);
            $mine = InformationDraft::create([
                'name' => '我发布',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $company->id,
                'status' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts?company_id={$company->id}&scope=received");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->toContain($reportedIn->id, $parentPublished->id)
                ->and($ids)->not->toContain($mine->id)
                ->and($ids)->not->toContain($parentUnpublished->id);
        });

        it('reported draft is visible to the superior regardless of status', function () {
            [$user, $parent] = createAdminWithCompany();
            $sub = Company::factory()->create();
            $sub->update(['pid' => $parent->id]);

            $reported = InformationDraft::create([
                'name' => '上报未发布',
                'company_name' => $sub->title,
                'company_id' => $sub->id,
                'next_reviewer' => $parent->id,
                'status' => 0,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts?company_id={$parent->id}");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->toContain($reported->id);
        });

        it('dashboard readings: published drafts visible to reviewer tree (mine + superior + reviewed-subordinate-reports)', function () {
            $parent = Company::factory()->create();
            [$user, $company] = createAdminWithCompany();
            $company->update(['pid' => $parent->id]);
            $sub = Company::factory()->create();
            $sub->update(['pid' => $company->id]);

            $mine = InformationDraft::create([
                'name' => '我发布',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $company->id,
                'status' => 1,
            ]);
            $parentPublished = InformationDraft::create([
                'name' => '上级发布',
                'company_name' => $parent->title,
                'company_id' => $parent->id,
                'next_reviewer' => $parent->id,
                'status' => 1,
            ]);
            // Sub reported up to company; company reviewed & released (status=1).
            $reviewedSubReport = InformationDraft::create([
                'name' => '下级上报后审核发布',
                'company_name' => $sub->title,
                'company_id' => $sub->id,
                'next_reviewer' => $company->id,
                'status' => 1,
            ]);
            // Another subordinate's local publication should NOT leak to siblings.
            $otherBranch = Company::factory()->create();
            $otherBranch->update(['pid' => $parent->id]);
            $siblingLocal = InformationDraft::create([
                'name' => '兄弟节点本地发布',
                'company_name' => $otherBranch->title,
                'company_id' => $otherBranch->id,
                'next_reviewer' => $otherBranch->id,
                'status' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts/dashboard/readings?company_id={$company->id}");

            $response->assertOk();
            $ids = collect($response->json('data'))->pluck('id')->all();
            expect($ids)->toContain($mine->id, $parentPublished->id, $reviewedSubReport->id)
                ->and($ids)->not->toContain($siblingLocal->id);
        });

        it('dashboard readings: reviewed subordinate report is also visible to that subordinate tree', function () {
            $parent = Company::factory()->create();
            $company = Company::factory()->create(['pid' => $parent->id]);
            [$subUser, $sub] = createAdminWithCompany();
            $sub->update(['pid' => $company->id]);

            $reviewedReport = InformationDraft::create([
                'name' => '审核发布',
                'company_name' => $sub->title,
                'company_id' => $sub->id,
                'next_reviewer' => $company->id,
                'status' => 1,
            ]);

            $response = $this->actingAs($subUser, 'api')
                ->getJson("/api/v1/information-drafts/dashboard/readings?company_id={$sub->id}");

            $response->assertOk();
            $ids = collect($response->json('data'))->pluck('id')->all();
            expect($ids)->toContain($reviewedReport->id);
        });

        it('dashboard pending returns unprocessed subordinate-reported drafts only', function () {
            [$user, $company] = createAdminWithCompany();
            $sub = Company::factory()->create();
            $sub->update(['pid' => $company->id]);

            $pending = InformationDraft::create([
                'name' => '下级上报未处理',
                'company_name' => $sub->title,
                'company_id' => $sub->id,
                'next_reviewer' => $company->id,
                'status' => 0,
            ]);
            InformationDraft::create([
                'name' => '下级上报已处理',
                'company_name' => $sub->title,
                'company_id' => $sub->id,
                'next_reviewer' => $company->id,
                'status' => 1,
            ]);
            InformationDraft::create([
                'name' => '我自己的未发布',
                'company_name' => $company->title,
                'company_id' => $company->id,
                'next_reviewer' => $company->id,
                'status' => 0,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts/dashboard/pending?company_id={$company->id}");

            $response->assertOk();
            $ids = collect($response->json('data'))->pluck('id')->all();
            expect($ids)->toBe([$pending->id]);
        });

        it('shows published drafts whose next_reviewer is an ancestor', function () {
            $parent = Company::factory()->create();
            [$user, $company] = createAdminWithCompany();
            $company->update(['pid' => $parent->id]);

            $visible = InformationDraft::create([
                'name' => '集团稿件',
                'company_name' => $parent->title,
                'company_id' => $parent->id,
                'next_reviewer' => $parent->id,
                'status' => 1,
            ]);
            $hidden = InformationDraft::create([
                'name' => '集团未发布',
                'company_name' => $parent->title,
                'company_id' => $parent->id,
                'next_reviewer' => $parent->id,
                'status' => 0,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts?company_id={$company->id}");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->toContain($visible->id)
                ->and($ids)->not->toContain($hidden->id);
        });

        it('hides drafts belonging to unrelated companies', function () {
            $other = Company::factory()->create();
            [$user, $company] = createAdminWithCompany();

            $outsider = InformationDraft::create([
                'name' => '无关稿件',
                'company_name' => $other->title,
                'company_id' => $other->id,
                'next_reviewer' => $other->id,
                'status' => 1,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/information-drafts?company_id={$company->id}");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->not->toContain($outsider->id);
        });
    });
});
