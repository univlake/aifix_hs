import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    ChevronDown,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DatePicker } from '@/components/shared/DatePicker';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────

interface AnnexItem {
    id?: number;
    annex_url: string;
}

interface Investigation {
    id: number;
    company_id: number;
    type: string | null;
    level: string | null;
    is_fire_fighting: number | null;
    is_emergency: number | null;
    inv_time: string | null;
    inv_name: string | null;
    content: string | null;
    legalbasis: string | null;
    proposal: string | null;
    correct_date: string | null;
    correct_result: string | null;
    is_govern: number | null;
    govern_title: string | null;
    govern_user: string | null;
    govern_date: string | null;
    govern_money: string | null;
    govern_supplies: string | null;
    govern_text: string | null;
    review_user: string | null;
    review_date: string | null;
    review_discription: string | null;
    review_content: string | null;
    monthlyInvestigationReviews: AnnexItem[];
    monthlyInvestigationViews: AnnexItem[];
    monthly_investigation_reviews?: AnnexItem[];
    monthly_investigation_views?: AnnexItem[];
}

// ── Constants ──────────────────────────────────────────────────────

const TYPE_OPTIONS = [
    '消防',
    '机械',
    '危化品',
    '职业健康',
    '电气',
    '基础管理',
    '三违',
];

const LEVEL_OPTIONS = ['一般隐患', '重大隐患'];

const CORRECT_RESULT_OPTIONS = ['已整改', '未整改', '整改不到位', '部分整改'];

const LEVEL_CLS: Record<string, string> = {
    一般隐患: 'border-blue-500/30 bg-blue-600/10 text-blue-400',
    重大隐患: 'border-red-500/30 bg-red-600/10 text-red-400',
};

// ── Helpers ────────────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

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

// ── Filter select ──────────────────────────────────────────────────

function FilterSelect({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] pr-7 pl-3 text-xs text-slate-400 transition-colors outline-none focus:border-blue-500/40"
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-600" />
        </div>
    );
}

// ── Annex list editor ──────────────────────────────────────────────

function AnnexListEditor({
    value,
    onChange,
    label,
}: {
    value: AnnexItem[];
    onChange: (v: AnnexItem[]) => void;
    label: string;
}) {
    const add = () => onChange([...value, { annex_url: '' }]);
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const setUrl = (i: number, url: string) =>
        onChange(
            value.map((v, idx) => (idx === i ? { ...v, annex_url: url } : v)),
        );

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {label}
                </label>
                <button
                    type="button"
                    onClick={add}
                    className="text-xs text-blue-400 hover:text-blue-300"
                >
                    + 添加附件
                </button>
            </div>
            {value.length === 0 && (
                <p className="text-xs text-slate-700">暂无附件</p>
            )}
            {value.map((item, i) => (
                <div key={i} className="mb-2 flex items-start gap-2">
                    <div className="flex-1">
                        <OssUploadField
                            value={item.annex_url}
                            onChange={(url) => setUrl(i, url)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="mt-1 text-slate-600 hover:text-red-400"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ── Form state helpers ─────────────────────────────────────────────

type FormState = {
    type: string;
    level: string;
    is_fire_fighting: string;
    is_emergency: string;
    inv_time: string;
    inv_name: string;
    content: string;
    legalbasis: string;
    proposal: string;
    correct_date: string;
    correct_result: string;
    is_govern: string;
    govern_title: string;
    govern_user: string;
    govern_date: string;
    govern_money: string;
    govern_supplies: string;
    govern_text: string;
    review_user: string;
    review_date: string;
    review_discription: string;
    review_content: string;
    monthlyInvestigationReviews: AnnexItem[];
    monthlyInvestigationViews: AnnexItem[];
};

function emptyForm(): FormState {
    return {
        type: '',
        level: '',
        is_fire_fighting: '0',
        is_emergency: '0',
        inv_time: '',
        inv_name: '',
        content: '',
        legalbasis: '',
        proposal: '',
        correct_date: '',
        correct_result: '',
        is_govern: '0',
        govern_title: '',
        govern_user: '',
        govern_date: '',
        govern_money: '',
        govern_supplies: '',
        govern_text: '',
        review_user: '',
        review_date: '',
        review_discription: '',
        review_content: '',
        monthlyInvestigationReviews: [],
        monthlyInvestigationViews: [],
    };
}

function rowToForm(row: Investigation): FormState {
    const monthlyInvestigationReviews =
        row.monthlyInvestigationReviews ??
        row.monthly_investigation_reviews ??
        [];
    const monthlyInvestigationViews =
        row.monthlyInvestigationViews ?? row.monthly_investigation_views ?? [];

    return {
        type: row.type ?? '',
        level: row.level ?? '',
        is_fire_fighting: String(row.is_fire_fighting ?? 0),
        is_emergency: String(row.is_emergency ?? 0),
        inv_time: row.inv_time ?? '',
        inv_name: row.inv_name ?? '',
        content: row.content ?? '',
        legalbasis: row.legalbasis ?? '',
        proposal: row.proposal ?? '',
        correct_date: row.correct_date ?? '',
        correct_result: row.correct_result ?? '',
        is_govern: String(row.is_govern ?? 0),
        govern_title: row.govern_title ?? '',
        govern_user: row.govern_user ?? '',
        govern_date: row.govern_date ?? '',
        govern_money: row.govern_money ?? '',
        govern_supplies: row.govern_supplies ?? '',
        govern_text: row.govern_text ?? '',
        review_user: row.review_user ?? '',
        review_date: row.review_date ?? '',
        review_discription: row.review_discription ?? '',
        review_content: row.review_content ?? '',
        monthlyInvestigationReviews,
        monthlyInvestigationViews,
    };
}

// ── Page ───────────────────────────────────────────────────────────

export default function MonthlyInvestigationIndex() {
    const { activeCompany } = useScope();
    const { canWrite } = usePermission();
    const canCreate = canWrite('monthly-investigations.create');
    const canUpdate = canWrite('monthly-investigations.update');
    const canDelete = canWrite('monthly-investigations.delete');
    const companyId = activeCompany?.id;

    const [filterType, setFilterType] = useState('');
    const [filterLevel, setFilterLevel] = useState('');

    const extraParams = {
        ...(companyId ? { company_id: companyId } : {}),
        ...(filterType ? { type: filterType } : {}),
        ...(filterLevel ? { level: filterLevel } : {}),
    };

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
    } = useApiList<Investigation>({
        endpoint: '/monthly-investigations',
        defaultParams: extraParams,
        enabled: !!companyId,
    });

    const crud = useApiCrud('/monthly-investigations');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<Investigation>();
    const detailItem = detail.data;
    const [deleteItem, setDeleteItem] = useState<Investigation | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<FormState>(emptyForm());

    const set = (k: keyof FormState, v: string) =>
        setForm((f) => ({ ...f, [k]: v }));

    const handleSearch = useCallback(
        (val: string) => {
            setSearchValue(val);
            search({ inv_name: val || undefined });
        },
        [search],
    );

    const applyFilter = useCallback(
        (type: string, level: string) => {
            search({
                type: type || undefined,
                level: level || undefined,
            });
        },
        [search],
    );

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (row: Investigation) => {
        setEditingId(row.id);
        setFormError('');
        setForm(rowToForm(row));
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                type: form.type || null,
                level: form.level || null,
                is_fire_fighting: Number(form.is_fire_fighting),
                is_emergency: Number(form.is_emergency),
                inv_time: form.inv_time || null,
                inv_name: form.inv_name || null,
                content: form.content || null,
                legalbasis: form.legalbasis || null,
                proposal: form.proposal || null,
                correct_date: form.correct_date || null,
                correct_result: form.correct_result || null,
                is_govern: Number(form.is_govern),
                govern_title: form.govern_title || null,
                govern_user: form.govern_user || null,
                govern_date: form.govern_date || null,
                govern_money: form.govern_money || null,
                govern_supplies: form.govern_supplies || null,
                govern_text: form.govern_text || null,
                review_user: form.review_user || null,
                review_date: form.review_date || null,
                review_discription: form.review_discription || null,
                review_content: form.review_content || null,
                monthlyInvestigationReviews:
                    form.monthlyInvestigationReviews.filter((r) => r.annex_url),
                monthlyInvestigationViews:
                    form.monthlyInvestigationViews.filter((r) => r.annex_url),
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
            const e = err as { response?: { data?: { message?: string } } };
            setFormError(e?.response?.data?.message ?? '操作失败，请重试');
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

    const columns: ColumnDef<Investigation>[] = [
        {
            accessorKey: 'inv_time',
            header: '排查时间',
            size: 110,
            cell: ({ row }) => {
                const d = row.original.inv_time;

                return d ? (
                    <span className="text-xs text-slate-400">{d}</span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        {
            accessorKey: 'type',
            header: '隐患类型',
            size: 110,
            cell: ({ row }) =>
                row.original.type ? (
                    <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-[10px] text-blue-400">
                        {row.original.type}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'level',
            header: '等级',
            size: 90,
            cell: ({ row }) => {
                const lvl = row.original.level;

                if (!lvl) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span
                        className={cn(
                            'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                            LEVEL_CLS[lvl] ??
                                'border-slate-700/40 bg-slate-700/20 text-slate-500',
                        )}
                    >
                        {lvl}
                    </span>
                );
            },
        },
        {
            accessorKey: 'inv_name',
            header: '排查人',
            size: 100,
            cell: ({ row }) =>
                row.original.inv_name ? (
                    <span className="text-slate-300">
                        {row.original.inv_name}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'content',
            header: '隐患描述',
            cell: ({ row }) => {
                const c = row.original.content;

                if (!c) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span
                        className="line-clamp-2 text-xs text-slate-400"
                        title={c}
                    >
                        {c}
                    </span>
                );
            },
        },
        {
            accessorKey: 'correct_result',
            header: '整改结果',
            size: 90,
            cell: ({ row }) => {
                const r = row.original.correct_result;

                if (!r) {
                    return <span className="text-slate-700">—</span>;
                }

                const cls =
                    r === '已整改'
                        ? 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400'
                        : r === '部分整改'
                          ? 'border-amber-500/30 bg-amber-600/10 text-amber-400'
                          : r === '整改不到位'
                            ? 'border-orange-500/30 bg-orange-600/10 text-orange-400'
                            : 'border-slate-600/40 bg-slate-700/20 text-slate-500';

                return (
                    <span
                        className={cn(
                            'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                            cls,
                        )}
                    >
                        {r}
                    </span>
                );
            },
        },
    ];

    columns.push({
        id: 'actions',
        header: '操作',
        size: 160,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-0.5">
                    <DetailButton
                        row={row.original}
                        onOpen={detail.openDetail}
                    />
                    {row.original.company_id === companyId && canUpdate && (
                        <button
                            onClick={() => openEdit(row.original)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {row.original.company_id === companyId && canDelete && (
                        <button
                            onClick={() => setDeleteItem(row.original)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            );
        },
    });

    const toolbar = (
        <div className="flex items-center gap-2">
            <FilterSelect
                value={filterType}
                onChange={(v) => {
                    setFilterType(v);
                    applyFilter(v, filterLevel);
                }}
                options={TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
                placeholder="全部隐患类型"
            />
            <FilterSelect
                value={filterLevel}
                onChange={(v) => {
                    setFilterLevel(v);
                    applyFilter(filterType, v);
                }}
                options={LEVEL_OPTIONS.map((l) => ({ value: l, label: l }))}
                placeholder="全部等级"
            />
        </div>
    );

    const detailData = detailItem
        ? {
              ...detailItem,
              is_fire_fighting: detailItem.is_fire_fighting ? '是' : '否',
              is_emergency: detailItem.is_emergency ? '是' : '否',
              is_govern: detailItem.is_govern ? '是' : '否',
              monthly_investigation_reviews:
                  detailItem.monthlyInvestigationReviews ??
                  detailItem.monthly_investigation_reviews ??
                  [],
              monthly_investigation_views:
                  detailItem.monthlyInvestigationViews ??
                  detailItem.monthly_investigation_views ??
                  [],
          }
        : null;

    return (
        <>
            <Head title="隐患管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        隐患管理
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
                        新增隐患
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索排查人..."
                searchValue={searchValue}
                onSearchChange={handleSearch}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
                toolbar={toolbar}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="隐患详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                hiddenKeys={[
                    'govern_title',
                    'govern_supplies',
                    'govern_user',
                    'govern_date',
                    'govern_text',
                    'govern_money',
                    'monthlyInvestigationViews',
                    'monthlyInvestigationReviews',
                ]}
                labels={{
                    type: '隐患类型',
                    level: '隐患等级',
                    is_fire_fighting: '消防排查',
                    is_emergency: '应急排查',
                    inv_time: '排查时间',
                    inv_name: '排查人',
                    content: '隐患描述',
                    legalbasis: '法律依据',
                    proposal: '整改建议',
                    correct_date: '整改日期',
                    correct_result: '整改结果',
                    is_govern: '是否治理项目',
                    govern_title: '治理项目',
                    govern_user: '治理责任人',
                    govern_date: '治理日期',
                    govern_money: '治理费用(万元)',
                    govern_supplies: '治理材料',
                    govern_text: '治理内容',
                    review_user: '复查人',
                    review_date: '复查日期',
                    review_discription: '复查说明',
                    review_content: '复查结果描述',
                    monthly_investigation_views: '隐患证据(图片)',
                    monthly_investigation_reviews: '复查附件',
                    monthlyInvestigationViews: '隐患证据(图片)',
                    monthlyInvestigationReviews: '复查附件',
                    annex_url: '附件',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑隐患记录' : '新增隐患记录'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            月度排查隐患信息登记
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
                    <div className="space-y-6">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}

                        {/* ── 基本信息 ── */}
                        <section>
                            <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                基本信息
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        隐患类型
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            set('type', e.target.value)
                                        }
                                        className={selectCls}
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0d1530]"
                                        >
                                            请选择
                                        </option>
                                        {TYPE_OPTIONS.map((t) => (
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
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        隐患等级
                                    </label>
                                    <select
                                        value={form.level}
                                        onChange={(e) =>
                                            set('level', e.target.value)
                                        }
                                        className={selectCls}
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0d1530]"
                                        >
                                            请选择
                                        </option>
                                        {LEVEL_OPTIONS.map((l) => (
                                            <option
                                                key={l}
                                                value={l}
                                                className="bg-[#0d1530]"
                                            >
                                                {l}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        排查时间
                                    </label>
                                    <DatePicker
                                        value={form.inv_time}
                                        onChange={(v) => set('inv_time', v)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        排查人
                                    </label>
                                    <input
                                        type="text"
                                        value={form.inv_name}
                                        onChange={(e) =>
                                            set('inv_name', e.target.value)
                                        }
                                        placeholder="排查人姓名"
                                        className={inputCls}
                                    />
                                </div>
                                <div className="flex items-center gap-6 pt-1">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.is_fire_fighting === '1'
                                            }
                                            onChange={(e) =>
                                                set(
                                                    'is_fire_fighting',
                                                    e.target.checked
                                                        ? '1'
                                                        : '0',
                                                )
                                            }
                                            className="h-4 w-4 rounded border-blue-900/40 accent-blue-500"
                                        />
                                        <span className="text-xs text-slate-400">
                                            消防排查
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_emergency === '1'}
                                            onChange={(e) =>
                                                set(
                                                    'is_emergency',
                                                    e.target.checked
                                                        ? '1'
                                                        : '0',
                                                )
                                            }
                                            className="h-4 w-4 rounded border-blue-900/40 accent-blue-500"
                                        />
                                        <span className="text-xs text-slate-400">
                                            应急排查
                                        </span>
                                    </label>
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        隐患描述
                                    </label>
                                    <textarea
                                        value={form.content}
                                        onChange={(e) =>
                                            set('content', e.target.value)
                                        }
                                        rows={3}
                                        placeholder="详细描述隐患情况"
                                        className={cn(inputCls, 'resize-none')}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        法律依据
                                    </label>
                                    <textarea
                                        value={form.legalbasis}
                                        onChange={(e) =>
                                            set('legalbasis', e.target.value)
                                        }
                                        rows={2}
                                        placeholder="相关法规/标准依据"
                                        className={cn(inputCls, 'resize-none')}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        整改建议
                                    </label>
                                    <textarea
                                        value={form.proposal}
                                        onChange={(e) =>
                                            set('proposal', e.target.value)
                                        }
                                        rows={2}
                                        placeholder="建议整改措施"
                                        className={cn(inputCls, 'resize-none')}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── 整改与治理 ── */}
                        <section>
                            <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                整改与治理
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        整改日期
                                    </label>
                                    <DatePicker
                                        value={form.correct_date}
                                        onChange={(v) => set('correct_date', v)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        整改结果
                                    </label>
                                    <select
                                        value={form.correct_result}
                                        onChange={(e) =>
                                            set(
                                                'correct_result',
                                                e.target.value,
                                            )
                                        }
                                        className={selectCls}
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0d1530]"
                                        >
                                            请选择
                                        </option>
                                        {CORRECT_RESULT_OPTIONS.map((r) => (
                                            <option
                                                key={r}
                                                value={r}
                                                className="bg-[#0d1530]"
                                            >
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 pt-1">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_govern === '1'}
                                            onChange={(e) =>
                                                set(
                                                    'is_govern',
                                                    e.target.checked
                                                        ? '1'
                                                        : '0',
                                                )
                                            }
                                            className="h-4 w-4 rounded border-blue-900/40 accent-blue-500"
                                        />
                                        <span className="text-xs text-slate-400">
                                            已治理
                                        </span>
                                    </label>
                                </div>
                                {form.is_govern === '1' && (
                                    <>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                治理项目
                                            </label>
                                            <input
                                                type="text"
                                                value={form.govern_title}
                                                onChange={(e) =>
                                                    set(
                                                        'govern_title',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="治理项目名称"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                治理责任人
                                            </label>
                                            <input
                                                type="text"
                                                value={form.govern_user}
                                                onChange={(e) =>
                                                    set(
                                                        'govern_user',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="治理负责人"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                治理日期
                                            </label>
                                            <input
                                                type="text"
                                                value={form.govern_date}
                                                onChange={(e) =>
                                                    set(
                                                        'govern_date',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="治理完成日期"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                治理费用（万元）
                                            </label>
                                            <input
                                                type="text"
                                                value={form.govern_money}
                                                onChange={(e) =>
                                                    set(
                                                        'govern_money',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="费用金额"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                治理材料
                                            </label>
                                            <input
                                                type="text"
                                                value={form.govern_supplies}
                                                onChange={(e) =>
                                                    set(
                                                        'govern_supplies',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="使用材料"
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                治理内容
                                            </label>
                                            <input
                                                type="text"
                                                value={form.govern_text}
                                                onChange={(e) =>
                                                    set(
                                                        'govern_text',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="具体治理内容"
                                                className={inputCls}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* ── 复查信息 ── */}
                        <section>
                            <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                复查信息
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        复查人
                                    </label>
                                    <input
                                        type="text"
                                        value={form.review_user}
                                        onChange={(e) =>
                                            set('review_user', e.target.value)
                                        }
                                        placeholder="复查人姓名"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        复查日期
                                    </label>
                                    <DatePicker
                                        value={form.review_date}
                                        onChange={(v) => set('review_date', v)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        复查说明
                                    </label>
                                    <textarea
                                        value={form.review_discription}
                                        onChange={(e) =>
                                            set(
                                                'review_discription',
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        placeholder="复查情况说明"
                                        className={cn(inputCls, 'resize-none')}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        复查结果描述
                                    </label>
                                    <textarea
                                        value={form.review_content}
                                        onChange={(e) =>
                                            set(
                                                'review_content',
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        placeholder="复查详细内容"
                                        className={cn(inputCls, 'resize-none')}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── 附件 ── */}
                        <section>
                            <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                附件
                            </p>
                            <div className="space-y-4">
                                <AnnexListEditor
                                    value={form.monthlyInvestigationViews}
                                    onChange={(v) =>
                                        setForm((f) => ({
                                            ...f,
                                            monthlyInvestigationViews: v,
                                        }))
                                    }
                                    label="隐患证据(图片)"
                                />
                                <AnnexListEditor
                                    value={form.monthlyInvestigationReviews}
                                    onChange={(v) =>
                                        setForm((f) => ({
                                            ...f,
                                            monthlyInvestigationReviews: v,
                                        }))
                                    }
                                    label="复查附件"
                                />
                            </div>
                        </section>
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
                        删除隐患记录
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除该隐患记录吗？此操作不可撤销。
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
