export interface AnnualStat {
    year: string;
    accident_count: number;
    hurt_count: number;
    death_count: number;
}

export interface AccidentRow {
    id: number;
    company_id: number;
    user_id: number | null;
    happen_time: string | null;
    type: string | null;
    accident_level: string | null;
    degree_injury: string | null;
    staff_die: number;
    staff_hurt: number;
    not_staff_die: number;
    not_staff_hurt: number;
    department: string | null;
    happen_area: string | null;
    company: { id: number; title: string } | null;
}

export interface KidRow {
    id?: number;
    name: string | null;
    sex: string | null;
    age: string | null;
    department: string | null;
    work_type: string | null;
    work_age: string | null;
    education_level: string | null;
    degree_injury: string | null;
    days_off: string | null;
}

export interface AccidentFull extends AccidentRow {
    content: string | null;
    direct_cause: string | null;
    indirect_cause: string | null;
    direct_loss_property: string | null;
    gauge_loss_property: string | null;
    accident_report_url: string | null;
    accident_photo_url: string | null;
    kids: KidRow[];
}

export type EditForm = Omit<AccidentFull, 'id' | 'user_id' | 'company'>;

export function toEditForm(detail: AccidentFull): EditForm {
    const { id, user_id, company, ...rest } = detail;

    void id;
    void user_id;
    void company;

    return rest;
}

export const TYPE_OPTIONS = [
    '物体打击',
    '车辆伤害',
    '机械伤害',
    '起重伤害',
    '触电',
    '溺水',
    '灼烫',
    '火灾',
    '高处堕落',
    '坍塌',
    '冒顶片帮',
    '透水',
    '放炮',
    '火药爆炸',
    '瓦斯爆炸',
    '锅炉爆炸',
    '容器爆炸',
    '其他爆炸',
    '中毒和窒息',
    '其他伤害',
];

export const LEVEL_OPTIONS = [
    '未遂事故',
    '轻伤事故',
    '重伤事故',
    '一般事故',
    '较大事故',
    '重大事故',
    '特别重大事故',
];

export const DIRECT_CAUSE_OPTIONS = [
    '操作错误/忽视安全/忽视警告',
    '安全装置失效',
    '使用不安全设备',
    '手代替工具操作',
    '物体存放不当',
    '攀坐不安全位置',
    '冒险进入危险场所',
    '在起吊物下作业停留',
    '机器运转时加油修理检查调整焊接清扫等',
    '忽视个人防护用品使用',
    '有分散注意力行为',
    '不安全装束',
    '易燃易爆等危险物品处理错误',
    '防护保险信号等装置缺乏或有缺陷',
    '设备设施工具有缺陷',
    '个人防护用品用具缺少或有缺陷',
    '生产施工场地环境不良',
];

export const INDIRECT_CAUSE_OPTIONS = [
    '技术和设计有缺陷',
    '设备设施工具有缺陷',
    '防护保险信号等装置缺乏或有缺陷',
    '生产场所环境不良',
    '个人防护用品缺少或有缺陷',
    '没有安全操作规程或不健全',
    '违反操作规程或劳动纪律',
    '劳动组织不合理',
    '对现场工作缺乏检查或指挥有错误',
    '教育培训不够缺乏安全操作知识',
    '其他',
];

export const DEGREE_INJURY_OPTIONS = [
    '死亡3人及以上事故',
    '死亡1-2人事故',
    '火灾爆炸中毒引起的未造成人员死亡事故',
    '重伤',
    '轻伤',
    '未遂',
];

export const FIELD_LABELS: Record<string, string> = {
    type: '事故类型',
    accident_level: '事故等级',
    happen_time: '发生时间',
    department: '发生部门',
    happen_area: '发生地点',
    degree_injury: '伤亡程度',
    direct_cause: '直接原因',
    indirect_cause: '间接原因',
    staff_die: '员工死亡',
    staff_hurt: '员工受伤',
    not_staff_die: '非员工死亡',
    not_staff_hurt: '非员工受伤',
    direct_loss_property: '直接经济损失(万元)',
    gauge_loss_property: '间接经济损失(万元)',
    content: '事故经过',
    accident_report_url: '事故报告',
    accident_photo_url: '现场照片',
};

export const KID_FIELDS = [
    'name',
    'sex',
    'age',
    'department',
    'work_type',
    'work_age',
    'education_level',
    'degree_injury',
    'days_off',
] as const;

export const KID_HEADERS = [
    '姓名',
    '性别',
    '年龄',
    '部门',
    '工种',
    '工龄',
    '文化程度',
    '伤害程度',
    '误工天数',
];

export const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
