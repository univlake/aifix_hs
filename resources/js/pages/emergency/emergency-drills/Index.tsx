import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '应急演练',
    endpoint: '/emergency-drills',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'title', header: '标题' },
        { key: 'drill_date', header: '演练日期' },
    ],
    formFields: [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'drill_date', label: '演练日期', type: 'date' },
        {
            key: 'company_id',
            label: '所属企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索应急演练...',
    permissions: {
        list: 'emergency-drills.list',
        create: 'emergency-drills.create',
        update: 'emergency-drills.update',
        delete: 'emergency-drills.delete',
    },
};

export default function EmergencyDrillsIndex() {
    return <CrudPage config={config} />;
}
