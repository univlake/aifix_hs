import { Head } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Loader2,
    Eye,
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useApiCrud } from '@/hooks/use-api';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

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
    monthlyInvestigationReviews?: AnnexItem[];
    monthlyInvestigationViews?: AnnexItem[];
    monthly_investigation_reviews?: AnnexItem[];
    monthly_investigation_views?: AnnexItem[];
    company: { id: number; title: string } | null;
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

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

function DetailField({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div>
            <p className="text-xs text-slate-600">{label}</p>
            <p className="mt-0.5 text-sm text-slate-300">
                {value !== null && value !== undefined && value !== ''
                    ? String(value)
                    : '—'}
            </p>
        </div>
    );
}

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

// ── Detail panel ───────────────────────────────────────────────────

function DetailPanel({
    row,
    onClose,
}: {
    row: Investigation;
    onClose: () => void;
}) {
    const reviews =
        row.monthlyInvestigationReviews ??
        row.monthly_investigation_reviews ??
        [];
    const views =
        row.monthlyInvestigationViews ?? row.monthly_investigation_views ?? [];

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-100">
                        隐患详情
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                    {/* 企业 */}
                    <div>
                        <p className="text-xs text-slate-600">企业</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-200">
                            {row.company?.title ?? '—'}
                        </p>
                    </div>

                    {/* 基本信息 */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            基本信息
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailField label="隐患类型" value={row.type} />
                            <DetailField label="隐患等级" value={row.level} />
                            <DetailField
                                label="排查时间"
                                value={row.inv_time}
                            />
                            <DetailField label="排查人" value={row.inv_name} />
                            <div className="col-span-2">
                                <p className="text-xs text-slate-600">
                                    消防/应急
                                </p>
                                <p className="mt-0.5 text-sm text-slate-300">
                                    {[
                                        row.is_fire_fighting
                                            ? '消防排查'
                                            : null,
                                        row.is_emergency ? '应急排查' : null,
                                    ]
                                        .filter(Boolean)
                                        .join('、') || '—'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-slate-600">
                                    隐患描述
                                </p>
                                <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                                    {row.content || '—'}
                                </p>
                            </div>
                            {row.legalbasis && (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-600">
                                        法律依据
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        {row.legalbasis}
                                    </p>
                                </div>
                            )}
                            {row.proposal && (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-600">
                                        整改建议
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        {row.proposal}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 整改信息 */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            整改情况
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailField
                                label="整改日期"
                                value={row.correct_date}
                            />
                            <DetailField
                                label="整改结果"
                                value={row.correct_result}
                            />
                        </div>
                    </div>

                    {/* 复查信息 */}
                    {(row.review_user ||
                        row.review_date ||
                        row.review_content) && (
                        <div>
                            <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                复查信息
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <DetailField
                                    label="复查人"
                                    value={row.review_user}
                                />
                                <DetailField
                                    label="复查日期"
                                    value={row.review_date}
                                />
                                {row.review_discription && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-600">
                                            复查说明
                                        </p>
                                        <p className="mt-0.5 text-sm text-slate-400">
                                            {row.review_discription}
                                        </p>
                                    </div>
                                )}
                                {row.review_content && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-600">
                                            复查结果描述
                                        </p>
                                        <p className="mt-0.5 text-sm text-slate-400">
                                            {row.review_content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 附件 */}
                    {(reviews.length > 0 || views.length > 0) && (
                        <div>
                            <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                附件
                            </p>
                            {views.length > 0 && (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs text-slate-600">
                                        隐患证据(图片)
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {views.map((a, i) => (
                                            <OssDownloadLink
                                                key={a.id ?? i}
                                                url={a.annex_url}
                                                label="查看"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {reviews.length > 0 && (
                                <div>
                                    <p className="mb-1 text-xs text-slate-600">
                                        复查附件
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {reviews.map((a, i) => (
                                            <OssDownloadLink
                                                key={a.id ?? i}
                                                url={a.annex_url}
                                                label="查看"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
    options: string[];
    placeholder: string;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] pr-7 pl-3 text-xs text-slate-400 outline-none"
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
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

// ── Form state ─────────────────────────────────────────────────────

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

export default function BlocMonthlyInvestigationIndex() {
    const { activeCompany, rootCompany } = useScope();
    const companyId = activeCompany?.id;
    const myCompanyId = rootCompany?.id;

    const [rows, setRows] = useState<Investigation[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [detail, setDetail] = useState<Investigation | null>(null);

    const crud = useApiCrud('/monthly-investigations');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteItem, setDeleteItem] = useState<Investigation | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<FormState>(emptyForm());

    const set = (k: keyof FormState, v: string) =>
        setForm((f) => ({ ...f, [k]: v }));

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
            const res = await api.get<
                ApiResponse<PaginatedData<Investigation>>
            >('/bloc-monthly-investigations', {
                params: {
                    company_id: companyId,
                    page: p,
                    per_page: 15,
                    ...(type ? { type } : {}),
                    ...(level ? { level } : {}),
                    ...(year ? { inv_year: year } : {}),
                },
            });
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
        if (!myCompanyId) {
            return;
        }

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
                payload.company_id = myCompanyId;
            }

            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }

            setDialogOpen(false);
            fetchRows(page, filterType, filterLevel, filterYear);
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
        fetchRows(page, filterType, filterLevel, filterYear);
    };

    return (
        <>
            <Head title="隐患管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        隐患管理
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        当前企业及下属企业月度排查隐患汇总 · 共{' '}
                        <span className="font-medium text-slate-400">
                            {total}
                        </span>{' '}
                        条记录
                    </p>
                </div>
                {myCompanyId && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        新增隐患
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <FilterSelect
                    value={filterYear}
                    onChange={(v) => setFilterYear(v)}
                    options={yearOptions}
                    placeholder="全部年份"
                />
                <FilterSelect
                    value={filterType}
                    onChange={(v) => setFilterType(v)}
                    options={TYPE_OPTIONS}
                    placeholder="全部隐患类型"
                />
                <FilterSelect
                    value={filterLevel}
                    onChange={(v) => setFilterLevel(v)}
                    options={LEVEL_OPTIONS}
                    placeholder="全部等级"
                />
            </div>

            {/* Table */}
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
                                                (() => {
                                                    const cls =
                                                        row.correct_result ===
                                                        '已整改'
                                                            ? 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400'
                                                            : row.correct_result ===
                                                                '部分整改'
                                                              ? 'border-amber-500/30 bg-amber-600/10 text-amber-400'
                                                              : row.correct_result ===
                                                                  '整改不到位'
                                                                ? 'border-orange-500/30 bg-orange-600/10 text-orange-400'
                                                                : 'border-slate-600/40 bg-slate-700/20 text-slate-500';

                                                    return (
                                                        <span
                                                            className={cn(
                                                                'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                                                                cls,
                                                            )}
                                                        >
                                                            {row.correct_result}
                                                        </span>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-slate-700">
                                                    —
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
                                                {isMine && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openEdit(row)
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                                                            title="编辑"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
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

            {/* Pagination */}
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

            {/* Detail slide-over */}
            {detail && (
                <DetailPanel row={detail} onClose={() => setDetail(null)} />
            )}

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
                                    <input
                                        type="date"
                                        value={form.inv_time}
                                        onChange={(e) =>
                                            set('inv_time', e.target.value)
                                        }
                                        className={cn(
                                            inputCls,
                                            'cursor-pointer',
                                        )}
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

                        <section>
                            <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                整改与治理
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        整改日期
                                    </label>
                                    <input
                                        type="date"
                                        value={form.correct_date}
                                        onChange={(e) =>
                                            set('correct_date', e.target.value)
                                        }
                                        className={cn(
                                            inputCls,
                                            'cursor-pointer',
                                        )}
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
                                    <input
                                        type="date"
                                        value={form.review_date}
                                        onChange={(e) =>
                                            set('review_date', e.target.value)
                                        }
                                        className={cn(
                                            inputCls,
                                            'cursor-pointer',
                                        )}
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
