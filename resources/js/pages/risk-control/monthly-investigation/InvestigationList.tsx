import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Pencil,
    Trash2,
} from 'lucide-react';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import { LEVEL_CLS, type Investigation } from './types';

interface InvestigationListProps {
    rows: Investigation[];
    loading: boolean;
    page: number;
    lastPage: number;
    myCompanyId: number | undefined;
    onView: (row: Investigation) => void;
    onEdit: (row: Investigation) => void;
    onDelete: (row: Investigation) => void;
    onPage: (p: number) => void;
}

export function InvestigationList({
    rows,
    loading,
    page,
    lastPage,
    myCompanyId,
    onView,
    onEdit,
    onDelete,
    onPage,
}: InvestigationListProps) {
    const { canWrite } = usePermission();
    const canUpdate = canWrite('monthly-investigations.update');
    const canDelete = canWrite('monthly-investigations.delete');
    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-blue-900/30">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                            {[
                                '企业名称',
                                '排查时间',
                                '隐患类型',
                                '等级',
                                '排查人',
                                '隐患描述',
                                '整改结果',
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
                                <td colSpan={8} className="py-16 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-16 text-center text-sm text-slate-600"
                                >
                                    暂无隐患记录
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const isMine =
                                    myCompanyId !== undefined &&
                                    row.company_id === myCompanyId;

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
                                        <td className="px-4 py-2.5 text-xs text-slate-400">
                                            {row.inv_time ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {row.type ? (
                                                <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-[10px] text-blue-400">
                                                    {row.type}
                                                </span>
                                            ) : (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {row.level ? (
                                                <span
                                                    className={cn(
                                                        'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                                                        LEVEL_CLS[row.level] ??
                                                            'border-slate-700/40 bg-slate-700/20 text-slate-500',
                                                    )}
                                                >
                                                    {row.level}
                                                </span>
                                            ) : (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-slate-400">
                                            {row.inv_name ?? (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="max-w-[200px] px-4 py-2.5 text-xs text-slate-400">
                                            {row.content ? (
                                                <span
                                                    className="line-clamp-2"
                                                    title={row.content}
                                                >
                                                    {row.content}
                                                </span>
                                            ) : (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {row.correct_result ? (
                                                <CorrectResultBadge
                                                    value={row.correct_result}
                                                />
                                            ) : (
                                                <span className="text-slate-700">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    详情
                                                </button>
                                                {isMine && canUpdate && (
                                                    <button
                                                        onClick={() =>
                                                            onEdit(row)
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                                                        title="编辑"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                {isMine && canDelete && (
                                                    <button
                                                        onClick={() =>
                                                            onDelete(row)
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                                                        title="删除"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
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
                        onClick={() => onPage(page - 1)}
                        disabled={page <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-500">
                        {page} / {lastPage}
                    </span>
                    <button
                        onClick={() => onPage(page + 1)}
                        disabled={page >= lastPage}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </>
    );
}

function CorrectResultBadge({ value }: { value: string }) {
    const cls =
        value === '已整改'
            ? 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400'
            : value === '部分整改'
              ? 'border-amber-500/30 bg-amber-600/10 text-amber-400'
              : value === '整改不到位'
                ? 'border-orange-500/30 bg-orange-600/10 text-orange-400'
                : 'border-slate-600/40 bg-slate-700/20 text-slate-500';

    return (
        <span
            className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                cls,
            )}
        >
            {value}
        </span>
    );
}
