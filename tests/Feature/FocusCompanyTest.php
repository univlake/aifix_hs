<?php

use App\Models\Company;
use App\Models\FocusCompany;

describe('FocusCompany API', function () {
    describe('Index (List)', function () {
        it('returns the focus list filtered by company_id', function () {
            [$user, $company] = createAdminWithCompany();
            $target = Company::factory()->create(['pid' => $company->id, 'title' => '关注企业A']);
            FocusCompany::create([
                'company_id' => $company->id,
                'focus_id' => $target->id,
                'user_id' => $user->id,
                'last_user_id' => $user->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/focus-companies?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id', 'focus_id', 'company_id', 'company' => ['id', 'title']]]]])
                ->assertJsonPath('data.data.0.company.title', '关注企业A');
        });

        it('filters by focus_id', function () {
            [$user, $company] = createAdminWithCompany();
            $t1 = Company::factory()->create(['pid' => $company->id]);
            $t2 = Company::factory()->create(['pid' => $company->id]);
            FocusCompany::create(['company_id' => $company->id, 'focus_id' => $t1->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);
            FocusCompany::create(['company_id' => $company->id, 'focus_id' => $t2->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/focus-companies?company_id='.$company->id.'&focus_id='.$t1->id);

            $response->assertOk()
                ->assertJsonCount(1, 'data.data')
                ->assertJsonPath('data.data.0.focus_id', $t1->id);
        });
    });

    describe('Store (Create)', function () {
        it('creates a focus record', function () {
            [$user, $company] = createAdminWithCompany();
            $target = Company::factory()->create(['pid' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/focus-companies', [
                    'company_id' => $company->id,
                    'focus_id' => $target->id,
                ]);

            $response->assertOk();
            $this->assertDatabaseHas('focus_companies', [
                'company_id' => $company->id,
                'focus_id' => $target->id,
                'user_id' => $user->id,
            ]);
        });
    });

    describe('Destroy', function () {
        it('deletes a focus record', function () {
            [$user, $company] = createAdminWithCompany();
            $target = Company::factory()->create(['pid' => $company->id]);
            $focus = FocusCompany::create([
                'company_id' => $company->id,
                'focus_id' => $target->id,
                'user_id' => $user->id,
                'last_user_id' => $user->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson('/api/v1/focus-companies/'.$focus->id);

            $response->assertOk();
            $this->assertSoftDeleted('focus_companies', ['id' => $focus->id]);
        });

        it('returns 404 for non-existent focus record', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->deleteJson('/api/v1/focus-companies/999999');

            $response->assertStatus(404);
        });
    });

    describe('Index response includes risk fields', function () {
        it('eager-loads company risk grade and score', function () {
            [$user, $company] = createAdminWithCompany();
            $target = Company::factory()->create([
                'pid' => $company->id,
                'title' => '风险关注企业',
                'inherent_risk' => 12.5,
                'inherent_risk_grade' => '红',
                'float_risk' => 8.0,
                'float_risk_grade' => '橙',
            ]);
            FocusCompany::create(['company_id' => $company->id, 'focus_id' => $target->id, 'user_id' => $user->id, 'last_user_id' => $user->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/focus-companies?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonPath('data.data.0.company.inherent_risk_grade', '红')
                ->assertJsonPath('data.data.0.company.float_risk_grade', '橙');
        });
    });
});
