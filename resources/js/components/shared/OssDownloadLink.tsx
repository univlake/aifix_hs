import { Loader2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

interface OssDownloadLinkProps {
    url: string;
    label?: string;
    className?: string;
}

export function OssDownloadLink({
    url,
    label = '查看',
    className,
}: OssDownloadLinkProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!url) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<string>>('/upload/oss-sign', {
                params: { url },
            });
            const signed = res.data.data;

            if (signed) {
                window.open(signed, '_blank');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!url) {
        return <span className="text-slate-700">—</span>;
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={
                className ??
                'inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-600/10 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:pointer-events-none disabled:opacity-50'
            }
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <ExternalLink className="h-3 w-3" />
            )}
            {label}
        </button>
    );
}
