import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '外部培训',
    endpoint: '/external-trainings',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'train_date', header: '培训日期' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'train_date', label: '培训日期', type: 'date' },
        { key: 'company_id', label: '企业', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索外部培训...',
};

export default function ExternalTrainingsIndex() {
    return <CrudPage config={config} />;
}
