import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '会议签到',
    endpoint: '/meeting-sign-ups',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'meeting_id', header: '会议ID' },
        { key: 'user_id', header: '用户ID' },
    ],
    formFields: [
        { key: 'meeting_id', label: '会议ID', type: 'number', required: true },
        { key: 'user_id', label: '用户ID', type: 'number', required: true },
        {
            key: 'company_id',
            label: '企业',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'meeting_id',
    searchPlaceholder: '搜索会议签到...',
    permissions: {
        list: 'meeting-sign-ups.list',
        create: 'meeting-sign-ups.create',
        update: 'meeting-sign-ups.update',
        delete: 'meeting-sign-ups.delete',
    },
};

export default function MeetingSignUpsIndex() {
    return <CrudPage config={config} />;
}
