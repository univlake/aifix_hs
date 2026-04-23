import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '消防器材管理',
    endpoint: '/fire-equipment',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '名称' },
        { key: 'specification', header: '规格型号' },
        { key: 'quantity', header: '数量' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        { key: 'specification', label: '规格型号', type: 'text' },
        { key: 'quantity', label: '数量', type: 'number' },
        {
            key: 'company_id',
            label: '所属单位',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索器材名称...',
    permissions: {
        list: 'fire-equipment.list',
        create: 'fire-equipment.create',
        update: 'fire-equipment.update',
        delete: 'fire-equipment.delete',
    },
};

export default function FireEquipmentIndex() {
    return <CrudPage config={config} />;
}
