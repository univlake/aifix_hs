import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '作业管理',
    endpoint: '/job-management',
    labelKey: 'content',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'department', header: '所属部门' },
        { key: 'type', header: '作业类型', width: 100 },
        { key: 'position', header: '作业位置' },
        { key: 'job_time', header: '作业时间', width: 110 },
        { key: 'job_people_number', header: '作业人数', width: 80 },
        {
            key: 'is_outsourcing',
            header: '外包',
            width: 70,
            render: (val) => (val ? '是' : '否'),
        },
    ],
    formFields: [
        { key: 'department', label: '所属部门', type: 'text', colSpan: 1 },
        { key: 'type', label: '作业类型', type: 'text', placeholder: '如：动火作业、高处作业', colSpan: 1 },
        { key: 'special_type', label: '特殊作业类型', type: 'text', colSpan: 1 },
        { key: 'position', label: '作业位置', type: 'text', colSpan: 1 },
        { key: 'job_time', label: '作业时间', type: 'date', colSpan: 1 },
        { key: 'unit', label: '作业单位', type: 'text', colSpan: 1 },
        { key: 'is_outsourcing', label: '外包作业', type: 'switch', colSpan: 1 },
        { key: 'evaluation_unit_id', label: '评价机构', type: 'select', optionsEndpoint: '/evaluation-units', optionsLabelKey: 'name', colSpan: 1 },
        { key: 'job_people_number', label: '作业人数', type: 'number', colSpan: 1 },
        { key: 'job_people_name', label: '作业负责人', type: 'text', colSpan: 1 },
        { key: 'content', label: '作业内容', type: 'textarea', colSpan: 2 },
        { key: 'risk_analysis', label: '风险分析', type: 'textarea', colSpan: 2 },
        { key: 'risk_protection', label: '风险防护措施', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'department',
    searchPlaceholder: '搜索作业记录...',
};

export default function SpaceWorksIndex() {
    return <CrudPage config={config} />;
}
