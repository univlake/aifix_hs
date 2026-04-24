import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '事故检查',
    endpoint: '/accident-checks',
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
    searchPlaceholder: '搜索事故检查...',
    permissions: {
        list: 'accident-checks.list',
        create: 'accident-checks.create',
        update: 'accident-checks.update',
        delete: 'accident-checks.delete',
    },
};

export default function AccidentChecksIndex() {
    return <CrudPage config={config} />;
}
