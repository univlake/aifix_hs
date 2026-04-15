import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '会议管理',
    endpoint: '/meetings',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'meet_date', header: '会议日期' },
        { key: 'location', header: '地点' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'meet_date', label: '会议日期', type: 'date' },
        { key: 'location', label: '地点', type: 'text' },
        { key: 'company_id', label: '企业', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索会议...',
};

export default function MeetingsIndex() {
    return <CrudPage config={config} />;
}
