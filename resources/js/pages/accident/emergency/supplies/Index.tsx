import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '应急物资',
    endpoint: '/emergency-supplies',
    labelKey: 'name',
    columns: [
        { key: 'name', header: '物资名称' },
        { key: 'number', header: '数量', width: 100 },
        { key: 'save_user', header: '负责人', width: 120 },
        { key: 'tel', header: '联系电话', width: 140 },
        {
            key: 'comment',
            header: '备注',
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
        { key: 'name', label: '物资名称', type: 'text', required: true },
        { key: 'number', label: '数量', type: 'text' },
        { key: 'save_user', label: '负责人', type: 'text' },
        { key: 'tel', label: '联系电话', type: 'text' },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索物资名称...',
    permissions: {
        list: 'emergency-supplies.list',
        create: 'emergency-supplies.create',
        update: 'emergency-supplies.update',
        delete: 'emergency-supplies.delete',
    },
};

export default function EmergencySuppliesIndex() {
    return <CrudPage config={config} />;
}
