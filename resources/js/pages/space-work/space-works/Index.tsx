import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '有限空间作业',
    endpoint: '/space-works',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'location', header: '地点' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'location', label: '地点', type: 'text' },
        { key: 'company_id', label: '企业', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索有限空间作业...',
};

export default function SpaceWorksIndex() {
    return <CrudPage config={config} />;
}
