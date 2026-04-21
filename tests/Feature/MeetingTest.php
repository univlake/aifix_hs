<?php

use App\Models\Company;
use App\Models\Meeting;
use App\Models\MeetingNotice;

describe('Meeting API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            Meeting::create([
                'company_id' => $company->id,
                'name' => '安全会议',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/meetings');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });

        it('returns meetings where company is notified via company_id filter', function () {
            [$user, $company] = createAdminWithCompany();
            $organizer = Company::factory()->create();

            $owned = Meeting::create(['company_id' => $company->id, 'name' => '自办会议']);
            $invited = Meeting::create(['company_id' => $organizer->id, 'name' => '受邀会议']);
            MeetingNotice::create(['meeting_id' => $invited->id, 'company_id' => $company->id]);
            Meeting::create(['company_id' => $organizer->id, 'name' => '无关会议']);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/meetings?company_id={$company->id}");

            $response->assertOk();
            $ids = collect($response->json('data.data'))->pluck('id')->all();
            expect($ids)->toContain($owned->id, $invited->id);
            expect(count($ids))->toBe(2);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = Meeting::create([
                'company_id' => $company->id,
                'name' => '会议详情',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/meetings/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.name', '会议详情');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/meetings/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/meetings', [
                    'company_id' => $company->id,
                    'name' => '新会议',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/meetings', [
                    'company_id' => $company->id,
                    'name' => '越权',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/meetings', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = Meeting::create([
                'company_id' => $company->id,
                'name' => '旧名称',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/meetings/{$record->id}", ['name' => '新名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = Meeting::create([
                'company_id' => $company->id,
                'name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/meetings/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = Meeting::create([
                'company_id' => $company->id,
                'name' => '待删除',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/meetings/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = Meeting::create([
                'company_id' => $company->id,
                'name' => '测试',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/meetings/{$record->id}");

            $response->assertStatus(403);
        });
    });

    describe('Notice Distribution', function () {
        it('creates meeting with nested notices via kids', function () {
            [$user, $company] = createAdminWithCompany();
            $otherCompany = Company::factory()->create();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/meetings', [
                    'company_id' => $company->id,
                    'name' => '分发通知',
                    'kids' => [
                        ['company_id' => $otherCompany->id, 'company_name' => $otherCompany->title],
                    ],
                ]);

            $response->assertOk();
            $meetingId = $response->json('data.id');
            expect(MeetingNotice::where('meeting_id', $meetingId)->count())->toBe(1);
        });

        it('notify endpoint stamps notify_time', function () {
            [$user, $company] = createAdminWithCompany();
            $meeting = Meeting::create(['company_id' => $company->id, 'name' => '通知测试']);
            $notice = MeetingNotice::create([
                'meeting_id' => $meeting->id,
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/meeting-notices/{$notice->id}/notify");

            $response->assertOk();
            expect($notice->fresh()->notify_time)->not->toBeNull();
        });

        it('confirm endpoint stamps confirm_time', function () {
            [$user, $company] = createAdminWithCompany();
            $meeting = Meeting::create(['company_id' => $company->id, 'name' => '确认测试']);
            $notice = MeetingNotice::create([
                'meeting_id' => $meeting->id,
                'company_id' => $company->id,
                'notify_time' => now(),
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/meeting-notices/{$notice->id}/confirm");

            $response->assertOk();
            expect($notice->fresh()->confirm_time)->not->toBeNull();
        });
    });

    describe('Pending Notifications', function () {
        it('returns pending items; null notify_time counts as immediate', function () {
            [$user, $company] = createAdminWithCompany();
            $meeting = Meeting::create(['company_id' => $company->id, 'name' => '待办测试']);

            // pending with notify time in past
            MeetingNotice::create([
                'meeting_id' => $meeting->id,
                'company_id' => $company->id,
                'notify_time' => now()->subHour(),
            ]);
            // pending with null notify time — still shown (immediate)
            MeetingNotice::create([
                'meeting_id' => $meeting->id,
                'company_id' => $company->id,
                'notify_time' => null,
            ]);
            // future notify: excluded
            MeetingNotice::create([
                'meeting_id' => $meeting->id,
                'company_id' => $company->id,
                'notify_time' => now()->addDay(),
            ]);
            // already confirmed: excluded
            MeetingNotice::create([
                'meeting_id' => $meeting->id,
                'company_id' => $company->id,
                'notify_time' => now()->subHour(),
                'confirm_time' => now(),
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/meeting-notifications/pending?company_id={$company->id}");

            $response->assertOk()->assertJsonCount(2, 'data');
        });
    });
});
