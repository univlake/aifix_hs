import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';

const config: CrudPageConfig = {
    title: '上传资料',
    endpoint: '/training-files',
    labelKey: 'title',
    columns: [
        {
            key: 'title',
            header: '资料名称',
            width: 400,
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
            key: 'times_download',
            header: '下载次数',
            width: 90,
            render: (val) => (
                <span className="text-slate-400">
                    {(val as number | null) ?? 0}
                </span>
            ),
        },
        {
            key: 'file_url',
            header: '文件',
            width: 80,
            render: (val) =>
                val ? (
                    <OssDownloadLink url={String(val)} label="查看" />
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'title',
            label: '资料名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        { key: 'file_url', label: '上传文件', type: 'file', colSpan: 2 },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索资料名称...',
    permissions: {
        list: 'training-files.list',
        create: 'training-files.create',
        update: 'training-files.update',
        delete: 'training-files.delete',
    },
};

export default function UploadMaterialsIndex() {
    return <CrudPage config={config} />;
}
