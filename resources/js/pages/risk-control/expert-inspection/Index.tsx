import { Head } from '@inertiajs/react';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { useAuth } from '@/hooks/use-auth';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { Modal, isActive, pickCompanies } from './components';
import { DetailDrawer } from './drawers/DetailDrawer';
import { HazardStatsModal } from './modals/HazardStatsModal';
import { PlanModal } from './modals/PlanModal';
import { inputCls } from './types';
import type { Inspection } from './types';

export default function ExpertInspectionGroupView({
    mode = 'admin',
}: {
    mode?: 'admin' | 'production';
}) {
    const { rootCompany, activeCompany } = useScope();
    const { user } = useAuth();
    const { canWrite } = usePermission();
    const canCreate = canWrite('expert-inspections.create');
    const canUpdate = canWrite('expert-inspections.update');
    const canDelete = canWrite('expert-inspections.delete');
    const isProduction = mode === 'production';
    const companyId =
        (isProduction ? activeCompany?.id : rootCompany?.id) ?? undefined;

    const [rows, setRows] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [planOpen, setPlanOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Inspection | null>(null);
    const [detail, setDetail] = useState<Inspection | null>(null);
    const [deleteItem, setDeleteItem] = useState<Inspection | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    const fetchRows = useCallback(
        async (p: number, title: string) => {
            if (!companyId && !user?.id) {
                return;
            }

            setLoading(true);

            try {
                const res = await api.get<
                    ApiResponse<PaginatedData<Inspection>>
                >('/expert-inspections', {
                    params: {
                        ...(companyId ? { company_id: companyId } : {}),
                        ...(user?.id ? { expert_user_id: user.id } : {}),
                        page: p,
                        per_page: 15,
                        ...(title ? { title } : {}),
                    },
                });
                setRows(res.data.data.data);
                setLastPage(res.data.data.last_page);
                setTotal(res.data.data.total);
            } finally {
                setLoading(false);
            }
        },
        [companyId, user?.id],
    );

    useEffect(() => {
        setPage(1);
        fetchRows(1, search);
    }, [companyId, user?.id, search, fetchRows]);

    const handlePage = (p: number) => {
        setPage(p);
        fetchRows(p, search);
    };

    const openCreate = () => {
        setEditingPlan(null);
        setPlanOpen(true);
    };

    const openEdit = (row: Inspection) => {
        setEditingPlan(row);
        setPlanOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteItem) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete(`/expert-inspections/${deleteItem.id}`);
            setDeleteItem(null);
            fetchRows(page, search);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Head title="专家检查" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        专家检查
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        {isProduction
                            ? '查看本企业相关的专家检查计划'
                            : '集团端专家现场安全检查任务管理'}{' '}
                        · 共{' '}
                        <span className="font-medium text-slate-400">
                            {total}
                        </span>{' '}
                        条记录
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {companyId && !isProduction && (
                        <button
                            onClick={() => setStatsModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-400/50 hover:bg-emerald-600/25 active:scale-95"
                        >
                            <BarChart3 className="h-4 w-4" />
                            导出隐患分类统计
                        </button>
                    )}
                    {companyId && !isProduction && canCreate && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            新建检查计划
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
                <input
                    className={cn(inputCls, 'max-w-xs')}
                    placeholder="搜索检查主题..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setSearch(searchInput.trim());
                        }
                    }}
                />
                <button
                    onClick={() => setSearch(searchInput.trim())}
                    className="rounded-lg border border-blue-900/40 px-3 py-2 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    搜索
                </button>
                {search && (
                    <button
                        onClick={() => {
                            setSearchInput('');
                            setSearch('');
                        }}
                        className="rounded-lg border border-blue-900/40 px-3 py-2 text-xs text-slate-500 hover:text-slate-300"
                    >
                        清除
                    </button>
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-blue-900/30">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                            {[
                                '检查主题',
                                '开始日期',
                                '结束日期',
                                '受检企业',
                                '状态',
                                '操作',
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-slate-500 uppercase"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="py-16 text-center text-sm text-slate-600"
                                >
                                    暂无检查计划
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const active = isActive(row);
                                const companiesCount =
                                    pickCompanies(row).length;

                                return (
                                    <tr
                                        key={row.id}
                                        className="border-b border-blue-900/20 transition-colors last:border-0 hover:bg-white/[0.02]"
                                    >
                                        <td
                                            className="max-w-[240px] truncate px-4 py-2.5 text-slate-200"
                                            title={row.title}
                                        >
                                            {row.title}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400">
                                            {row.start_date ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400">
                                            {row.end_date ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400">
                                            {companiesCount}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {active ? (
                                                <span className="rounded-md border border-emerald-500/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-400">
                                                    进行中
                                                </span>
                                            ) : (
                                                <span className="rounded-md border border-slate-600/40 bg-slate-700/20 px-2 py-0.5 text-[10px] text-slate-500">
                                                    已结束
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    onClick={() =>
                                                        setDetail(row)
                                                    }
                                                    className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    详情
                                                </button>
                                                {active &&
                                                    row.company_id ===
                                                        companyId && (
                                                        <>
                                                            {canUpdate && (
                                                                <button
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            row,
                                                                        )
                                                                    }
                                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                                                                    title="编辑"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() =>
                                                                        setDeleteItem(
                                                                            row,
                                                                        )
                                                                    }
                                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                                                                    title="删除"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        onClick={() => handlePage(page - 1)}
                        disabled={page <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-500">
                        {page} / {lastPage}
                    </span>
                    <button
                        onClick={() => handlePage(page + 1)}
                        disabled={page >= lastPage}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            <PlanModal
                open={planOpen}
                editing={editingPlan}
                onClose={() => setPlanOpen(false)}
                companyId={companyId ?? 0}
                onSaved={() => {
                    setPlanOpen(false);
                    fetchRows(page, search);
                }}
            />

            {detail && (
                <DetailDrawer
                    inspection={detail}
                    canEdit={
                        isActive(detail) && detail.company_id === companyId
                    }
                    userId={user?.id ?? null}
                    rootCompanyId={companyId ?? 0}
                    onClose={() => setDetail(null)}
                    onChanged={() => fetchRows(page, search)}
                />
            )}

            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除检查计划
                    </h2>
                    <p className="text-sm text-slate-500">
                        该操作将同时失去对相关受检企业、专家与隐患的关联视图。确定删除？
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDeleteItem(null)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {deleting && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        确认删除
                    </button>
                </div>
            </Modal>

            {companyId && (
                <HazardStatsModal
                    open={statsModalOpen}
                    onClose={() => setStatsModalOpen(false)}
                    companyId={companyId}
                />
            )}
        </>
    );
}
