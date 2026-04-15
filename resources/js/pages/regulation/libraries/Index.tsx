import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '法规库',
    endpoint: '/regulation-libraries',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
        { key: 'type_id', label: '类型', type: 'select', optionsEndpoint: '/regulation-library-types' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索法规库...',
};

export default function LibrariesIndex() {
    return <CrudPage config={config} />;
}
