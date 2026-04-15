import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '报表配置',
    endpoint: '/report-configs',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索报表配置...',
};

export default function ReportConfigsIndex() {
    return <CrudPage config={config} />;
}
