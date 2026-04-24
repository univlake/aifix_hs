import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const FACILITY_TYPES = [
    { value: '火灾报警及联动控制系统', label: '火灾报警及联动控制系统' },
    { value: '消火栓给水系统', label: '消火栓给水系统' },
    { value: '喷水灭火系统', label: '喷水灭火系统' },
    { value: '防火分隔设施系统', label: '防火分隔设施系统' },
    { value: '防排烟系统', label: '防排烟系统' },
    { value: '智慧消防系统', label: '智慧消防系统' },
    { value: '其他', label: '其他' },
];

const AUTOMATION_OPTIONS = [
    { value: '全自动设备', label: '全自动设备' },
    { value: '需作业人员辅助操作设备', label: '需作业人员辅助操作设备' },
    { value: '作业人员长时间操作设备', label: '作业人员长时间操作设备' },
];

const config: CrudPageConfig = {
    title: '消防设施',
    endpoint: '/fire-facilities',
    enableDetail: true,
    columns: [
        { key: 'equipment_name', header: '设施名称' },
        { key: 'special_type', header: '设施类型', width: 200 },
        { key: 'utilized_location', header: '安装位置', width: 140 },
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
            label: '设施名称',
            type: 'text',
            required: true,
        },
        {
            key: 'special_type',
            label: '设施类型',
            type: 'select',
            options: FACILITY_TYPES,
            placeholder: '请选择设施类型',
        },
        { key: 'utilized_location', label: '安装位置', type: 'text' },
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
    searchPlaceholder: '搜索设施名称...',
    copyEndpoint: '/fire-facilities/copy',
    permissions: {
        list: 'fire-facilities.list',
        create: 'fire-facilities.create',
        update: 'fire-facilities.update',
        delete: 'fire-facilities.delete',
    },
};

export default function FireFacilitiesIndex() {
    return <CrudPage config={config} />;
}
