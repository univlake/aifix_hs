import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '职业健康档案',
    endpoint: '/health-files',
    enableDetail: true,
    columns: [
        { key: 'name', header: '姓名' },
        { key: 'number', header: '工号', width: 100 },
        { key: 'department', header: '部门', width: 130 },
        { key: 'post', header: '岗位', width: 120 },
        { key: 'checkup_date', header: '体检日期', width: 110 },
        { key: 'checkup_expiry', header: '体检结论', width: 130 },
        { key: 'process_result', header: '处理结果', width: 120 },
    ],
    formFields: [
        { key: 'name', label: '姓名', type: 'text', required: true },
        { key: 'number', label: '工号', type: 'text' },
        { key: 'department', label: '部门', type: 'text' },
        { key: 'post', label: '岗位', type: 'text' },
        { key: 'checkup_date', label: '体检日期', type: 'date' },
        { key: 'checkup_expiry', label: '体检结论', type: 'text' },
        {
            key: 'review_situation',
            label: '复查情况',
            type: 'text',
            colSpan: 2,
        },
        {
            key: 'handling_opinions',
            label: '处理意见',
            type: 'text',
            colSpan: 2,
        },
        { key: 'process_result', label: '处理结果', type: 'text', colSpan: 2 },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索员工姓名...',
    importEndpoint: '/health-files-import',
    exportEndpoint: '/health-files-export',
    templateEndpoint: '/health-files-template',
    permissions: {
        list: 'health-files.list',
        create: 'health-files.create',
        update: 'health-files.update',
        delete: 'health-files.delete',
    },
};

export default function HealthFilesIndex() {
    return <CrudPage config={config} />;
}
