import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const CHECKUP_TYPES = [
    { value: '岗前', label: '岗前' },
    { value: '岗中', label: '岗中' },
    { value: '岗后', label: '岗后' },
];

const config: CrudPageConfig = {
    title: '职业健康检查',
    endpoint: '/health-checkups',
    enableDetail: true,
    columns: [
        {
            key: 'type',
            header: '检查类型',
            width: 90,
            render: (value) =>
                value ? (
                    <span className="rounded-md border border-cyan-900/40 bg-cyan-600/8 px-2 py-0.5 text-xs text-cyan-400">
                        {value as string}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        { key: 'department', header: '部门', width: 140 },
        { key: 'number', header: '检查人数', width: 100 },
        { key: 'checkup_date', header: '检查日期', width: 110 },
        { key: 'checkup_expiry', header: '体检结果', width: 130 },
    ],
    formFields: [
        {
            key: 'type',
            label: '检查类型',
            type: 'select',
            required: true,
            options: CHECKUP_TYPES,
            placeholder: '请选择检查类型',
        },
        { key: 'department', label: '部门', type: 'text' },
        { key: 'number', label: '检查人数', type: 'text' },
        { key: 'checkup_date', label: '检查日期', type: 'date' },
        {
            key: 'checkup_expiry',
            label: '体检结果',
            type: 'textarea',
            colSpan: 2,
        },
        { key: 'measure', label: '防控措施', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 2 },
    ],
    searchField: 'type',
    searchPlaceholder: '搜索检查类型...',
    permissions: {
        list: 'health-checkups.list',
        create: 'health-checkups.create',
        update: 'health-checkups.update',
        delete: 'health-checkups.delete',
    },
};

export default function HealthCheckupsIndex() {
    return <CrudPage config={config} />;
}
