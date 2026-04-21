import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '会议管理',
    endpoint: '/meetings',
    labelKey: 'name',
    enableDetail: true,
    detailTitle: '会议详情',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '会议名称' },
        { key: 'theme', header: '主题', width: 160 },
        {
            key: 'meeting_date',
            header: '会议时间',
            width: 160,
            render: (v) => (v ? String(v).slice(0, 16) : '—'),
        },
        {
            key: 'sign_end_date',
            header: '报名截止',
            width: 160,
            render: (v) => (v ? String(v).slice(0, 16) : '—'),
        },
        { key: 'place', header: '地点', width: 160 },
    ],
    formFields: [
        { key: 'name', label: '会议名称', type: 'text', required: true, colSpan: 2 },
        { key: 'theme', label: '会议主题', type: 'text', colSpan: 2 },
        { key: 'place', label: '会议地点', type: 'text' },
        { key: 'alert_others', label: '通知人', type: 'text' },
        { key: 'meeting_date', label: '会议时间', type: 'date' },
        { key: 'sign_up_date', label: '报名开始时间', type: 'date' },
        { key: 'sign_end_date', label: '报名截止时间', type: 'date' },
        { key: 'summary', label: '会议内容', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '通知附件', type: 'file' },
        { key: 'summary_annex_url', label: '会议纪要', type: 'file' },
        { key: 'sign_annex_url', label: '签到附件', type: 'file' },
        { key: 'material_annex_url', label: '会议资料', type: 'file' },
        { key: 'photo_annex_url', label: '会议照片', type: 'file' },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索会议名称...',
};

export default function MeetingsIndex() {
    return <CrudPage config={config} />;
}
