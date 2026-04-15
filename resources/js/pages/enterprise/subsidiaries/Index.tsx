import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import {
    Building2,
    Search,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from 'lucide-react';

interface Company {
    id: number;
    title: string;
    credit_code?: string;
    address?: string;
    status: number;
    status_str: string;
    pid: number;
    is_bloc: number;
    is_produce: number;
    enterprise_type?: { title: string };
    operational_type?: { title: string };
}

interface PaginatedResponse {
    data: Company[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export default function Subsidiaries() {
    const { rootCompany, enterCompany } = useScope();
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    const handleView = (c: Company) => {
        enterCompany({ id: c.id, title: c.title, is_bloc: c.is_bloc ?? 0, is_produce: c.is_produce ?? 1, pid: c.pid ?? rootCompany!.id, status: c.status });
        router.visit('/enterprise/current');
    };

    const fetchData = (p: number, q: string) => {
        if (!rootCompany?.id) return;
        setLoading(true);
        const params: Record<string, unknown> = { pid: rootCompany.id, page: p, per_page: 15 };
        if (q) params.title = q;

        api.get('/companies', { params })
            .then((res) => setData(res.data.data))
            .catch(() => setError('加载下级企业列表失败'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData(page, search);
    }, [rootCompany?.id, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData(1, search);
    };

    const statusColors: Record<number, string> = {
        0: 'border-amber-500/30 bg-amber-600/10 text-amber-400',
        1: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400',
        2: 'border-slate-500/30 bg-slate-600/10 text-slate-400',
    };

    return (
        <>
            <Head title="下级企业" />

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">下级企业</h1>
                    <p className="mt-1 text-sm text-slate-500">管理当前企业的直属下级企业</p>
                </div>
                {data && (
                    <span className="text-xs text-slate-500">共 {data.total} 家</span>
                )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="搜索企业名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                    />
                </div>
            </form>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-blue-900/40">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">企业名称</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 hidden md:table-cell">企业类型</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 hidden lg:table-cell">统一社会信用代码</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">状态</th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-blue-900/20 animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 w-48 rounded bg-slate-800" /></td>
                                        <td className="px-5 py-4 hidden md:table-cell"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                                        <td className="px-5 py-4 hidden lg:table-cell"><div className="h-4 w-36 rounded bg-slate-800" /></td>
                                        <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-slate-800" /></td>
                                        <td className="px-5 py-4 text-right"><div className="h-4 w-8 rounded bg-slate-800 ml-auto" /></td>
                                    </tr>
                                ))
                            )}
                            {!loading && data?.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center text-slate-600">
                                        <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        暂无下级企业
                                    </td>
                                </tr>
                            )}
                            {!loading && data?.data.map((c) => (
                                <tr key={c.id} className="border-b border-blue-900/20 hover:bg-blue-600/5 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 border border-blue-600/20">
                                                <Building2 className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <span className="font-medium text-slate-200">{c.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell text-slate-400">
                                        {c.enterprise_type?.title ?? '—'}
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-slate-500 font-mono text-xs">
                                        {c.credit_code ?? '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[c.status] ?? statusColors[2]}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${c.status === 1 ? 'bg-emerald-400' : 'bg-current'}`} />
                                            {c.status_str}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => handleView(c)}
                                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                                        >
                                            查看
                                            <ExternalLink className="h-3 w-3" />
                                        </button>
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
                            第 {data.current_page} / {data.last_page} 页，共 {data.total} 条
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

function PagBtn({ disabled, onClick, icon }: { disabled: boolean; onClick: () => void; icon: React.ReactNode }) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-900/40 bg-[#0a1428] text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {icon}
        </button>
    );
}
