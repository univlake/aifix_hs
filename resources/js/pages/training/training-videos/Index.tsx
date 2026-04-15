import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '培训视频',
    endpoint: '/training-videos',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'url', label: '链接', type: 'text' },
        { key: 'company_id', label: '企业', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索培训视频...',
};

export default function TrainingVideosIndex() {
    return <CrudPage config={config} />;
}
