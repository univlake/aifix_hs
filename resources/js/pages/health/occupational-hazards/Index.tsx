import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const DECLARE_OPTIONS = [
    { value: '已申报', label: '已申报' },
    { value: '未申报', label: '未申报' },
    { value: '申报中', label: '申报中' },
];

const HAZARD_TYPES = [
    { value: '化学因素', label: '化学因素' },
    { value: '物理因素', label: '物理因素' },
    { value: '生物因素', label: '生物因素' },
    { value: '放射性因素', label: '放射性因素' },
    { value: '其他因素', label: '其他因素' },
];

const config: CrudPageConfig = {
    title: '职业病危害因素',
    endpoint: '/occupational-hazards',
    columns: [
        { key: 'name', header: '危害因素名称' },
        {
            key: 'type',
            header: '危害类型',
            width: 120,
            render: (value) => value
                ? <span className="rounded-md border border-violet-900/40 bg-violet-600/8 px-2 py-0.5 text-xs text-violet-400">{value as string}</span>
                : <span className="text-slate-700">—</span>,
        },
        { key: 'number', header: '接触人数', width: 100 },
        {
            key: 'is_declare',
            header: '申报状态',
            width: 100,
            render: (value) => {
                if (!value) return <span className="text-slate-700">—</span>;
                const color = value === '已申报'
                    ? 'border-emerald-500/20 bg-emerald-600/8 text-emerald-400'
                    : value === '申报中'
                      ? 'border-amber-500/20 bg-amber-600/8 text-amber-400'
                      : 'border-slate-700/50 bg-slate-700/20 text-slate-500';
                return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${color}`}>{value as string}</span>;
            },
        },
        { key: 'declare_date', header: '申报日期', width: 120 },
    ],
    formFields: [
        { key: 'name', label: '危害因素名称', type: 'text', required: true },
        {
            key: 'type',
            label: '危害类型',
            type: 'select',
            options: HAZARD_TYPES,
            placeholder: '请选择类型',
        },
        { key: 'number', label: '接触人数', type: 'text' },
        {
            key: 'is_declare',
            label: '申报状态',
            type: 'select',
            options: DECLARE_OPTIONS,
            placeholder: '请选择申报状态',
        },
        { key: 'declare_date', label: '申报日期', type: 'date' },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索危害因素名称...',
};

export default function OccupationalHazardsIndex() {
    return <CrudPage config={config} />;
}
