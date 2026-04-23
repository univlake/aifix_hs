import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const EQUIPMENT_TYPES = [
    { value: '火灾报警及联动控制系统', label: '火灾报警及联动控制系统' },
    { value: '应急照明和疏散指示系统', label: '应急照明和疏散指示系统' },
    { value: '防毒面罩', label: '防毒面罩' },
    { value: '灭火器', label: '灭火器' },
    { value: '水带苗子', label: '水带苗子' },
    { value: '其他', label: '其他' },
];

const AUTOMATION_OPTIONS = [
    { value: '全自动设备', label: '全自动设备' },
    { value: '需作业人员辅助操作设备', label: '需作业人员辅助操作设备' },
    { value: '作业人员长时间操作设备', label: '作业人员长时间操作设备' },
];

const config: CrudPageConfig = {
    title: '消防器材',
    endpoint: '/fire-equipment',
    enableDetail: true,
    columns: [
        { key: 'equipment_name', header: '器材名称' },
        { key: 'special_type', header: '器材类型', width: 200 },
        { key: 'utilized_location', header: '配置位置', width: 140 },
        { key: 'use_time', header: '投用时间', width: 110 },
        {
            key: 'automation_type',
            header: '自动化程度',
            width: 200,
            render: (value) =>
                value ? (
                    <span className="inline-flex items-center rounded-md border border-slate-700/50 bg-slate-700/20 px-2 py-0.5 text-xs text-slate-400">
                        {value as string}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'equipment_name',
            label: '器材名称',
            type: 'text',
            required: true,
        },
        {
            key: 'special_type',
            label: '器材类型',
            type: 'select',
            options: EQUIPMENT_TYPES,
            placeholder: '请选择器材类型',
        },
        { key: 'utilized_location', label: '配置位置', type: 'text' },
        { key: 'use_time', label: '投用时间', type: 'date' },
        {
            key: 'automation_type',
            label: '自动化程度',
            type: 'select',
            options: AUTOMATION_OPTIONS,
            placeholder: '请选择自动化程度',
        },
        { key: 'maintain_info', label: '维护信息', type: 'text' },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'equipment_name',
    searchPlaceholder: '搜索器材名称...',
    copyEndpoint: '/fire-equipment/copy',
    permissions: {
        list: 'fire-equipment.list',
        create: 'fire-equipment.create',
        update: 'fire-equipment.update',
        delete: 'fire-equipment.delete',
    },
};

export default function FireEquipmentIndex() {
    return <CrudPage config={config} />;
}
