<?php

use App\Models\SpaceWorkType;

describe('SpaceWorkType API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user] = createAdminWithCompany();
            SpaceWorkType::create(['title' => '容器作业']);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/space-work-types');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/space-work-types', ['title' => '管道作业']);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/space-work-types', ['title' => '越权']);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/space-work-types', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user] = createAdminWithCompany();
            $record = SpaceWorkType::create(['title' => '旧标题']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/space-work-types/{$record->id}", ['title' => '新标题']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user] = createUserWithCompany();
            $record = SpaceWorkType::create(['title' => '测试']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/space-work-types/{$record->id}", ['title' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user] = createAdminWithCompany();
            $record = SpaceWorkType::create(['title' => '待删除']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/space-work-types/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user] = createUserWithCompany();
            $record = SpaceWorkType::create(['title' => '测试']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/space-work-types/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
