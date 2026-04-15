import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '作业管理',
    endpoint: '/job-management',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'remark', header: '备注' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'remark', label: '备注', type: 'textarea' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索作业标题...',
};

export default function JobManagementIndex() {
    return <CrudPage config={config} />;
}
