import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';

const config: CrudPageConfig = {
    title: '检查表库',
    endpoint: '/checklist-libraries',
    labelKey: 'title',
    exportEndpoint: '/checklist-libraries/export',
    columns: [
        {
            key: 'title',
            header: '检查表名称',
            width: 420,
            render: (val) => {
                const s = val ? String(val) : '';

                return s ? (
                    <span title={s}>
                        {s.length > 45 ? s.slice(0, 45) + '…' : s}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        {
            key: 'status',
            header: '状态',
            width: 80,
            render: (val) => {
                const active = val === 1 || val === '1';

                return (
                    <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${
                            active
                                ? 'border-emerald-500/20 bg-emerald-600/8 text-emerald-400'
                                : 'border-slate-700/50 bg-slate-700/20 text-slate-500'
                        }`}
                    >
                        {active ? '启用' : '停用'}
                    </span>
                );
            },
        },
        {
            key: 'preview_annex_url',
            header: '预览',
            width: 70,
            render: (val) =>
                val ? (
                    <OssDownloadLink
                        url={String(val)}
                        label="预览"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700/50 bg-slate-700/20 px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50"
                    />
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            key: 'annex_url',
            header: '下载',
            width: 80,
            render: (val) =>
                val ? (
                    <OssDownloadLink url={String(val)} label="下载" />
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'title',
            label: '检查表名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        {
            key: 'status',
            label: '状态',
            type: 'select',
            options: [
                { value: '1', label: '启用' },
                { value: '0', label: '停用' },
            ],
            placeholder: '请选择状态',
        },
        {
            key: 'preview_annex_url',
            label: '预览文件',
            type: 'file',
            hint: '请上传 PDF 文件，用于在检查表列表中预览。',
        },
        { key: 'annex_url', label: '检查表文件', type: 'file', colSpan: 2 },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索检查表名称...',
    permissions: {
        list: 'checklist-libraries.list',
        create: 'checklist-libraries.create',
        update: 'checklist-libraries.update',
        delete: 'checklist-libraries.delete',
    },
};

export default function ManagementChecklistsIndex() {
    return <CrudPage config={config} />;
}
