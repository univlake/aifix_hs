import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '健康体系管理',
    endpoint: '/health-systems',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索标题...',
    permissions: {
        list: 'health-systems.list',
        create: 'health-systems.create',
        update: 'health-systems.update',
    },
};

export default function HealthSystemsIndex() {
    return <CrudPage config={config} />;
}
