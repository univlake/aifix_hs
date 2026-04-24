import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    BarChart3,
    TrendingUp,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse } from '@/types/models';

// ── Types ──────────────────────────────────────────────────────────

interface SecurityInvestment {
    id: number;
    year: string | null;
    type: string | null;
    title: string | null;
    content: string | null;
    budget: number | null;
    last_year_income: number | null;
    scale: string;
}

interface FundingExecution {
    id: number;
    year: string | null;
    security_investment_id: number | null;
    security_investment?: SecurityInvestment;
    simple_content: string | null;
    content: string | null;
    budget: number | null;
    proportion: string;
}

// ── Shared styles & constants ─────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2 px-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30';

const INVESTMENT_TYPES = ['安全投入', '消防投入'] as const;

function buildYearOptions(): string[] {
    const current = new Date().getFullYear();

    return Array.from({ length: 8 }, (_, i) => String(current + 1 - i));
}

function fmt(v: number | null | undefined): string {
    if (v == null) {
        return '—';
    }

    return Number(v).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function Dash() {
    return <span className="text-slate-700">—</span>;
}

// ── Sub-components ─────────────────────────────────────────────────

function FieldLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
            {children}
            {required && <span className="ml-1 text-blue-500">*</span>}
        </label>
    );
}

function FormError({ message }: { message: string }) {
    if (!message) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {message}
        </div>
    );
}

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
            <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl">
                {children}
            </div>
        </div>
    );
}

// ── Tab 1: Security Investment Plans ──────────────────────────────

function InvestmentPlansTab({ companyId }: { companyId: number }) {
    const {
        data,
        loading,
        total,
        current_page,
        last_page,
        per_page,
        reload,
        goToPage,
    } = useApiList<SecurityInvestment>({
        endpoint: '/security-investments',
        defaultParams: { company_id: companyId },
        enabled: !!companyId,
    });

    const crud = useApiCrud('/security-investments');
    const { canWrite } = usePermission();
    const canCreate = canWrite('security-investments.create');
    const canUpdate = canWrite('security-investments.update');
    const canDelete = canWrite('security-investments.delete');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const detail = useDetailDrawer<SecurityInvestment>();
    const detailItem = detail.data;
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const emptyForm = {
        year: '',
        type: '',
        title: '',
        content: '',
        budget: '',
        last_year_income: '',
    };
    const [form, setForm] = useState<Record<string, string>>(emptyForm);
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (row: SecurityInvestment) => {
        setEditingId(row.id);
        setForm({
            year: row.year ?? '',
            type: row.type ?? '',
            title: row.title ?? '',
            content: row.content ?? '',
            budget: row.budget != null ? String(row.budget) : '',
            last_year_income:
                row.last_year_income != null
                    ? String(row.last_year_income)
                    : '',
        });
        setFormError('');
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                ...form,
                company_id: companyId,
                budget: form.budget !== '' ? Number(form.budget) : null,
                last_year_income:
                    form.last_year_income !== ''
                        ? Number(form.last_year_income)
                        : null,
            };

            if (form.year === '') {
                payload.year = null;
            }

            if (form.type === '') {
                payload.type = null;
            }

            if (form.title === '') {
                payload.title = null;
            }

            if (form.content === '') {
                payload.content = null;
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
        if (!deleteId) {
            return;
        }

        await crud.remove(deleteId);
        setDeleteId(null);
        reload();
    };

    const columns: ColumnDef<SecurityInvestment>[] = [
        {
            accessorKey: 'year',
            header: '年份',
            size: 70,
            cell: ({ row }) => row.original.year ?? <Dash />,
        },
        {
            accessorKey: 'type',
            header: '类型',
            size: 90,
            cell: ({ row }) => row.original.type ?? <Dash />,
        },
        {
            accessorKey: 'title',
            header: '标题',
            cell: ({ row }) => row.original.title ?? <Dash />,
        },
        {
            accessorKey: 'budget',
            header: '计划金额（万元）',
            cell: ({ row }) =>
                row.original.budget != null ? (
                    fmt(row.original.budget)
                ) : (
                    <Dash />
                ),
        },
        {
            accessorKey: 'last_year_income',
            header: '上季度营业收入（万元）',
            cell: ({ row }) =>
                row.original.last_year_income != null ? (
                    fmt(row.original.last_year_income)
                ) : (
                    <Dash />
                ),
        },
        {
            accessorKey: 'scale',
            header: '占上季度营收比例',
            cell: ({ row }) => (
                <span className="font-medium text-blue-400">
                    {row.original.scale}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '操作',
            size: 160,
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    <DetailButton
                        row={row.original}
                        onOpen={detail.openDetail}
                    />
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
                            onClick={() => setDeleteId(row.original.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    共{' '}
                    <span className="font-medium text-slate-300">{total}</span>{' '}
                    条记录
                </p>
                {canCreate && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 hover:border-blue-400/50 hover:bg-blue-600/25"
                    >
                        <Plus className="h-4 w-4" />
                        新增计划
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="安全投入计划详情"
                data={detailItem as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    year: '年份',
                    type: '类型',
                    title: '标题',
                    content: '内容说明',
                    budget: '计划金额（万元）',
                    last_year_income: '上季度营业收入（万元）',
                    scale: '占上季度营收比例',
                }}
            />

            {/* Create / Edit */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}安全投入计划
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            占比将根据计划金额和上季度营业收入自动计算
                        </p>
                    </div>
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="text-slate-600 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <FormError message={formError} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>年份</FieldLabel>
                                <select
                                    value={form.year}
                                    onChange={(e) =>
                                        set('year', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择年份
                                    </option>
                                    {buildYearOptions().map((y) => (
                                        <option
                                            key={y}
                                            value={y}
                                            className="bg-[#0d1530]"
                                        >
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FieldLabel>类型</FieldLabel>
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
                                        请选择类型
                                    </option>
                                    {INVESTMENT_TYPES.map((t) => (
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
                        </div>
                        <div>
                            <FieldLabel>标题</FieldLabel>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => set('title', e.target.value)}
                                placeholder="计划标题"
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FieldLabel required>
                                    计划金额（万元）
                                </FieldLabel>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.budget}
                                    onChange={(e) =>
                                        set('budget', e.target.value)
                                    }
                                    placeholder="0.00"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <FieldLabel>上季度营业收入（万元）</FieldLabel>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.last_year_income}
                                    onChange={(e) =>
                                        set('last_year_income', e.target.value)
                                    }
                                    placeholder="0.00"
                                    className={inputCls}
                                />
                                <p className="mt-1 text-xs text-slate-600">
                                    用于计算占比
                                </p>
                            </div>
                        </div>
                        <div>
                            <FieldLabel>内容说明</FieldLabel>
                            <textarea
                                value={form.content}
                                onChange={(e) => set('content', e.target.value)}
                                rows={3}
                                placeholder="计划内容详情"
                                className={cn(inputCls, 'resize-none')}
                            />
                        </div>
                        {/* Live ratio preview */}
                        {form.budget &&
                            form.last_year_income &&
                            Number(form.last_year_income) > 0 && (
                                <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 px-4 py-3">
                                    <p className="text-xs text-slate-500">
                                        预计占比
                                    </p>
                                    <p className="mt-0.5 text-lg font-semibold text-blue-400">
                                        {(
                                            (Number(form.budget) /
                                                Number(form.last_year_income)) *
                                            100
                                        ).toFixed(2)}
                                        %
                                    </p>
                                </div>
                            )}
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formLoading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-60"
                    >
                        {formLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {formLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除安全投入计划
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除这条记录吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDeleteId(null)}
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

// ── Tab 2: Funding Executions ──────────────────────────────────────

function FundingExecutionsTab({ companyId }: { companyId: number }) {
    const {
        data,
        loading,
        total,
        current_page,
        last_page,
        per_page,
        reload,
        goToPage,
    } = useApiList<FundingExecution>({
        endpoint: '/funding-executions',
        defaultParams: { company_id: companyId },
        enabled: !!companyId,
    });

    const crud = useApiCrud('/funding-executions');
    const { canWrite } = usePermission();
    const canCreate = canWrite('funding-executions.create');
    const canUpdate = canWrite('funding-executions.update');
    const canDelete = canWrite('funding-executions.delete');

    // Load available investment plans for the select
    const [plans, setPlans] = useState<SecurityInvestment[]>([]);
    useEffect(() => {
        api.get<ApiResponse<{ data: SecurityInvestment[] }>>(
            '/security-investments',
            {
                params: { company_id: companyId, per_page: 200 },
            },
        )
            .then(({ data: res }) => setPlans(res.data?.data ?? []))
            .catch(() => {});
    }, [companyId]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const detail = useDetailDrawer<FundingExecution>();
    const detailItem = detail.data;
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const emptyForm = {
        year: '',
        security_investment_id: '',
        simple_content: '',
        content: '',
        budget: '',
    };
    const [form, setForm] = useState<Record<string, string>>(emptyForm);
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError('');
        setDialogOpen(true);
    };

    const openEdit = (row: FundingExecution) => {
        setEditingId(row.id);
        setForm({
            year: row.year ?? '',
            security_investment_id:
                row.security_investment_id != null
                    ? String(row.security_investment_id)
                    : '',
            simple_content: row.simple_content ?? '',
            content: row.content ?? '',
            budget: row.budget != null ? String(row.budget) : '',
        });
        setFormError('');
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                ...form,
                company_id: companyId,
                budget: form.budget !== '' ? Number(form.budget) : null,
                security_investment_id:
                    form.security_investment_id !== ''
                        ? Number(form.security_investment_id)
                        : null,
            };

            if (form.year === '') {
                payload.year = null;
            }

            if (form.simple_content === '') {
                payload.simple_content = null;
            }

            if (form.content === '') {
                payload.content = null;
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
        if (!deleteId) {
            return;
        }

        await crud.remove(deleteId);
        setDeleteId(null);
        reload();
    };

    // Compute annual total from loaded data for the live preview
    const getAnnualTotal = useCallback(
        (year: string): number => {
            return plans
                .filter((p) => p.year === year)
                .reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
        },
        [plans],
    );

    const previewYear = form.year;
    const previewBudget = Number(form.budget) || 0;
    const previewAnnualTotal = previewYear ? getAnnualTotal(previewYear) : 0;
    const previewProportion =
        previewAnnualTotal > 0 && previewBudget > 0
            ? ((previewBudget / previewAnnualTotal) * 100).toFixed(2) + '%'
            : null;

    const columns: ColumnDef<FundingExecution>[] = [
        {
            accessorKey: 'year',
            header: '年份',
            size: 70,
            cell: ({ row }) => row.original.year ?? <Dash />,
        },
        {
            id: 'plan',
            header: '关联计划',
            cell: ({ row }) =>
                row.original.security_investment?.title ?? <Dash />,
        },
        {
            accessorKey: 'simple_content',
            header: '简要内容',
            cell: ({ row }) => row.original.simple_content ?? <Dash />,
        },
        {
            accessorKey: 'budget',
            header: '执行金额（万元）',
            cell: ({ row }) =>
                row.original.budget != null ? (
                    fmt(row.original.budget)
                ) : (
                    <Dash />
                ),
        },
        {
            accessorKey: 'proportion',
            header: '占年度安全投入总额比例',
            cell: ({ row }) => (
                <span className="font-medium text-emerald-400">
                    {row.original.proportion ?? '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '操作',
            size: 160,
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    <DetailButton
                        row={row.original}
                        onOpen={detail.openDetail}
                    />
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
                            onClick={() => setDeleteId(row.original.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    共{' '}
                    <span className="font-medium text-slate-300">{total}</span>{' '}
                    条记录
                </p>
                {canCreate && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 hover:border-blue-400/50 hover:bg-blue-600/25"
                    >
                        <Plus className="h-4 w-4" />
                        新增执行记录
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="经费执行记录详情"
                data={detailItem as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    year: '年份',
                    security_investment: '关联计划',
                    last_year_income: '上季度营业收入（万元）',
                    scale: '占上季度营收比例',
                    title: '计划标题',
                    simple_content: '简要内容',
                    content: '详细内容',
                    budget: '执行金额（万元）',
                    proportion: '占年度安全投入总额比例',
                }}
            />

            {/* Create / Edit */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}经费执行记录
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            占比将根据当年全部计划金额自动计算
                        </p>
                    </div>
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="text-slate-600 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <FormError message={formError} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>年份</FieldLabel>
                                <select
                                    value={form.year}
                                    onChange={(e) =>
                                        set('year', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择年份
                                    </option>
                                    {buildYearOptions().map((y) => (
                                        <option
                                            key={y}
                                            value={y}
                                            className="bg-[#0d1530]"
                                        >
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FieldLabel>关联安全投入计划</FieldLabel>
                                <select
                                    value={form.security_investment_id}
                                    onChange={(e) =>
                                        set(
                                            'security_investment_id',
                                            e.target.value,
                                        )
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择计划
                                    </option>
                                    {plans.map((p) => (
                                        <option
                                            key={p.id}
                                            value={String(p.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {p.year ? `[${p.year}] ` : ''}
                                            {p.title ?? `计划#${p.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <FieldLabel>简要内容</FieldLabel>
                            <input
                                type="text"
                                value={form.simple_content}
                                onChange={(e) =>
                                    set('simple_content', e.target.value)
                                }
                                placeholder="执行项目简述"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>执行金额（万元）</FieldLabel>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.budget}
                                onChange={(e) => set('budget', e.target.value)}
                                placeholder="0.00"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel>详细内容</FieldLabel>
                            <textarea
                                value={form.content}
                                onChange={(e) => set('content', e.target.value)}
                                rows={3}
                                placeholder="执行情况详细说明"
                                className={cn(inputCls, 'resize-none')}
                            />
                        </div>
                        {/* Live proportion preview */}
                        {previewProportion && (
                            <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/20 px-4 py-3">
                                <p className="text-xs text-slate-500">
                                    预计占{previewYear}年安全投入总额比例
                                    <span className="ml-1 text-slate-600">
                                        （总额：{fmt(previewAnnualTotal)} 万元）
                                    </span>
                                </p>
                                <p className="mt-0.5 text-lg font-semibold text-emerald-400">
                                    {previewProportion}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formLoading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-60"
                    >
                        {formLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {formLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除经费执行记录
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除这条记录吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDeleteId(null)}
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

// ── Page ───────────────────────────────────────────────────────────

type TabId = 'plans' | 'executions';

export default function SafetyInvestmentIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;
    const [activeTab, setActiveTab] = useState<TabId>('plans');

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        {
            id: 'plans',
            label: '安全投入计划',
            icon: <BarChart3 className="h-3.5 w-3.5" />,
        },
        {
            id: 'executions',
            label: '经费执行情况',
            icon: <TrendingUp className="h-3.5 w-3.5" />,
        },
    ];

    return (
        <>
            <Head title="安全投入" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-100">安全投入</h1>
                <p className="mt-0.5 text-xs text-slate-600">
                    记录和统计安全生产专项经费投入情况，保障安全资金合理使用
                </p>
            </div>

            {!companyId ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-600">
                    请先选择企业
                </div>
            ) : (
                <div className="rounded-xl border border-blue-900/30 bg-[#0d1530] p-5">
                    {/* Tabs */}
                    <div className="mb-5 flex gap-1 rounded-lg border border-blue-900/30 bg-[#070d1f] p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                                    activeTab === tab.id
                                        ? 'border border-blue-500/30 bg-blue-600/20 text-blue-300'
                                        : 'text-slate-500 hover:text-slate-300',
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'plans' && (
                        <InvestmentPlansTab companyId={companyId} />
                    )}
                    {activeTab === 'executions' && (
                        <FundingExecutionsTab companyId={companyId} />
                    )}
                </div>
            )}
        </>
    );
}
