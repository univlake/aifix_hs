import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '应急队伍',
    endpoint: '/emergency-teams',
    columns: [
        { key: 'id', header: 'ID', width: 80 },
        { key: 'title', header: '队伍名称' },
        { key: 'leader', header: '负责人' },
    ],
    formFields: [
        { key: 'title', label: '队伍名称', type: 'text', required: true },
        { key: 'leader', label: '负责人', type: 'text' },
        {
            key: 'company_id',
            label: '所属企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索应急队伍...',
    permissions: {
        list: 'emergency-teams.list',
        create: 'emergency-teams.create',
        update: 'emergency-teams.update',
        delete: 'emergency-teams.delete',
    },
};

export default function EmergencyTeamsIndex() {
    return <CrudPage config={config} />;
}
