import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const DRILL_TYPES = [
    { value: '综合演练', label: '综合演练' },
    { value: '专项演练', label: '专项演练' },
    { value: '桌面推演', label: '桌面推演' },
];

const DRILL_FORMS = [
    { value: '实战演练', label: '实战演练' },
    { value: '桌面演练', label: '桌面演练' },
];

const config: CrudPageConfig = {
    title: '应急演练',
    endpoint: '/emergency-drills',
    labelKey: 'name',
    columns: [
        { key: 'name', header: '演练名称' },
        {
            key: 'drill_time',
            header: '演练时间',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        { key: 'drill_local', header: '演练地点', width: 130 },
        { key: 'organization_department', header: '组织部门', width: 130 },
        { key: 'drill_type', header: '演练类型', width: 100 },
        { key: 'drill_number', header: '参演人数', width: 90 },
    ],
    formFields: [
        {
            key: 'name',
            label: '演练名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        { key: 'drill_time', label: '演练时间', type: 'date' },
        { key: 'drill_local', label: '演练地点', type: 'text' },
        { key: 'organization_department', label: '组织部门', type: 'text' },
        { key: 'join_department', label: '参与部门', type: 'text' },
        { key: 'drill_number', label: '参演人数', type: 'text' },
        {
            key: 'drill_type',
            label: '演练类型',
            type: 'select',
            options: DRILL_TYPES,
            placeholder: '请选择演练类型',
        },
        {
            key: 'drill_form',
            label: '演练形式',
            type: 'select',
            options: DRILL_FORMS,
            placeholder: '请选择演练形式',
        },
        { key: 'drill_kind', label: '演练种类', type: 'text' },
        { key: 'event', label: '演练情景', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索演练名称...',
    permissions: {
        list: 'emergency-drills.list',
        create: 'emergency-drills.create',
        update: 'emergency-drills.update',
        delete: 'emergency-drills.delete',
    },
};

export default function EmergencyDrillIndex() {
    return <CrudPage config={config} />;
}
