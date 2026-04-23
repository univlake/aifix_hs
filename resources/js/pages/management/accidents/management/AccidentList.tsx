import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { LevelBadge } from './components';
import { DetailPanel } from './drawers/DetailPanel';
import { DeleteAccidentModal } from './modals/DeleteAccidentModal';
import { EditAccidentModal } from './modals/EditAccidentModal';
import {
    LEVEL_OPTIONS,
    TYPE_OPTIONS,
    type AccidentRow,
} from './types';

export function AccidentList({ companyId }: { companyId: number | undefined }) {
    const { user, company } = useAuth();
    const currentUserCompanyId = user?.company_id ?? company?.id ?? null;
    const [rows, setRows] = useState<AccidentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [detailId, setDetailId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteRow, setDeleteRow] = useState<AccidentRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 8 }, (_, i) =>
        String(currentYear - i),
    );

    const fetchRows = async (
        p: number,
        type: string,
        level: string,
        year: string,
    ) => {
        if (!companyId) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<PaginatedData<AccidentRow>>>(
                '/bloc-accident-bulletins',
                {
                    params: {
                        company_id: companyId,
                        page: p,
                        per_page: 15,
                        ...(type ? { type } : {}),
                        ...(level ? { accident_level: level } : {}),
                        ...(year ? { happen_year: year } : {}),
                    },
                },
            );
            const meta = res.data.data;
            setRows(meta.data);
            setLastPage(meta.last_page);
            setTotal(meta.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchRows(1, filterType, filterLevel, filterYear);
    }, [companyId, filterType, filterLevel, filterYear]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePage = (p: number) => {
        setPage(p);
        fetchRows(p, filterType, filterLevel, filterYear);
    };

    const handleDelete = async () => {
        if (!deleteRow) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete(`/accident-bulletins/${deleteRow.id}`);
            setDeleteRow(null);
            fetchRows(page, filterType, filterLevel, filterYear);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] px-2.5 text-sm text-slate-300 outline-none"
                >
                    <option value="">全部年份</option>
                    {yearOptions.map((y) => (
                        <option key={y} value={y}>
                            {y} 年
                        </option>
                    ))}
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] px-2.5 text-sm text-slate-300 outline-none"
                >
                    <option value="">全部类型</option>
                    {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
                <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] px-2.5 text-sm text-slate-300 outline-none"
                >
                    <option value="">全部等级</option>
                    {LEVEL_OPTIONS.map((l) => (
                        <option key={l} value={l}>
                            {l}
                        </option>
                    ))}
                </select>
                <span className="ml-auto text-xs text-slate-600">
                    共{' '}
                    <span className="font-medium text-slate-400">{total}</span>{' '}
                    条
                </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-blue-900/30">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                            {[
                                '企业名称',
                                '发生时间',
                                '事故类型',
                                '事故等级',
                                '伤亡程度',
                                '死亡',
                                '受伤',
                                '发生地点',
                                '操作',
                            ].map((h, i) => (
                                <th
                                    key={i}
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
                                <td colSpan={9} className="py-16 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="py-16 text-center text-sm text-slate-600"
                                >
                                    暂无事故记录
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const canManage =
                                    currentUserCompanyId !== null &&
                                    Number(row.company_id) ===
                                        Number(currentUserCompanyId);

                                return (
                                    <tr
                                        key={row.id}
                                        className="border-b border-blue-900/20 transition-colors last:border-0 hover:bg-white/[0.02]"
                                    >
                                        <td
                                            className="max-w-[160px] truncate px-4 py-2.5 text-slate-300"
                                            title={row.company?.title ?? ''}
                                        >
                                            {row.company?.title ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-400">
                                            {row.happen_time ? (
                                                row.happen_time.slice(0, 10)
                                            ) : (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-300">
                                            {row.type ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <LevelBadge
                                                level={row.accident_level}
                                            />
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-400">
                                            {row.degree_injury ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-medium text-red-400">
                                            {(row.staff_die ?? 0) +
                                                (row.not_staff_die ?? 0) || (
                                                <span className="text-slate-700">
                                                    0
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-center font-medium text-amber-400">
                                            {(row.staff_hurt ?? 0) +
                                                (row.not_staff_hurt ?? 0) || (
                                                <span className="text-slate-700">
                                                    0
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className="max-w-[140px] truncate px-4 py-2.5 text-slate-400"
                                            title={row.happen_area ?? ''}
                                        >
                                            {row.happen_area ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                                                <button
                                                    onClick={() =>
                                                        setDetailId(row.id)
                                                    }
                                                    className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    详情
                                                </button>
                                                {canManage && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                setEditId(
                                                                    row.id,
                                                                )
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                                                            title="编辑"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteRow(
                                                                    row,
                                                                )
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                                                            title="删除"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
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

            {detailId !== null && (
                <DetailPanel id={detailId} onClose={() => setDetailId(null)} />
            )}

            {editId !== null && (
                <EditAccidentModal
                    id={editId}
                    open={editId !== null}
                    onClose={() => setEditId(null)}
                    onSaved={() => {
                        fetchRows(page, filterType, filterLevel, filterYear);
                    }}
                />
            )}

            {deleteRow !== null && (
                <DeleteAccidentModal
                    loading={deleting}
                    onCancel={() => setDeleteRow(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}
