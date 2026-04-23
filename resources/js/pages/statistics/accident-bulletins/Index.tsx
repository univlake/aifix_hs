import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '事故通报',
    endpoint: '/accident-bulletins',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'accident_date', header: '事故日期' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'accident_date', label: '事故日期', type: 'date' },
        { key: 'content', label: '内容', type: 'textarea' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索事故通报...',
    permissions: {
        list: 'accident-bulletins.list',
        create: 'accident-bulletins.create',
        update: 'accident-bulletins.update',
        delete: 'accident-bulletins.delete',
    },
};

export default function AccidentBulletinsIndex() {
    return <CrudPage config={config} />;
}
