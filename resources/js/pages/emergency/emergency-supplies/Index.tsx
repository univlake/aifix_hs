import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '应急物资',
    endpoint: '/emergency-supplies',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'title', header: '名称' },
        { key: 'quantity', header: '数量' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        { key: 'quantity', label: '数量', type: 'number' },
        {
            key: 'company_id',
            label: '所属企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索应急物资...',
    permissions: {
        list: 'emergency-supplies.list',
        create: 'emergency-supplies.create',
        update: 'emergency-supplies.update',
        delete: 'emergency-supplies.delete',
    },
};

export default function EmergencySuppliesIndex() {
    return <CrudPage config={config} />;
}
