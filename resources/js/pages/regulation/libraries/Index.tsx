import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const STATUS_OPTIONS = [
    { value: '有效', label: '有效' },
    { value: '已废止', label: '已废止' },
    { value: '待更新', label: '待更新' },
];

const config: CrudPageConfig = {
    title: '法律法规库',
    endpoint: '/regulation-libraries',
    labelKey: 'title',
    companyScoped: false,
    columns: [
        {
            key: 'title',
            header: '法规标题',
            width: 380,
            render: (val) => {
                const s = val ? String(val) : '';

                return s ? (
                    <span title={s}>
                        {s.length > 40 ? s.slice(0, 40) + '…' : s}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        {
            key: 'regulation_library_type_id',
            header: '法规类型',
            width: 150,
            render: (_, row) => {
                const t = row.regulation_type as { title?: string } | null;

                return t?.title ? (
                    <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-xs text-blue-400">
                        {t.title}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        { key: 'promulgating_department', header: '颁布部门', width: 140 },
        {
            key: 'established_date',
            header: '制订日期',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            key: 'effective_date',
            header: '生效日期',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            key: 'status',
            header: '状态',
            width: 90,
            render: (val) => {
                if (!val) {
                    return <span className="text-slate-700">—</span>;
                }

                const s = String(val);
                const isValid = s === '有效';

                return (
                    <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${
                            isValid
                                ? 'border-emerald-500/20 bg-emerald-600/8 text-emerald-400'
                                : 'border-slate-700/50 bg-slate-700/20 text-slate-500'
                        }`}
                    >
                        {s}
                    </span>
                );
            },
        },
        {
            key: 'annex_url',
            header: '附件',
            width: 70,
            render: (val) =>
                val ? (
                    <AttachmentViewer url={String(val)} />
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'title',
            label: '法规标题',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        {
            key: 'regulation_library_type_id',
            label: '法规类型',
            type: 'select',
            optionsEndpoint: '/regulation-library-types',
            optionsLabelKey: 'title',
            optionsValueKey: 'id',
            placeholder: '请选择法规类型',
        },
        { key: 'promulgating_department', label: '颁布部门', type: 'text' },
        { key: 'standard_encoding', label: '标准编号', type: 'text' },
        { key: 'established_date', label: '制（修）订日期', type: 'date' },
        { key: 'effective_date', label: '生效日期', type: 'date' },
        { key: 'identify_date', label: '识别（更新）时间', type: 'date' },
        {
            key: 'status',
            label: '状态',
            type: 'select',
            options: STATUS_OPTIONS,
            placeholder: '请选择状态',
        },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 2 },
    ],
    filterFields: [
        {
            key: 'type_parent_id',
            placeholder: '全部分类',
            optionsEndpoint: '/regulation-library-types',
            optionsLabelKey: 'title',
            optionsValueKey: 'id',
            optionsParams: { pid: 0 },
        },
        {
            key: 'regulation_library_type_id',
            placeholder: '全部子类',
            optionsEndpoint: '/regulation-library-types',
            optionsLabelKey: 'title',
            optionsValueKey: 'id',
            dependsOnKey: 'type_parent_id',
            dependsOnParam: 'pid',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索法律法规标题...',
    permissions: {
        list: 'regulation-libraries.list',
        create: 'regulation-libraries.create',
        update: 'regulation-libraries.update',
        delete: 'regulation-libraries.delete',
    },
};

export default function LibrariesIndex() {
    return <CrudPage config={config} />;
}
