import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '人员管理',
    endpoint: '/personnels',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '姓名' },
        { key: 'phone', header: '电话' },
        { key: 'position', header: '职位' },
    ],
    formFields: [
        { key: 'name', label: '姓名', type: 'text', required: true },
        { key: 'phone', label: '电话', type: 'text' },
        { key: 'position', label: '职位', type: 'text' },
        { key: 'company_id', label: '所属单位', type: 'select', optionsEndpoint: '/companies' },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索人员姓名...',
};

export default function PersonnelsIndex() {
    return <CrudPage config={config} />;
}
