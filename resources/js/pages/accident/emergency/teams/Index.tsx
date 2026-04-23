import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '应急队伍',
    endpoint: '/emergency-teams',
    labelKey: 'name',
    columns: [
        { key: 'name', header: '队伍名称' },
        { key: 'team_number', header: '队伍编号', width: 130 },
        { key: 'save_user', header: '负责人', width: 120 },
        { key: 'tel', header: '联系电话', width: 140 },
    ],
    formFields: [
        { key: 'name', label: '队伍名称', type: 'text', required: true },
        { key: 'team_number', label: '队伍编号', type: 'text' },
        { key: 'save_user', label: '负责人', type: 'text' },
        { key: 'tel', label: '联系电话', type: 'text' },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索队伍名称...',
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
