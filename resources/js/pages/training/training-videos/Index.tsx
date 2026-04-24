import { Loader2, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

function PlayButton({ id }: { id: number }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        try {
            const res = await api.get<ApiResponse<string>>(
                `/training-videos/${id}`,
            );
            const url = res.data.data;

            if (url) {
                window.open(url, '_blank');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-600/10 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:pointer-events-none disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Play className="h-3 w-3" />
            )}
            播放
        </button>
    );
}

export default function TrainingVideosIndex() {
    const { rootCompany } = useScope();
    const parentCompanyId = rootCompany?.pid;

    const config: CrudPageConfig = useMemo(
        () => ({
            title: '培训视频',
            endpoint: '/training-videos',
            labelKey: 'title',
            forceReadOnly: true,
            extraParams: parentCompanyId
                ? { parent_company_id: parentCompanyId }
                : {},
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
                        val ? (
                            String(val)
                        ) : (
                            <span className="text-slate-700">—</span>
                        ),
                },
                {
                    key: 'duration',
                    header: '时长',
                    width: 100,
                    render: (val) =>
                        val ? (
                            String(val)
                        ) : (
                            <span className="text-slate-700">—</span>
                        ),
                },
                {
                    key: 'times_watched',
                    header: '观看次数',
                    width: 90,
                    render: (val) => (
                        <span className="text-slate-400">
                            {(val as number) ?? 0}
                        </span>
                    ),
                },
                {
                    key: 'id',
                    header: '播放',
                    width: 80,
                    render: (val) => <PlayButton id={val as number} />,
                },
            ],
            searchField: 'title',
            searchPlaceholder: '搜索视频名称...',
            permissions: {
                list: 'training-videos.list',
                create: 'training-videos.create',
                update: 'training-videos.update',
                delete: 'training-videos.delete',
            },
        }),
        [parentCompanyId],
    );

    return <CrudPage config={config} />;
}
