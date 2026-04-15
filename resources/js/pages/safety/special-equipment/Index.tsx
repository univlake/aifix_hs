import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { cn } from '@/lib/utils';

function ValidPeriodCell({ value }: { value: unknown }) {
    if (!value) return <span className="text-slate-700">—</span>;
    const date = new Date(value as string);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    const expired = daysLeft < 0;
    const nearExpiry = daysLeft >= 0 && daysLeft <= 30;
    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
            expired
                ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                : nearExpiry
                  ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400',
        )}>
            {expired && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
            {nearExpiry && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
            {value as string}
        </span>
    );
}

const config: CrudPageConfig = {
    title: '特种设备',
    endpoint: '/special-equipment',
    columns: [
        { key: 'equipment_name', header: '设备名称' },
        {
            key: 'special_type',
            header: '设备类型',
            width: 120,
            render: (_, row) => {
                const t = (row.special_type as Record<string, unknown>)?.title;
                return t
                    ? <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-xs text-blue-400">{t as string}</span>
                    : <span className="text-slate-700">—</span>;
            },
        },
        { key: 'utilized_location', header: '使用位置', width: 140 },
        { key: 'serial_number', header: '设备编号', width: 140 },
        { key: 'use_time', header: '投用时间', width: 110 },
        {
            key: 'valid_period',
            header: '检验有效期',
            width: 130,
            render: (value) => <ValidPeriodCell value={value} />,
        },
        { key: 'inspect_unit', header: '检验单位', width: 160 },
    ],
    formFields: [
        { key: 'equipment_name', label: '设备名称', type: 'text', required: true },
        { key: 'special_type_id', label: '设备类型', type: 'select', optionsEndpoint: '/special-types' },
        { key: 'utilized_location', label: '使用位置', type: 'text' },
        { key: 'serial_number', label: '设备编号', type: 'text' },
        { key: 'norm_model1', label: '规格型号一', type: 'text' },
        { key: 'norm_model2', label: '规格型号二', type: 'text' },
        { key: 'norm_model3', label: '规格型号三', type: 'text' },
        { key: 'norm_model4', label: '规格型号四', type: 'text' },
        { key: 'use_time', label: '投用时间', type: 'date' },
        { key: 'valid_period', label: '检验有效期', type: 'date' },
        { key: 'inspect_unit', label: '检验单位', type: 'text' },
        { key: 'maintain_info', label: '维护信息', type: 'text' },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'equipment_name',
    searchPlaceholder: '搜索设备名称...',
};

export default function SpecialEquipmentIndex() {
    return <CrudPage config={config} />;
}
