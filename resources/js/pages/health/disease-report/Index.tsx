import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const DISEASE_TYPES = [
    {
        value: '职业性尘肺病及其他呼吸系统疾病',
        label: '职业性尘肺病及其他呼吸系统疾病',
    },
    { value: '职业性皮肤病', label: '职业性皮肤病' },
    { value: '职业性眼病', label: '职业性眼病' },
    { value: '职业性耳鼻喉口腔疾病', label: '职业性耳鼻喉口腔疾病' },
    { value: '职业性化学中毒', label: '职业性化学中毒' },
    { value: '物理因素所致职业病', label: '物理因素所致职业病' },
    { value: '职业性放射性疾病', label: '职业性放射性疾病' },
    { value: '职业性传染病', label: '职业性传染病' },
    { value: '职业性肿瘤', label: '职业性肿瘤' },
    { value: '其他职业病', label: '其他职业病' },
];

const config: CrudPageConfig = {
    title: '职业病报告',
    endpoint: '/health-reports',
    enableDetail: true,
    columns: [
        { key: 'name', header: '患者姓名' },
        { key: 'post', header: '岗位', width: 120 },
        {
            key: 'type',
            header: '职业病类型',
            width: 200,
            render: (value) =>
                value ? (
                    <span className="rounded-md border border-violet-900/40 bg-violet-600/8 px-2 py-0.5 text-xs text-violet-400">
                        {value as string}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        { key: 'find_date', header: '发现日期', width: 110 },
        {
            key: 'is_true',
            header: '是否确诊',
            width: 100,
            render: (value) =>
                value ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-600/8 px-2 py-0.5 text-xs text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        已确诊
                    </span>
                ) : (
                    <span className="text-xs text-slate-500">待确诊</span>
                ),
        },
        { key: 'mechanism', header: '诊断机构', width: 150 },
        { key: 'identify_date', header: '确诊日期', width: 110 },
    ],
    formFields: [
        { key: 'name', label: '患者姓名', type: 'text', required: true },
        { key: 'post', label: '岗位', type: 'text' },
        {
            key: 'type',
            label: '职业病类型',
            type: 'select',
            options: DISEASE_TYPES,
            placeholder: '请选择职业病类型',
        },
        { key: 'find_date', label: '发现日期', type: 'date' },
        { key: 'is_true', label: '已确诊', type: 'switch' },
        { key: 'mechanism', label: '诊断机构', type: 'text' },
        { key: 'identify_date', label: '确诊日期', type: 'date' },
        { key: 'annex_url', label: '职业病鉴定报告', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索患者姓名...',
    permissions: {
        list: 'health-reports.list',
        create: 'health-reports.create',
        update: 'health-reports.update',
        delete: 'health-reports.delete',
    },
};

export default function DiseaseReportIndex() {
    return <CrudPage config={config} />;
}
