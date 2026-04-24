import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '消防安全',
    endpoint: '/fire-safeties',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'title', header: '标题' },
        { key: 'location', header: '位置' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'location', label: '位置', type: 'text' },
        {
            key: 'company_id',
            label: '所属企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索消防安全...',
    permissions: {
        list: 'fire-safeties.list',
        create: 'fire-safeties.create',
        update: 'fire-safeties.update',
        delete: 'fire-safeties.delete',
    },
};

export default function FireSafetyIndex() {
    return <CrudPage config={config} />;
}
