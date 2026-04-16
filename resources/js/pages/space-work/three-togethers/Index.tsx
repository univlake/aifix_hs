import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '三同时管理',
    endpoint: '/three-togethers',
    labelKey: 'name',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '项目名称' },
        { key: 'three_together_type', header: '项目类型', width: 100 },
        { key: 'establish_time', header: '立项时间', width: 110 },
        { key: 'establish_section', header: '立项单位' },
        { key: 'status', header: '状态', width: 110 },
    ],
    formFields: [
        { key: 'name', label: '项目名称', type: 'text', required: true, colSpan: 2 },
        {
            key: 'three_together_type',
            label: '项目类型',
            type: 'select',
            options: [
                { value: '新建项目', label: '新建项目' },
                { value: '改建项目', label: '改建项目' },
                { value: '扩建项目', label: '扩建项目' },
            ],
            colSpan: 1,
        },
        {
            key: 'status',
            label: '当前状态',
            type: 'select',
            options: [
                { value: '初步设计阶段', label: '初步设计阶段' },
                { value: '施工阶段', label: '施工阶段' },
                { value: '竣工验收阶段', label: '竣工验收阶段' },
                { value: '完成', label: '完成' },
            ],
            colSpan: 1,
        },
        { key: 'establish_time', label: '立项时间', type: 'date', colSpan: 1 },
        { key: 'establish_section', label: '立项单位', type: 'text', colSpan: 1 },
        { key: 'design_unit_id', label: '设计单位', type: 'select', optionsEndpoint: '/design-units', optionsLabelKey: 'name', colSpan: 1 },
        { key: 'evaluation_unit_id', label: '评价机构', type: 'select', optionsEndpoint: '/evaluation-units', optionsLabelKey: 'name', colSpan: 1 },
        { key: 'write_time', label: '编写时间', type: 'date', colSpan: 1 },
        { key: 'design_annex_url', label: '设计文件附件', type: 'file', colSpan: 1 },
        { key: 'safety_requirements', label: '安全要求', type: 'textarea', colSpan: 2 },
        { key: 'construction_comment', label: '施工说明', type: 'textarea', colSpan: 2 },
        { key: 'complete_comment', label: '竣工说明', type: 'textarea', colSpan: 2 },
        { key: 'acceptance', label: '验收意见', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索三同时项目...',
};

export default function ThreeTogethersIndex() {
    return <CrudPage config={config} />;
}
