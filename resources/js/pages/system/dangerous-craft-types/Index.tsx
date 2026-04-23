import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '危险工艺类型',
    endpoint: '/dangerous-craft-types',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '标题' },
        { key: 'sort', header: '排序', width: 80 },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'sort', label: '排序', type: 'number' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索危险工艺类型...',
    permissions: {
        list: 'base-data.view',
        create: 'base-data.manage',
        update: 'base-data.manage',
        delete: 'base-data.manage',
    },
};

export default function DangerousCraftTypesIndex() {
    return <CrudPage config={config} />;
}
