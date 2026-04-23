import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';

const config: CrudPageConfig = {
    title: '上传视频',
    endpoint: '/training-videos',
    labelKey: 'title',
    columns: [
        {
            key: 'title',
            header: '视频名称',
            width: 320,
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
            key: 'lector',
            header: '讲师',
            width: 120,
            render: (val) =>
                val ? String(val) : <span className="text-slate-700">—</span>,
        },
        {
            key: 'duration',
            header: '时长',
            width: 100,
            render: (val) =>
                val ? String(val) : <span className="text-slate-700">—</span>,
        },
        {
            key: 'times_watched',
            header: '观看次数',
            width: 90,
            render: (val) => (
                <span className="text-slate-400">{(val as number) ?? 0}</span>
            ),
        },
        {
            key: 'video_url',
            header: '视频',
            width: 80,
            render: (val) =>
                val ? (
                    <OssDownloadLink url={String(val)} label="播放" />
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'title',
            label: '视频名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        { key: 'lector', label: '讲师', type: 'text' },
        {
            key: 'duration',
            label: '时长',
            type: 'text',
            placeholder: '例如 45:12',
        },
        { key: 'introduce', label: '简介', type: 'textarea', colSpan: 2 },
        { key: 'thumb_url', label: '封面图', type: 'file', colSpan: 2 },
        { key: 'video_url', label: '视频文件', type: 'video', colSpan: 2 },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索视频名称...',
    permissions: {
        list: 'training-videos.list',
        create: 'training-videos.create',
        update: 'training-videos.update',
        delete: 'training-videos.delete',
    },
};

export default function UploadVideosIndex() {
    return <CrudPage config={config} />;
}
