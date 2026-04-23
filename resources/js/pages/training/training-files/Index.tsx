import { Download, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

function DownloadButton({ id }: { id: number }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        try {
            const res = await api.get<ApiResponse<string>>(
                `/training-files/${id}`,
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
                <Download className="h-3 w-3" />
            )}
            下载
        </button>
    );
}

export default function TrainingFilesIndex() {
    const { rootCompany } = useScope();
    const parentCompanyId = rootCompany?.pid;

    const config: CrudPageConfig = useMemo(
        () => ({
            title: '培训资料',
            endpoint: '/training-files',
            labelKey: 'title',
            forceReadOnly: true,
            extraParams: parentCompanyId
                ? { parent_company_id: parentCompanyId }
                : {},
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
                    key: 'id',
                    header: '下载',
                    width: 80,
                    render: (val) => <DownloadButton id={val as number} />,
                },
            ],
            searchField: 'title',
            searchPlaceholder: '搜索资料名称...',
            permissions: {
                list: 'training-files.list',
                create: 'training-files.create',
                update: 'training-files.update',
                delete: 'training-files.delete',
            },
        }),
        [parentCompanyId],
    );

    return <CrudPage config={config} />;
}
