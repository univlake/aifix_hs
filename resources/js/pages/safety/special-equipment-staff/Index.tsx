import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '特种设备人员管理',
    endpoint: '/special-equipment-staff',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '姓名' },
        { key: 'certificate_no', header: '证书编号' },
    ],
    formFields: [
        { key: 'name', label: '姓名', type: 'text', required: true },
        { key: 'certificate_no', label: '证书编号', type: 'text' },
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
        list: 'special-equipment-staff.list',
        create: 'special-equipment-staff.create',
        update: 'special-equipment-staff.update',
        delete: 'special-equipment-staff.delete',
    },
};

export default function SpecialEquipmentStaffIndex() {
    return <CrudPage config={config} />;
}
