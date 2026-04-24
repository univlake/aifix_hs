import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '消防设施管理',
    endpoint: '/fire-facilities',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '名称' },
        { key: 'location', header: '位置' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        { key: 'location', label: '位置', type: 'text' },
        {
            key: 'company_id',
            label: '所属单位',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索设施名称...',
    permissions: {
        list: 'fire-facilities.list',
        create: 'fire-facilities.create',
        update: 'fire-facilities.update',
        delete: 'fire-facilities.delete',
    },
};

export default function FireFacilitiesIndex() {
    return <CrudPage config={config} />;
}
