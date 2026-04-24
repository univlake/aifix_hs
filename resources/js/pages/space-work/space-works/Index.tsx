import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DatePicker } from '@/components/shared/DatePicker';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';

// ── Types ──────────────────────────────────────────────────────────

interface JobRow {
    id: number;
    department: string | null;
    content: string | null;
    type: string | null;
    special_type: string | null;
    position: string | null;
    job_time: string | null;
    unit: string | null;
    is_outsourcing: number;
    evaluation_unit_id: number | null;
    evaluation_unit: { id: number; name: string } | null;
    job_people_number: number | null;
    job_people_name: string | null;
    risk_analysis: string | null;
    risk_protection: string | null;
}

interface Option {
    id: number;
    label: string;
}

// ── Constants ──────────────────────────────────────────────────────

const JOB_TYPES = ['一般作业', '八大特殊作业'] as const;

// ── Shared styles ──────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

// ── Modal ──────────────────────────────────────────────────────────

function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────

export default function SpaceWorksIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;
    const { canWrite } = usePermission();
    const canCreate = canWrite('job-management.create');
    const canUpdate = canWrite('job-management.update');
    const canDelete = canWrite('job-management.delete');

    const {
        data,
        loading,
        total,
        current_page,
        last_page,
        per_page,
        reload,
        goToPage,
        search,
    } = useApiList<JobRow>({
        endpoint: '/job-management',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/job-management');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<JobRow>();
    const detailItem = detail.data;
    const [deleteItem, setDeleteItem] = useState<JobRow | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [evaluationUnits, setEvaluationUnits] = useState<Option[]>([]);

    const emptyForm = () => ({
        department: '',
        content: '',
        type: '',
        special_type: '',
        position: '',
        job_time: '',
        unit: '',
        is_outsourcing: '0',
        evaluation_unit_id: '',
        job_people_number: '',
        job_people_name: '',
        risk_analysis: '',
        risk_protection: '',
    });
    const [form, setForm] = useState<Record<string, string>>(emptyForm());
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const loadOptions = useCallback(async () => {
        try {
            const res = await api.get('/evaluation-units', {
                params: {
                    per_page: 200,
                    ...(companyId ? { company_id: companyId } : {}),
                },
            });
            setEvaluationUnits(
                (res.data?.data?.data ?? []).map((x: any) => ({
                    id: x.id,
                    label: x.name,
                })),
            );
        } catch {
            // silently ignore
        }
    }, [companyId]);

    const openCreate = async () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        await loadOptions();
        setDialogOpen(true);
    };

    const openEdit = async (row: JobRow) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            department: row.department ?? '',
            content: row.content ?? '',
            type: row.type ?? '',
            special_type: row.special_type ?? '',
            position: row.position ?? '',
            job_time: row.job_time ? row.job_time.substring(0, 10) : '',
            unit: row.unit ?? '',
            is_outsourcing: String(row.is_outsourcing ?? 0),
            evaluation_unit_id: row.evaluation_unit_id
                ? String(row.evaluation_unit_id)
                : '',
            job_people_number: row.job_people_number
                ? String(row.job_people_number)
                : '',
            job_people_name: row.job_people_name ?? '',
            risk_analysis: row.risk_analysis ?? '',
            risk_protection: row.risk_protection ?? '',
        });
        await loadOptions();
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                department: form.department || null,
                content: form.content || null,
                type: form.type || null,
                special_type: form.special_type || null,
                position: form.position || null,
                job_time: form.job_time || null,
                unit: form.unit || null,
                is_outsourcing: Number(form.is_outsourcing),
                evaluation_unit_id:
                    form.is_outsourcing === '1' && form.evaluation_unit_id
                        ? Number(form.evaluation_unit_id)
                        : null,
                job_people_number: form.job_people_number
                    ? Number(form.job_people_number)
                    : null,
                job_people_name: form.job_people_name || null,
                risk_analysis: form.risk_analysis || null,
                risk_protection: form.risk_protection || null,
            };

            if (!editingId) {
                payload.company_id = companyId;
            }

            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }

            setDialogOpen(false);
            reload();
        } catch (err: unknown) {
            setFormError(getErrorMessage(err, '操作失败，请重试'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) {
            return;
        }

        await crud.remove(deleteItem.id);
        setDeleteItem(null);
        reload();
    };

    // ── Table columns ─────────────────────────────────────────────

    const columns: ColumnDef<JobRow>[] = [
        {
            accessorKey: 'type',
            header: '作业类型',
            size: 140,
            cell: ({ row }) => {
                const t = row.original.type;

                if (!t) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span
                        className={cn(
                            'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                            t === '八大特殊作业'
                                ? 'border-amber-500/20 bg-amber-600/8 text-amber-400'
                                : 'border-blue-500/20 bg-blue-600/8 text-blue-400',
                        )}
                    >
                        {t}
                    </span>
                );
            },
        },
        {
            accessorKey: 'department',
            header: '所属部门',
            size: 120,
            cell: ({ row }) =>
                row.original.department ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'content',
            header: '作业内容',
            cell: ({ row }) => (
                <span className="line-clamp-2 text-xs text-slate-300">
                    {row.original.content ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'position',
            header: '作业位置',
            size: 120,
            cell: ({ row }) =>
                row.original.position ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'job_time',
            header: '作业时间',
            size: 110,
            cell: ({ row }) =>
                row.original.job_time ? (
                    <span className="text-xs text-slate-400">
                        {row.original.job_time.substring(0, 10)}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'outsourcing',
            header: '是否外协',
            size: 90,
            cell: ({ row }) =>
                row.original.is_outsourcing ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-600/8 px-1.5 py-0.5 text-[10px] text-amber-400">
                        <span className="h-1 w-1 rounded-full bg-amber-400" />是
                    </span>
                ) : (
                    <span className="text-slate-700">否</span>
                ),
        },
        {
            accessorKey: 'evaluation_unit',
            header: '外协单位',
            size: 140,
            cell: ({ row }) =>
                row.original.evaluation_unit?.name ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
    ];

    columns.push({
        id: 'actions',
        header: '操作',
        size: readOnly ? 96 : 160,
        cell: ({ row }) => (
            <div className="flex items-center gap-0.5">
                <DetailButton row={row.original} onOpen={detail.openDetail} />
                {canUpdate && (
                    <button
                        onClick={() => openEdit(row.original)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => setDeleteItem(row.original)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        ),
    });

    const detailData = detailItem
        ? {
              ...detailItem,
              is_outsourcing: detailItem.is_outsourcing === 1 ? '是' : '否',
              evaluation_unit: detailItem.evaluation_unit?.name ?? null,
          }
        : null;

    // ── Render ────────────────────────────────────────────────────

    return (
        <>
            <Head title="作业管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        作业管理
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        共{' '}
                        <span className="font-medium text-slate-400">
                            {total}
                        </span>{' '}
                        条记录
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        新增作业
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索部门/作业内容..."
                searchValue={searchValue}
                onSearchChange={(v) => {
                    setSearchValue(v);
                    search({ department: v || undefined });
                }}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="作业管理详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    department: '所属部门',
                    content: '作业内容',
                    type: '作业类型',
                    special_type: '特殊作业类型',
                    position: '作业位置',
                    job_time: '作业时间',
                    unit: '作业单位',
                    is_outsourcing: '是否外协',
                    evaluation_unit: '外协单位',
                    job_people_number: '作业人数',
                    job_people_name: '作业人员',
                    risk_analysis: '风险分析',
                    risk_protection: '防护措施',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}作业
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId
                                ? '修改作业档案信息'
                                : '填写信息后保存新记录'}
                        </p>
                    </div>
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* 作业类型 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    作业类型
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) =>
                                        set('type', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {JOB_TYPES.map((t) => (
                                        <option
                                            key={t}
                                            value={t}
                                            className="bg-[#0d1530]"
                                        >
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 特殊作业类型 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    特殊作业类型
                                </label>
                                <input
                                    type="text"
                                    value={form.special_type}
                                    onChange={(e) =>
                                        set('special_type', e.target.value)
                                    }
                                    placeholder="如：动火、高处..."
                                    className={inputCls}
                                />
                            </div>

                            {/* 所属部门 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    所属部门
                                </label>
                                <input
                                    type="text"
                                    value={form.department}
                                    onChange={(e) =>
                                        set('department', e.target.value)
                                    }
                                    placeholder="部门名称"
                                    className={inputCls}
                                />
                            </div>

                            {/* 作业位置 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    作业位置
                                </label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={(e) =>
                                        set('position', e.target.value)
                                    }
                                    placeholder="位置描述"
                                    className={inputCls}
                                />
                            </div>

                            {/* 作业时间 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    作业时间
                                </label>
                                <DatePicker
                                    value={form.job_time}
                                    onChange={(v) => set('job_time', v)}
                                />
                            </div>

                            {/* 作业单位 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    作业单位
                                </label>
                                <input
                                    type="text"
                                    value={form.unit}
                                    onChange={(e) =>
                                        set('unit', e.target.value)
                                    }
                                    placeholder="作业单位"
                                    className={inputCls}
                                />
                            </div>

                            {/* 作业人数 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    作业人数
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.job_people_number}
                                    onChange={(e) =>
                                        set('job_people_number', e.target.value)
                                    }
                                    placeholder="人数"
                                    className={inputCls}
                                />
                            </div>

                            {/* 作业人员 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    作业人员
                                </label>
                                <input
                                    type="text"
                                    value={form.job_people_name}
                                    onChange={(e) =>
                                        set('job_people_name', e.target.value)
                                    }
                                    placeholder="人员姓名"
                                    className={inputCls}
                                />
                            </div>

                            {/* 是否外协 */}
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    是否外协
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        set(
                                            'is_outsourcing',
                                            form.is_outsourcing === '1'
                                                ? '0'
                                                : '1',
                                        )
                                    }
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                                        form.is_outsourcing === '1'
                                            ? 'border-emerald-500/25 bg-emerald-600/10 text-emerald-400'
                                            : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-1.5 w-1.5 shrink-0 rounded-full',
                                            form.is_outsourcing === '1'
                                                ? 'bg-emerald-400'
                                                : 'bg-slate-700',
                                        )}
                                    />
                                    {form.is_outsourcing === '1' ? '是' : '否'}
                                </button>
                            </div>

                            {/* 外协单位名称 — only when outsourcing */}
                            {form.is_outsourcing === '1' && (
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        外协单位名称
                                    </label>
                                    <select
                                        value={form.evaluation_unit_id}
                                        onChange={(e) =>
                                            set(
                                                'evaluation_unit_id',
                                                e.target.value,
                                            )
                                        }
                                        className={cn(
                                            inputCls,
                                            'cursor-pointer appearance-none',
                                        )}
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0d1530]"
                                        >
                                            请选择
                                        </option>
                                        {evaluationUnits.map((o) => (
                                            <option
                                                key={o.id}
                                                value={String(o.id)}
                                                className="bg-[#0d1530]"
                                            >
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* 作业内容 */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                作业内容
                            </label>
                            <textarea
                                rows={3}
                                value={form.content}
                                onChange={(e) => set('content', e.target.value)}
                                placeholder="描述作业内容"
                                className={cn(inputCls, 'resize-none')}
                            />
                        </div>

                        {/* 风险分析 */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                风险分析
                            </label>
                            <textarea
                                rows={3}
                                value={form.risk_analysis}
                                onChange={(e) =>
                                    set('risk_analysis', e.target.value)
                                }
                                placeholder="风险分析内容"
                                className={cn(inputCls, 'resize-none')}
                            />
                        </div>

                        {/* 风险防护措施 */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                风险防护措施
                            </label>
                            <textarea
                                rows={3}
                                value={form.risk_protection}
                                onChange={(e) =>
                                    set('risk_protection', e.target.value)
                                }
                                placeholder="防护措施内容"
                                className={cn(inputCls, 'resize-none')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formLoading}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {formLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {formLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除作业记录
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除此作业记录吗？此操作不可撤销。
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
                        disabled={crud.loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {crud.loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {crud.loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>
        </>
    );
}
