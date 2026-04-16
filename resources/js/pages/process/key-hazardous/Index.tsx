import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '重点监管危险工艺',
    endpoint: '/major-hazardous-processes',
    labelKey: 'name',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '工艺名称' },
        {
            key: 'dangerous_craft_type',
            header: '危险工艺类型',
            render: (val) => (val as Record<string, unknown>)?.title as string ?? '—',
        },
        { key: 'position', header: '所在位置' },
        { key: 'temperature', header: '温度', width: 80 },
        { key: 'pressure', header: '压力', width: 80 },
        {
            key: 'is_sis',
            header: 'SIS系统',
            width: 80,
            render: (val) => (val ? '是' : '否'),
        },
    ],
    formFields: [
        { key: 'name', label: '工艺名称', type: 'text', required: true, colSpan: 2 },
        { key: 'dangerous_craft_type_id', label: '危险工艺类型', type: 'select', optionsEndpoint: '/dangerous-craft-types', colSpan: 1 },
        { key: 'position', label: '所在位置', type: 'text', colSpan: 1 },
        { key: 'hazardous_chemical_id', label: '涉及危险化学品', type: 'select', optionsEndpoint: '/hazardous-chemicals', optionsLabelKey: 'name', colSpan: 1 },
        { key: 'dangerous_equipment_id', label: '危险设备', type: 'select', optionsEndpoint: '/dangerous-equipment', optionsLabelKey: 'equipment_name', colSpan: 1 },
        { key: 'operating_people_num', label: '操作人数', type: 'number', colSpan: 1 },
        { key: 'temperature', label: '温度', type: 'text', placeholder: '如：120°C', colSpan: 1 },
        { key: 'pressure', label: '压力', type: 'text', placeholder: '如：0.5', colSpan: 1 },
        { key: 'pressure_unit', label: '压力单位', type: 'text', placeholder: '如：MPa', colSpan: 1 },
        { key: 'is_sis', label: 'SIS安全仪表系统', type: 'switch', colSpan: 1 },
        { key: 'sil_level', label: 'SIL等级', type: 'text', colSpan: 1 },
        { key: 'detect_parameter', label: '检测参数', type: 'text', colSpan: 1 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索重点监管危险工艺...',
};

export default function KeyHazardousProcessIndex() {
    return <CrudPage config={config} />;
}
