import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '危险源管理',
    endpoint: '/hazards',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索危险源...',
};

export default function HazardsIndex() {
    return <CrudPage config={config} />;
}
