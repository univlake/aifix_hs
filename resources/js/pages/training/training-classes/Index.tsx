import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '培训课堂',
    endpoint: '/training-classes',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
        {
            key: 'company_id',
            label: '企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索培训课堂...',
};

export default function TrainingClassesIndex() {
    return <CrudPage config={config} />;
}
