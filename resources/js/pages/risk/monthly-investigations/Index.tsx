import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '月度排查',
    endpoint: '/monthly-investigations',
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
    searchPlaceholder: '搜索月度排查...',
    permissions: {
        list: 'monthly-investigations.list',
        create: 'monthly-investigations.create',
        update: 'monthly-investigations.update',
        delete: 'monthly-investigations.delete',
    },
};

export default function MonthlyInvestigationsIndex() {
    return <CrudPage config={config} />;
}
