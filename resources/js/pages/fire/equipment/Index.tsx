import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const AUTOMATION_OPTIONS = [
    { value: '有自动化控制系统', label: '有自动化控制系统' },
    { value: '无自动化控制系统', label: '无自动化控制系统' },
    { value: '部分自动化', label: '部分自动化' },
];

const config: CrudPageConfig = {
    title: '消防器材',
    endpoint: '/fire-equipment',
    columns: [
        { key: 'equipment_name', header: '器材名称' },
        { key: 'special_type', header: '器材类型', width: 120 },
        { key: 'utilized_location', header: '配置位置', width: 140 },
        { key: 'use_time', header: '配置时间', width: 110 },
        {
            key: 'automation_type',
            header: '控制类型',
            width: 160,
            render: (value) => {
                if (!value) return <span className="text-slate-700">—</span>;
                const hasAuto = (value as string).includes('有');
                return (
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                        hasAuto
                            ? 'border-emerald-500/20 bg-emerald-600/8 text-emerald-400'
                            : 'border-slate-700/50 bg-slate-700/20 text-slate-500'
                    }`}>
                        {value as string}
                    </span>
                );
            },
        },
    ],
    formFields: [
        { key: 'equipment_name', label: '器材名称', type: 'text', required: true },
        { key: 'special_type', label: '器材类型', type: 'text' },
        { key: 'utilized_location', label: '配置位置', type: 'text' },
        { key: 'use_time', label: '配置时间', type: 'date' },
        {
            key: 'automation_type',
            label: '控制类型',
            type: 'select',
            options: AUTOMATION_OPTIONS,
            placeholder: '请选择控制类型',
        },
        { key: 'maintain_info', label: '维护信息', type: 'text' },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'equipment_name',
    searchPlaceholder: '搜索器材名称...',
};

export default function FireEquipmentIndex() {
    return <CrudPage config={config} />;
}
