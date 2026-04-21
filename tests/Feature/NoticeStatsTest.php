<?php

use App\Models\Company;
use App\Models\NewNotify;
use App\Models\NewNotifyScope;
use App\Models\OfficeNotify;
use App\Models\OfficeNotifyScope;

describe('Notice feedback stats', function () {
    it('summary returns per-subordinate counts for both notice types', function () {
        [$user, $parent] = createAdminWithCompany();
        $subA = Company::factory()->create(['pid' => $parent->id]);
        $subB = Company::factory()->create(['pid' => $parent->id]);

        $office1 = OfficeNotify::create(['company_id' => $parent->id, 'name' => '任务1']);
        $office2 = OfficeNotify::create(['company_id' => $parent->id, 'name' => '任务2']);

        OfficeNotifyScope::create(['office_notify_id' => $office1->id, 'company_id' => $subA->id, 'feedback_status' => '已反馈']);
        OfficeNotifyScope::create(['office_notify_id' => $office2->id, 'company_id' => $subA->id]);
        OfficeNotifyScope::create(['office_notify_id' => $office1->id, 'company_id' => $subB->id]);
        OfficeNotifyScope::create(['office_notify_id' => $office2->id, 'company_id' => $subB->id]);

        $new1 = NewNotify::create(['company_id' => $parent->id, 'name' => '通知1']);
        NewNotifyScope::create(['new_notify_id' => $new1->id, 'company_id' => $subA->id, 'read_status' => '已读']);
        NewNotifyScope::create(['new_notify_id' => $new1->id, 'company_id' => $subB->id]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/notice-stats/summary?company_id={$parent->id}");

        $response->assertOk();
        $rows = collect($response->json('data'))->keyBy('company_id');
        expect($rows->count())->toBe(2);

        $a = $rows->get($subA->id);
        expect($a['office_total'])->toBe(2)
            ->and($a['office_fed_back'])->toBe(1)
            ->and($a['office_pending'])->toBe(1)
            ->and($a['new_total'])->toBe(1)
            ->and($a['new_read'])->toBe(1)
            ->and($a['new_pending'])->toBe(0)
            ->and($a['pending_total'])->toBe(1);

        $b = $rows->get($subB->id);
        expect($b['office_total'])->toBe(2)
            ->and($b['office_fed_back'])->toBe(0)
            ->and($b['office_pending'])->toBe(2)
            ->and($b['new_total'])->toBe(1)
            ->and($b['new_read'])->toBe(0)
            ->and($b['new_pending'])->toBe(1)
            ->and($b['pending_total'])->toBe(3);
    });

    it('pending returns only unresponded notices for the given subordinate', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);

        $office1 = OfficeNotify::create(['company_id' => $parent->id, 'name' => '待反馈']);
        $office2 = OfficeNotify::create(['company_id' => $parent->id, 'name' => '已反馈']);
        OfficeNotifyScope::create(['office_notify_id' => $office1->id, 'company_id' => $sub->id]);
        OfficeNotifyScope::create(['office_notify_id' => $office2->id, 'company_id' => $sub->id, 'feedback_status' => '已反馈']);

        $new1 = NewNotify::create(['company_id' => $parent->id, 'name' => '未读']);
        $new2 = NewNotify::create(['company_id' => $parent->id, 'name' => '已读']);
        NewNotifyScope::create(['new_notify_id' => $new1->id, 'company_id' => $sub->id]);
        NewNotifyScope::create(['new_notify_id' => $new2->id, 'company_id' => $sub->id, 'read_status' => '已读']);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/notice-stats/pending?subordinate_id={$sub->id}");

        $response->assertOk();
        $officeNames = collect($response->json('data.office'))->pluck('notice_name')->all();
        $newNames = collect($response->json('data.new'))->pluck('notice_name')->all();
        expect($officeNames)->toBe(['待反馈'])
            ->and($newNames)->toBe(['未读']);
    });
});
