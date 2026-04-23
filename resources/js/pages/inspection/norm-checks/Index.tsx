import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '规范检查',
    endpoint: '/norm-checks',
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
    searchPlaceholder: '搜索规范检查...',
    permissions: {
        list: 'norm-checks.list',
        create: 'norm-checks.create',
        update: 'norm-checks.update',
        delete: 'norm-checks.delete',
    },
};

export default function NormChecksIndex() {
    return <CrudPage config={config} />;
}
