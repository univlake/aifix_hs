import { Head } from '@inertiajs/react';
import { Search, Lock } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { formatAction, formatModule } from '@/lib/permission-labels';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface Permission {
    id: number;
    name: string;
}
interface GroupedPermissions {
    [module: string]: Permission[];
}

// ── Page ──────────────────────────────────────────────────────────

export default function PermissionsIndex() {
    const [grouped, setGrouped] = useState<GroupedPermissions>({});
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        api.get<
            ApiResponse<{ list: Permission[]; grouped: GroupedPermissions }>
        >('/permissions')
            .then((r) => {
                setGrouped(r.data.data?.grouped ?? {});
                setTotal(r.data.data?.list.length ?? 0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filteredModules = useMemo(() => {
        const q = search.trim().toLowerCase();
        const modules = Object.keys(grouped).sort();

        if (!q) {
            return modules;
        }

        return modules.filter((m) => {
            if (
                m.toLowerCase().includes(q) ||
                formatModule(m).toLowerCase().includes(q)
            ) {
                return true;
            }

            return grouped[m].some((p) => p.name.toLowerCase().includes(q));
        });
    }, [grouped, search]);

    const filteredGrouped = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) {
            return grouped;
        }

        const result: GroupedPermissions = {};
        filteredModules.forEach((m) => {
            result[m] = grouped[m].filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    m.toLowerCase().includes(q) ||
                    formatModule(m).toLowerCase().includes(q),
            );
        });

        return result;
    }, [grouped, filteredModules, search]);

    return (
        <>
            <Head title="权限列表" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        权限列表
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        共{' '}
                        <span className="font-medium text-slate-400">
                            {total}
                        </span>{' '}
                        个权限，
                        <span className="font-medium text-slate-400">
                            {Object.keys(grouped).length}
                        </span>{' '}
                        个模块
                        <span className="ml-1.5 text-slate-700">· 只读</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5">
                    <Search className="h-3.5 w-3.5 text-slate-600" />
                    <input
                        className="w-48 bg-transparent text-sm text-slate-300 placeholder-slate-700 outline-none"
                        placeholder="搜索权限或模块..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-600">
                    加载权限列表中...
                </div>
            ) : filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                    <Lock className="mb-3 h-8 w-8 opacity-30" />
                    <p className="text-sm">未找到匹配的权限</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredModules.map((module) => {
                        const perms = filteredGrouped[module] ?? [];

                        return (
                            <div
                                key={module}
                                className="rounded-xl border border-blue-900/25 bg-[#0d1530] p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-200">
                                        {formatModule(module)}
                                    </h3>
                                    <span className="rounded-full border border-blue-900/40 bg-[#070d1f]/60 px-2 py-0.5 text-[10px] text-slate-600">
                                        {perms.length} 个
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {perms.map((p) => {
                                        const action = p.name
                                            .split('.')
                                            .slice(1)
                                            .join('.');

                                        return (
                                            <span
                                                key={p.id}
                                                title={p.name}
                                                className={cn(
                                                    'inline-flex items-center rounded border px-2 py-0.5 text-[11px]',
                                                    'border-blue-900/30 bg-blue-600/8 text-blue-400/70',
                                                )}
                                            >
                                                {formatAction(action)}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
