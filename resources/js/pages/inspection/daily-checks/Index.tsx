import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '日常检查',
    endpoint: '/daily-checks',
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
    searchPlaceholder: '搜索日常检查...',
    permissions: {
        list: 'daily-checks.list',
        create: 'daily-checks.create',
        update: 'daily-checks.update',
        delete: 'daily-checks.delete',
    },
};

export default function DailyChecksIndex() {
    return <CrudPage config={config} />;
}
