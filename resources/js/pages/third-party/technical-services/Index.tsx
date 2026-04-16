import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const SERVICE_TYPES = [
    { value: '安全检测', label: '安全检测' },
    { value: '安全评价', label: '安全评价' },
    { value: '安全咨询', label: '安全咨询' },
    { value: '安全培训', label: '安全培训' },
    { value: '职业卫生检测', label: '职业卫生检测' },
    { value: '其他', label: '其他' },
];

const config: CrudPageConfig = {
    title: '技术服务单位',
    endpoint: '/technical-service-units',
    labelKey: 'name',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '单位名称' },
        {
            key: 'service_type',
            header: '服务类型',
            width: 120,
            render: (val) =>
                val ? (
                    <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-xs text-blue-400">
                        {val as string}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        { key: 'qualification_name', header: '资质名称' },
        { key: 'contact', header: '联系人', width: 110 },
        { key: 'contact_tel', header: '联系电话', width: 140 },
        {
            key: 'annex_url',
            header: '资质附件',
            width: 80,
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
        { key: 'name', label: '单位名称', type: 'text', required: true, colSpan: 2 },
        {
            key: 'service_type',
            label: '服务类型',
            type: 'select',
            options: SERVICE_TYPES,
            colSpan: 1,
        },
        { key: 'qualification_name', label: '资质名称', type: 'text', colSpan: 1 },
        { key: 'contact', label: '联系人', type: 'text', colSpan: 1 },
        { key: 'contact_tel', label: '联系电话', type: 'text', colSpan: 1 },
        { key: 'annex_url', label: '资质证书附件', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索技术服务单位...',
};

export default function TechnicalServicesIndex() {
    return <CrudPage config={config} />;
}
