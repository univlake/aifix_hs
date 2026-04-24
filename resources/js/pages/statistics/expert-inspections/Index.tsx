import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '专家检查',
    endpoint: '/expert-inspections',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'inspect_date', header: '检查日期' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'inspect_date', label: '检查日期', type: 'date' },
        {
            key: 'company_id',
            label: '企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索专家检查...',
    permissions: {
        list: 'expert-inspections.list',
        create: 'expert-inspections.create',
        update: 'expert-inspections.update',
        delete: 'expert-inspections.delete',
    },
};

export default function ExpertInspectionsIndex() {
    return <CrudPage config={config} />;
}
