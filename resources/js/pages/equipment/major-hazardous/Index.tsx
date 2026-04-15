import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const AUTOMATION_OPTIONS = [
    { value: '有自动化控制系统', label: '有自动化控制系统' },
    { value: '无自动化控制系统', label: '无自动化控制系统' },
    { value: '部分自动化', label: '部分自动化' },
];

const config: CrudPageConfig = {
    title: '重大危险设备',
    endpoint: '/dangerous-equipment',
    columns: [
        { key: 'equipment_name', header: '设备名称' },
        { key: 'utilized_location', header: '使用位置', width: 140 },
        { key: 'norm_model', header: '规格型号', width: 130 },
        { key: 'serial_number', header: '设备编号', width: 130 },
        { key: 'use_time', header: '投用时间', width: 110 },
        {
            key: 'automation_type',
            header: '自动化类型',
            width: 160,
            render: (value) => {
                if (!value) return <span className="text-slate-700">—</span>;
                const hasAuto = (value as string).includes('有');
                return (
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${
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
        { key: 'equipment_name', label: '设备名称', type: 'text', required: true },
        { key: 'utilized_location', label: '使用位置', type: 'text' },
        { key: 'norm_model', label: '规格型号', type: 'text' },
        { key: 'serial_number', label: '设备编号', type: 'text' },
        { key: 'use_time', label: '投用时间', type: 'date' },
        {
            key: 'automation_type',
            label: '自动化类型',
            type: 'select',
            options: AUTOMATION_OPTIONS,
            placeholder: '请选择自动化类型',
        },
        { key: 'maintain_info', label: '维护信息', type: 'text' },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'equipment_name',
    searchPlaceholder: '搜索设备名称...',
};

export default function MajorHazardousEquipmentIndex() {
    return <CrudPage config={config} />;
}
