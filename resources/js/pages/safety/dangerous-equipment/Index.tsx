import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '危险设备管理',
    endpoint: '/dangerous-equipment',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '名称' },
        { key: 'location', header: '位置' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        { key: 'location', label: '位置', type: 'text' },
        { key: 'company_id', label: '所属单位', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索设备名称...',
};

export default function DangerousEquipmentIndex() {
    return <CrudPage config={config} />;
}
