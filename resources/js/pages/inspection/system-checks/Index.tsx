import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '体系检查',
    endpoint: '/system-checks',
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
    searchPlaceholder: '搜索体系检查...',
    permissions: {
        list: 'system-checks.list',
        create: 'system-checks.create',
        update: 'system-checks.update',
        delete: 'system-checks.delete',
    },
};

export default function SystemChecksIndex() {
    return <CrudPage config={config} />;
}
