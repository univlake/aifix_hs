<?php

use App\Models\Company;

describe('Dashboard / TIER B aggregator endpoints', function () {
    describe('TodosController', function () {
        it('returns success for valid params', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/todos?company_id='.$company->id.'&type=all')
                ->assertOk();
        });

        it('validates required params', function () {
            [$user] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/todos')
                ->assertStatus(422);
        });

        it('returns success for /todos-list-table', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/todos-list-table?company_id='.$company->id)
                ->assertOk();
        });
    });

    describe('HomesController', function () {
        it('returns early-warning placeholder', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/homes-early-warning?company_id='.$company->id)
                ->assertOk();
        });

        it('returns company info', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/homes-company-info?company_id='.$company->id)
                ->assertOk()
                ->assertJsonPath('data.pid_company_name', $company->title);
        });
    });

    describe('CompanyMapController', function () {
        it('returns paginated company list scoped to subordinates', function () {
            [$user, $company] = createAdminWithCompany();
            // Create a subordinate company
            Company::factory()->create(['pid' => $company->id, 'status' => 1]);

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/company-map')
                ->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data']]);
        });
    });

    describe('EnterpriseReportController', function () {
        it('returns success for index', function () {
            [$user] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/enterprise-report')
                ->assertOk();
        });
    });

    describe('RisksController', function () {
        it('blocks out-of-scope company_id with 403 (scope middleware)', function () {
            [$user] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/risks/portrait?company_id=99999')
                ->assertStatus(403);
        });

        it('returns success for portrait when company exists (empty when no logs)', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/risks/portrait?company_id='.$company->id)
                ->assertOk();
        });

        it('returns risk log timeline', function () {
            [$user, $company] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->getJson('/api/v1/risks/log?company_id='.$company->id)
                ->assertOk();
        });
    });
});
