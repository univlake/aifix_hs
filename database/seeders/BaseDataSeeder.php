<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BaseDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $enterpriseTypes = ['机械', '化工', '商贸租赁', '其他'];

        foreach ($enterpriseTypes as $title) {
            DB::table('enterprise_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $operationalTypes = ['生产', '停工', '改造', '搬迁'];

        foreach ($operationalTypes as $title) {
            DB::table('operational_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $safetyManagementTypes = [
            ['title' => '安全负责人', 'is_cert' => 1],
            ['title' => '安管员', 'is_cert' => 1],
            ['title' => '生产管理', 'is_cert' => 1],
            ['title' => '设备管理', 'is_cert' => 1],
            ['title' => '质量管理', 'is_cert' => 1],
            ['title' => '人事管理', 'is_cert' => 1],
            ['title' => '其他管理', 'is_cert' => 0],
        ];

        foreach ($safetyManagementTypes as $type) {
            DB::table('safety_management_types')->insertOrIgnore([
                'title' => $type['title'],
                'is_cert' => $type['is_cert'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 替换后的证件类型数组
        $recordTypes = ['安全生产许可证', '危化品安全使用许可证', '危化品登记证', '危化品使用备案', '重大危险源备案', '易制毒生产备案', '应急预案备案有效', '职业健康备案'];

        foreach ($recordTypes as $title) {
            DB::table('record_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $specialTypes = ['锅炉', '压力容器(含气瓶)', '压力管道', '电梯', '起重机械', '(厂)场内专用车辆'];

        foreach ($specialTypes as $title) {
            DB::table('special_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Super administrator account (bound to company id=4)
        $superAdmin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'password' => 'admin@admin',
                'nickname' => '超级管理员',
                'company_id' => 4,
                'role_id' => 1,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $superAdmin->assignRole('super-admin');
    }
}
