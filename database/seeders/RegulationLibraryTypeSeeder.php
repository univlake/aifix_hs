<?php

namespace Database\Seeders;

use App\Models\RegulationLibraryType;
use Illuminate\Database\Seeder;

class RegulationLibraryTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            '安全生产部门规章',
            '安全生产法律',
            '安全生产行政法规',
            '标准规范',
            '地方管理条例',
            '劳动防护用品',
            '劳动卫生',
            '培训考核',
            '三同时',
            '伤亡事故调查和处理',
            '特种设备',
            '危险化学品',
            '消防管理',
            '综合类',
            '安全技术综合',
            '电气方面',
            '防火防爆安全技术',
            '机械方面',
            '交通',
            '喷涂企业',
            '涉氨企业',
            '涉燃爆粉尘',
            '生产设备安全技术',
            '消防综合',
            '冶炼企业',
            '有限空间',
        ];

        foreach ($types as $sort => $title) {
            RegulationLibraryType::firstOrCreate(
                ['title' => $title],
                ['pid' => 0, 'all_name' => $title, 'sort' => $sort]
            );
        }
    }
}
