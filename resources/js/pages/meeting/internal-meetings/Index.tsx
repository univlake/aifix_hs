import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const MEETING_TYPES = [
    { value: 'fire', label: '消防会议' },
    { value: 'safety', label: '安全会议' },
];

const config: CrudPageConfig = {
    title: '内部会议',
    endpoint: '/internal-meetings',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '会议名称' },
        { key: 'theme', header: '会议主题' },
        { key: 'type', header: '会议类型', width: 110 },
        {
            key: 'meeting_date',
            header: '会议日期',
            width: 110,
            render: (val) => (val ? String(val).slice(0, 10) : <span className="text-slate-700">—</span>),
        },
        {
            key: 'annex_url',
            header: '附件',
            width: 70,
            render: (val) =>
                val ? (
                    <a
                        href={String(val)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-600/10 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                        查看
                    </a>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        { key: 'name', label: '会议名称', type: 'text', required: true, colSpan: 1 },
        { key: 'theme', label: '会议主题', type: 'text', colSpan: 1 },
        {
            key: 'type',
            label: '会议类型',
            type: 'select',
            options: MEETING_TYPES,
            colSpan: 1,
        },
        { key: 'meeting_date', label: '会议日期', type: 'date', colSpan: 1 },
        { key: 'summary', label: '会议纪要', type: 'textarea', colSpan: 2 },
        { key: 'notice_annex_url', label: '会议通知', type: 'file', colSpan: 1 },
        { key: 'annex_url', label: '会议附件', type: 'file', colSpan: 1 },
        { key: 'summary_annex_url', label: '纪要附件', type: 'file', colSpan: 1 },
        { key: 'sign_annex_url', label: '签到表', type: 'file', colSpan: 1 },
        { key: 'material_annex_url', label: '会议材料', type: 'file', colSpan: 1 },
        { key: 'photo_annex_url', label: '会议照片', type: 'file', colSpan: 1 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索内部会议...',
};

export default function InternalMeetingsIndex() {
    return <CrudPage config={config} />;
}
