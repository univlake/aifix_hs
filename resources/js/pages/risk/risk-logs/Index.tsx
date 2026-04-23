import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '风险台账',
    endpoint: '/risk-logs',
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
    searchPlaceholder: '搜索风险台账...',
    permissions: {
        list: 'risk-logs.list',
        create: 'risk-logs.create',
        update: 'risk-logs.update',
        delete: 'risk-logs.delete',
    },
};

export default function RiskLogsIndex() {
    return <CrudPage config={config} />;
}
