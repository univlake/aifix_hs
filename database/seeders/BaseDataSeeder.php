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

        $dangerousCraftTypes = ['光气及光气化工艺', '电解工艺', '氯化工艺', '硝化工艺', '合成氨工艺', '裂解(裂化)工艺', '氟化工艺', '加氢工艺', '重氮化工艺', '氧化工艺', '过氧化工艺', '氨基化工艺', '磺化工艺', '聚合工艺', '烷基化工艺', '新型煤化工艺', '电石生产工艺', '偶氮化工艺'];

        foreach ($dangerousCraftTypes as $title) {
            DB::table('dangerous_craft_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $processTypes = ['高温高压（压力大于等于0.1Mpa，温度高于及等于100度）', '铸造工艺', '冲剪工艺', '吊装', '焊接', '压力容器操作', '喷涂工艺', '产生可燃爆粉尘的工艺', '产生有毒有害物质的工艺', '使用甲乙类危险化学品的工艺', '涉及涉氨制冷工艺', '其他'];

        foreach ($processTypes as $title) {
            DB::table('process_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $spaceWorkTypes = ['坑', '沟', '槽', '池', '井', '管道', '罐', '箱', '炉', '室', '仓(斗)', '塔(釜)', '其他', '反应器', '锅筒'];

        foreach ($spaceWorkTypes as $title) {
            DB::table('space_work_types')->insertOrIgnore([
                'title' => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $hazards = ['易燃易爆气体或者其蒸汽', '有毒气体或者其蒸汽', '缺氧或富氧', '坍塌', '机械伤害', '酸碱腐蚀性化学品或者其蒸汽', '易挥发的危险化学品', '通风不良', '交叉作业', '高热高湿', '物体打击', '高处坠落', '触电', '灼烫'];

        foreach ($hazards as $title) {
            DB::table('hazards')->insertOrIgnore([
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
                'company_id' => 1,
                'role_id' => 1,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $superAdmin->assignRole('super-admin');
    }
}
