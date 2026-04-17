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
            ['title' => '主要负责人', 'is_cert' => 1],
            ['title' => '安全生产管理人员', 'is_cert' => 1],
            ['title' => '特种作业人员', 'is_cert' => 1],
            ['title' => '其他从业人员', 'is_cert' => 0],
        ];

        foreach ($safetyManagementTypes as $type) {
            DB::table('safety_management_types')->insertOrIgnore([
                'title' => $type['title'],
                'is_cert' => $type['is_cert'],
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
