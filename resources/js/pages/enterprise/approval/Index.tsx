import { Head } from '@inertiajs/react';
import {
    BadgeCheck,
    Building2,
    Search,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Company {
    id: number;
    title: string;
    credit_code?: string;
    address?: string;
    status: number;
    created_at?: string;
    enterprise_type?: { title: string };
}

interface PaginatedResponse {
    data: Company[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function EnterpriseApproval() {
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');
    const [reviewing, setReviewing] = useState<number | null>(null);

    const fetchData = (p: number, q: string) => {
        setLoading(true);
        const params: Record<string, unknown> = { page: p, per_page: 15 };

        if (q) {
            params.title = q;
        }

        api.get('/companies-review-list', { params })
            .then((res) => setData(res.data.data))
            .catch(() => setError('加载审批列表失败'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData(page, search);
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData(1, search);
    };

    const handleReview = async (id: number, status: 1 | 2) => {
        setReviewing(id);

        try {
            await api.post(`/companies/${id}/review`, { status });
            fetchData(page, search);
        } catch {
            setError('审核操作失败，请重试');
        } finally {
            setReviewing(null);
        }
    };

    return (
        <>
            <Head title="企业审批" />

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        企业审批
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        审核待处理的企业注册申请
                    </p>
                </div>
                {data && data.total > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-600/10 px-3 py-1 text-xs text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        {data.total} 条待审核
                    </div>
                )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
                    <input
                        type="text"
                        placeholder="搜索企业名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                    />
                </div>
            </form>

            {error && (
                <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                    <button
                        onClick={() => setError('')}
                        className="text-xs text-red-600 hover:text-red-400"
                    >
                        关闭
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#0d1530]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-blue-900/40">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                    企业名称
                                </th>
                                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase md:table-cell">
                                    类型
                                </th>
                                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase lg:table-cell">
                                    申请时间
                                </th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr
                                        key={i}
                                        className="animate-pulse border-b border-blue-900/20"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="h-4 w-48 rounded bg-slate-800" />
                                        </td>
                                        <td className="hidden px-5 py-4 md:table-cell">
                                            <div className="h-4 w-20 rounded bg-slate-800" />
                                        </td>
                                        <td className="hidden px-5 py-4 lg:table-cell">
                                            <div className="h-4 w-32 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="ml-auto h-6 w-28 rounded bg-slate-800" />
                                        </td>
                                    </tr>
                                ))}
                            {!loading && data?.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-16 text-center text-slate-600"
                                    >
                                        <BadgeCheck className="mx-auto mb-3 h-10 w-10 opacity-30" />
                                        暂无待审核企业
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                data?.data.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-b border-blue-900/20 transition-colors hover:bg-blue-600/5"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-600/20 bg-amber-600/15">
                                                    <Building2 className="h-4 w-4 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-200">
                                                        {c.title}
                                                    </p>
                                                    {c.credit_code && (
                                                        <p className="mt-0.5 font-mono text-xs text-slate-600">
                                                            {c.credit_code}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden px-5 py-4 text-slate-400 md:table-cell">
                                            {c.enterprise_type?.title ?? '—'}
                                        </td>
                                        <td className="hidden px-5 py-4 text-xs text-slate-500 lg:table-cell">
                                            {c.created_at
                                                ? new Date(
                                                      c.created_at,
                                                  ).toLocaleDateString('zh-CN')
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    disabled={
                                                        reviewing === c.id
                                                    }
                                                    onClick={() =>
                                                        handleReview(c.id, 1)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <CheckCircle className="h-3 w-3" />
                                                    通过
                                                </button>
                                                <button
                                                    disabled={
                                                        reviewing === c.id
                                                    }
                                                    onClick={() =>
                                                        handleReview(c.id, 2)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-600/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    拒绝
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-blue-900/30 px-5 py-3">
                        <p className="text-xs text-slate-600">
                            第 {data.current_page} / {data.last_page} 页，共{' '}
                            {data.total} 条
                        </p>
                        <div className="flex items-center gap-1">
                            <PagBtn
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                icon={<ChevronLeft className="h-3.5 w-3.5" />}
                            />
                            <PagBtn
                                disabled={page >= data.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                icon={<ChevronRight className="h-3.5 w-3.5" />}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function PagBtn({
    disabled,
    onClick,
    icon,
}: {
    disabled: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-900/40 bg-[#0a1428] text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {icon}
        </button>
    );
}
