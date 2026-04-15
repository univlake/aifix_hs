import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '隐患排查',
    endpoint: '/hidden-danger-infos',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'area', header: '区域' },
        { key: 'content', header: '内容' },
    ],
    formFields: [
        { key: 'area', label: '区域', type: 'text', required: true },
        { key: 'content', label: '内容', type: 'textarea' },
        { key: 'company_id', label: '所属企业', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'area',
    searchPlaceholder: '搜索隐患...',
};

export default function HiddenDangerIndex() {
    return <CrudPage config={config} />;
}
