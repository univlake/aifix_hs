import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '整改通知单',
    endpoint: '/rectification-sheets',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
        {
            key: 'company_id',
            label: '所属企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索整改通知单...',
    permissions: {
        list: 'rectification-sheets.list',
        create: 'rectification-sheets.create',
        update: 'rectification-sheets.update',
        delete: 'rectification-sheets.delete',
    },
};

export default function RectificationSheetsIndex() {
    return <CrudPage config={config} />;
}
