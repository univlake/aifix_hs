import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '设计单位管理',
    endpoint: '/design-units',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '单位名称' },
        { key: 'contact', header: '联系人' },
        { key: 'phone', header: '电话' },
    ],
    formFields: [
        { key: 'title', label: '单位名称', type: 'text', required: true },
        { key: 'contact', label: '联系人', type: 'text' },
        { key: 'phone', label: '电话', type: 'text' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索单位名称...',
    permissions: {
        list: 'design-units.list',
        create: 'design-units.create',
        update: 'design-units.update',
        delete: 'design-units.delete',
    },
};

export default function DesignUnitsIndex() {
    return <CrudPage config={config} />;
}
