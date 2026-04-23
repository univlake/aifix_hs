import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '消控人员管理',
    endpoint: '/elimination-control-staff',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '姓名' },
        { key: 'position', header: '职位' },
    ],
    formFields: [
        { key: 'name', label: '姓名', type: 'text', required: true },
        { key: 'position', label: '职位', type: 'text' },
        {
            key: 'company_id',
            label: '所属单位',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索姓名...',
    permissions: {
        list: 'elimination-control-staff.list',
        create: 'elimination-control-staff.create',
        update: 'elimination-control-staff.update',
        delete: 'elimination-control-staff.delete',
    },
};

export default function EliminationControlStaffIndex() {
    return <CrudPage config={config} />;
}
