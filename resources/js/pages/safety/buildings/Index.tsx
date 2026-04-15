import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '建筑管理',
    endpoint: '/buildings',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '名称' },
        { key: 'structure', header: '结构' },
        { key: 'area', header: '面积' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        { key: 'structure', label: '结构', type: 'text' },
        { key: 'area', label: '面积', type: 'number' },
        { key: 'company_id', label: '所属单位', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索建筑名称...',
};

export default function BuildingsIndex() {
    return <CrudPage config={config} />;
}
