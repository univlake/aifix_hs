import type { CrudPageConfig } from '@/components/shared/CrudPage';

const TYPE_OPTIONS = [
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
].map((v) => ({ value: v, label: v }));

const DIRECT_CAUSE_OPTIONS = [
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
].map((v) => ({ value: v, label: v }));

const INDIRECT_CAUSE_OPTIONS = [
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
].map((v) => ({ value: v, label: v }));

const ACCIDENT_LEVEL_OPTIONS = [
    '未遂事故',
    '轻伤事故',
    '重伤事故',
    '一般事故',
    '较大事故',
    '重大事故',
    '特别重大事故',
].map((v) => ({ value: v, label: v }));

const DEGREE_INJURY_OPTIONS = [
    '死亡3人及以上事故',
    '死亡1-2人事故',
    '火灾爆炸中毒引起的未造成人员死亡事故',
    '重伤',
    '轻伤',
    '未遂',
].map((v) => ({ value: v, label: v }));

export const accidentReportConfig: CrudPageConfig = {
    title: '事故上报',
    endpoint: '/accident-bulletins',
    labelKey: 'content',
    enableDetail: true,
    filterFields: [
        { key: 'type', placeholder: '全部事故类型', options: TYPE_OPTIONS },
        {
            key: 'accident_level',
            placeholder: '全部事故等级',
            options: ACCIDENT_LEVEL_OPTIONS,
        },
    ],
    columns: [
        {
            key: 'happen_time',
            header: '发生时间',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            key: 'type',
            header: '事故类型',
            width: 110,
            render: (val) =>
                val ? String(val) : <span className="text-slate-700">—</span>,
        },
        {
            key: 'accident_level',
            header: '事故等级',
            width: 110,
            render: (val) =>
                val ? String(val) : <span className="text-slate-700">—</span>,
        },
        {
            key: 'department',
            header: '发生部门',
            width: 140,
            render: (val) =>
                val ? String(val) : <span className="text-slate-700">—</span>,
        },
        {
            key: 'happen_area',
            header: '发生地点',
            width: 160,
            render: (val) =>
                val ? String(val) : <span className="text-slate-700">—</span>,
        },
        {
            key: 'staff_die',
            header: '死亡',
            width: 60,
            render: (val) => (
                <span className="text-slate-400">{(val as number) ?? 0}</span>
            ),
        },
        {
            key: 'staff_hurt',
            header: '受伤',
            width: 60,
            render: (val) => (
                <span className="text-slate-400">{(val as number) ?? 0}</span>
            ),
        },
        {
            key: 'content',
            header: '事故经过',
            width: 260,
            render: (val) => {
                const s = val ? String(val) : '';

                return s ? (
                    <span title={s}>
                        {s.length > 30 ? s.slice(0, 30) + '…' : s}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
    ],
    formFields: [
        {
            key: 'type',
            label: '事故类型',
            type: 'select',
            required: true,
            options: TYPE_OPTIONS,
            placeholder: '请选择事故类型',
        },
        {
            key: 'accident_level',
            label: '事故等级',
            type: 'select',
            required: true,
            options: ACCIDENT_LEVEL_OPTIONS,
            placeholder: '请选择事故等级',
        },
        { key: 'happen_time', label: '发生时间', type: 'date', required: true },
        { key: 'department', label: '发生部门', type: 'text' },
        { key: 'happen_area', label: '发生地点', type: 'text', colSpan: 2 },
        {
            key: 'degree_injury',
            label: '伤亡程度',
            type: 'select',
            options: DEGREE_INJURY_OPTIONS,
            placeholder: '请选择伤亡程度',
        },
        {
            key: 'direct_cause',
            label: '直接原因',
            type: 'select',
            options: DIRECT_CAUSE_OPTIONS,
            placeholder: '请选择直接原因',
        },
        {
            key: 'indirect_cause',
            label: '间接原因',
            type: 'select',
            options: INDIRECT_CAUSE_OPTIONS,
            placeholder: '请选择间接原因',
            colSpan: 2,
        },
        { key: 'staff_die', label: '员工死亡人数', type: 'number' },
        { key: 'staff_hurt', label: '员工受伤人数', type: 'number' },
        { key: 'not_staff_die', label: '非员工死亡人数', type: 'number' },
        { key: 'not_staff_hurt', label: '非员工受伤人数', type: 'number' },
        {
            key: 'direct_loss_property',
            label: '直接经济损失 (万元)',
            type: 'text',
        },
        {
            key: 'gauge_loss_property',
            label: '间接经济损失 (万元)',
            type: 'text',
        },
        { key: 'content', label: '事故经过', type: 'textarea', colSpan: 2 },
        {
            key: 'accident_report_url',
            label: '事故报告附件',
            type: 'file',
            colSpan: 2,
        },
        {
            key: 'accident_photo_url',
            label: '现场照片',
            type: 'file',
            colSpan: 2,
        },
        {
            key: 'kids',
            label: '伤亡人员明细',
            type: 'sub-table',
            colSpan: 2,
            subFields: [
                { key: 'name', label: '姓名', placeholder: '姓名' },
                { key: 'sex', label: '性别', placeholder: '男/女' },
                { key: 'age', label: '年龄', placeholder: '年龄' },
                { key: 'department', label: '部门', placeholder: '所在部门' },
                { key: 'work_type', label: '工种', placeholder: '工种' },
                { key: 'work_age', label: '工龄', placeholder: '年' },
                {
                    key: 'education_level',
                    label: '文化程度',
                    placeholder: '本科/高中等',
                },
                {
                    key: 'degree_injury',
                    label: '伤害程度',
                    placeholder: '死亡/重伤/轻伤',
                },
                { key: 'days_off', label: '误工天数', placeholder: '天数' },
            ],
        },
    ],
    searchField: 'type',
    searchPlaceholder: '按事故类型搜索...',
    permissions: {
        list: 'accident-bulletins.list',
        create: 'accident-bulletins.create',
        update: 'accident-bulletins.update',
        delete: 'accident-bulletins.delete',
    },
};
