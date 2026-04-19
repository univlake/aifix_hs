<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccidentBulletinsRequest extends FormRequest
{
    public const TYPES = [
        '物体打击', '车辆伤害', '机械伤害', '起重伤害', '触电', '溺水', '灼烫', '火灾',
        '高处堕落', '坍塌', '冒顶片帮', '透水', '放炮', '火药爆炸', '瓦斯爆炸', '锅炉爆炸',
        '容器爆炸', '其他爆炸', '中毒和窒息', '其他伤害',
    ];

    public const DIRECT_CAUSES = [
        '操作错误/忽视安全/忽视警告', '安全装置失效', '使用不安全设备', '手代替工具操作',
        '物体存放不当', '攀坐不安全位置', '冒险进入危险场所', '在起吊物下作业停留',
        '机器运转时加油修理检查调整焊接清扫等', '忽视个人防护用品使用', '有分散注意力行为',
        '不安全装束', '易燃易爆等危险物品处理错误', '防护保险信号等装置缺乏或有缺陷',
        '设备设施工具有缺陷', '个人防护用品用具缺少或有缺陷', '生产施工场地环境不良',
    ];

    public const INDIRECT_CAUSES = [
        '技术和设计有缺陷', '设备设施工具有缺陷', '防护保险信号等装置缺乏或有缺陷',
        '生产场所环境不良', '个人防护用品缺少或有缺陷', '没有安全操作规程或不健全',
        '违反操作规程或劳动纪律', '劳动组织不合理', '对现场工作缺乏检查或指挥有错误',
        '教育培训不够缺乏安全操作知识', '其他',
    ];

    public const ACCIDENT_LEVELS = [
        '未遂事故', '轻伤事故', '重伤事故', '一般事故', '较大事故', '重大事故', '特别重大事故',
    ];

    public const DEGREE_INJURIES = [
        '死亡3人及以上事故', '死亡1-2人事故', '火灾爆炸中毒引起的未造成人员死亡事故',
        '重伤', '轻伤', '未遂',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'type' => ['nullable', Rule::in(self::TYPES)],
            'direct_cause' => ['nullable', Rule::in(self::DIRECT_CAUSES)],
            'indirect_cause' => ['nullable', Rule::in(self::INDIRECT_CAUSES)],
            'accident_level' => ['nullable', Rule::in(self::ACCIDENT_LEVELS)],
            'degree_injury' => ['nullable', Rule::in(self::DEGREE_INJURIES)],
            'department' => 'nullable|string|max:255',
            'happen_time' => 'nullable|date',
            'happen_area' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'direct_loss_property' => 'nullable|string|max:64',
            'gauge_loss_property' => 'nullable|string|max:64',
            'staff_die' => 'nullable|integer|min:0',
            'staff_hurt' => 'nullable|integer|min:0',
            'not_staff_die' => 'nullable|integer|min:0',
            'not_staff_hurt' => 'nullable|integer|min:0',
            'accident_report_url' => 'nullable|string',
            'accident_photo_url' => 'nullable|string',
            'kids' => 'nullable|array',
            'kids.*.name' => 'nullable|string|max:64',
            'kids.*.degree_injury' => 'nullable|string|max:64',
            'kids.*.department' => 'nullable|string|max:128',
            'kids.*.age' => 'nullable|integer|min:0|max:150',
            'kids.*.sex' => 'nullable|string|max:8',
            'kids.*.work_type' => 'nullable|string|max:64',
            'kids.*.work_age' => 'nullable|integer|min:0|max:100',
            'kids.*.education_level' => 'nullable|string|max:64',
            'kids.*.days_off' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'type.in' => '事故类型取值不合法',
            'direct_cause.in' => '直接原因取值不合法',
            'indirect_cause.in' => '间接原因取值不合法',
            'accident_level.in' => '事故等级取值不合法',
            'degree_injury.in' => '伤亡程度取值不合法',
        ];
    }
}
