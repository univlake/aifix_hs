import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '较危险工艺',
    endpoint: '/hazardous-processes',
    labelKey: 'position',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        {
            key: 'process_type',
            header: '工艺名称',
            render: (val) => (val as Record<string, unknown>)?.title as string ?? '—',
        },
        { key: 'position', header: '所在位置' },
        { key: 'operating_people_num', header: '操作人数', width: 80 },
        {
            key: 'is_online_test',
            header: '在线监测',
            width: 80,
            render: (val) => (val ? '是' : '否'),
        },
        {
            key: 'is_automatic',
            header: '自动化控制',
            width: 90,
            render: (val) => (val ? '是' : '否'),
        },
    ],
    formFields: [
        { key: 'process_type_id', label: '工艺名称', type: 'select', optionsEndpoint: '/process-types', required: true, colSpan: 1 },
        { key: 'position', label: '所在位置', type: 'text', colSpan: 1 },
        { key: 'hazardous_chemical_id', label: '涉及危险化学品', type: 'select', optionsEndpoint: '/hazardous-chemicals', optionsLabelKey: 'name', colSpan: 1 },
        { key: 'dangerous_equipment_id', label: '危险设备', type: 'select', optionsEndpoint: '/dangerous-equipment', optionsLabelKey: 'equipment_name', colSpan: 1 },
        { key: 'other_equipment_name', label: '其他设备名称', type: 'text', colSpan: 1 },
        { key: 'operating_people_num', label: '操作人数', type: 'number', colSpan: 1 },
        { key: 'is_online_test', label: '在线监测', type: 'switch', colSpan: 1 },
        { key: 'is_automatic', label: '自动化控制', type: 'switch', colSpan: 1 },
        { key: 'is_control', label: '控制措施', type: 'switch', colSpan: 1 },
        { key: 'is_dust', label: '涉及粉尘', type: 'switch', colSpan: 1 },
    ],
    searchField: 'position',
    searchPlaceholder: '搜索工艺...',
};

export default function HazardousProcessIndex() {
    return <CrudPage config={config} />;
}
