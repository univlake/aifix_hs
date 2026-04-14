<?php

use App\Models\Building;

describe('Building API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            Building::create([
                'company_id' => $company->id,
                'title' => '测试建筑',
                'area' => '100',
                'fire_class' => '一级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/buildings');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = Building::create([
                'company_id' => $company->id,
                'title' => '详情测试',
                'area' => '200',
                'fire_class' => '二级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/buildings/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.title', '详情测试');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/buildings/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/buildings', [
                    'company_id' => $company->id,
                    'title' => '新建筑',
                    'area' => '300',
                    'fire_class' => '一级',
                ]);

            $response->assertOk()
                ->assertJsonPath('data.title', '新建筑');

            $this->assertDatabaseHas('buildings', ['title' => '新建筑']);
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/buildings', [
                    'company_id' => $company->id,
                    'title' => '无权创建',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/buildings', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = Building::create([
                'company_id' => $company->id,
                'title' => '旧标题',
                'area' => '100',
                'fire_class' => '一级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/buildings/{$record->id}", [
                    'title' => '新标题',
                ]);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = Building::create([
                'company_id' => $company->id,
                'title' => '测试',
                'area' => '100',
                'fire_class' => '一级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/buildings/{$record->id}", [
                    'title' => '越权更新',
                ]);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('soft deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = Building::create([
                'company_id' => $company->id,
                'title' => '待删除',
                'area' => '100',
                'fire_class' => '一级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/buildings/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = Building::create([
                'company_id' => $company->id,
                'title' => '测试',
                'area' => '100',
                'fire_class' => '一级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/buildings/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
