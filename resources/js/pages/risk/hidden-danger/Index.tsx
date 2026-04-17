import { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { DataTable } from '@/components/data-table/DataTable';
import { useScope } from '@/contexts/ScopeContext';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface HiddenDanger {
    id: number;
    area: string;
    description: string | null;
    hidden_type: string | null;
    hidden_level: string | null;
    legalises: string | null;
    proposal: string | null;
    correct_deadline: string | null;
    correct_status: number;
    correct_date: string | null;
    invest_status: number;
    session: string | null;
    comment: string | null;
}

// ── Constants ──────────────────────────────────────────────────────

const HIDDEN_TYPES = ['安全管理类', '设备设施类', '作业行为类', '消防类', '应急类', '其他'];
const HIDDEN_LEVELS = ['一般隐患', '重大隐患'];

const CORRECT_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: '待整改', cls: 'border-amber-500/30 bg-amber-600/10 text-amber-400' },
    2: { label: '整改中', cls: 'border-blue-500/30 bg-blue-600/10 text-blue-400' },
    3: { label: '已整改', cls: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400' },
};

const INVEST_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: '待审核', cls: 'border-slate-600/40 bg-slate-700/20 text-slate-500' },
    2: { label: '已通过', cls: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400' },
    3: { label: '未通过', cls: 'border-red-500/30 bg-red-600/10 text-red-400' },
};

const LEVEL_CLS: Record<string, string> = {
    '一般隐患': 'border-blue-500/30 bg-blue-600/10 text-blue-400',
    '重大隐患': 'border-red-500/30 bg-red-600/10 text-red-400',
};

// ── Helpers ────────────────────────────────────────────────────────

function isOverdue(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date(new Date().toDateString());
}

function daysUntil(deadline: string | null): number | null {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

// ── Shared styles ──────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

// ── Modal ──────────────────────────────────────────────────────────

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

// ── Filter bar ─────────────────────────────────────────────────────

function FilterSelect({
    value, onChange, options, placeholder,
}: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; placeholder: string;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] pl-3 pr-7 text-xs text-slate-400 outline-none transition-colors focus:border-blue-500/40 focus:text-slate-200 [&:not([value=''])]:text-slate-200"
            >
                <option value="">{placeholder}</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600" />
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────

export default function HiddenDangerIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;

    const [filterLevel, setFilterLevel]   = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType]     = useState('');

    const extraParams = {
        ...(companyId ? { company_id: companyId } : {}),
        ...(filterLevel  ? { hidden_level: filterLevel }   : {}),
        ...(filterStatus ? { correct_status: filterStatus } : {}),
        ...(filterType   ? { hidden_type: filterType }     : {}),
    };

    const { data, loading, total, current_page, last_page, per_page, reload, goToPage, search } =
        useApiList<HiddenDanger>({
            endpoint: '/hidden-danger-infos',
            defaultParams: extraParams,
        });
    const crud = useApiCrud('/hidden-danger-infos');

    const [searchValue, setSearchValue]   = useState('');
    const [dialogOpen, setDialogOpen]     = useState(false);
    const [editingId, setEditingId]       = useState<number | null>(null);
    const [deleteItem, setDeleteItem]     = useState<HiddenDanger | null>(null);
    const [formLoading, setFormLoading]   = useState(false);
    const [formError, setFormError]       = useState('');

    const emptyForm = () => ({
        area: '', description: '', hidden_type: '', hidden_level: '',
        legalises: '', proposal: '', correct_deadline: '',
        correct_status: '1', invest_status: '1',
        correct_date: '', session: '', comment: '',
    });
    const [form, setForm] = useState<Record<string, string>>(emptyForm());
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const handleSearch = useCallback((val: string) => {
        setSearchValue(val);
        search({ area: val || undefined });
    }, [search]);

    const applyFilter = useCallback((level: string, status: string, type: string) => {
        search({
            hidden_level:   level  || undefined,
            correct_status: status || undefined,
            hidden_type:    type   || undefined,
        });
    }, [search]);

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (row: HiddenDanger) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            area: row.area ?? '',
            description: row.description ?? '',
            hidden_type: row.hidden_type ?? '',
            hidden_level: row.hidden_level ?? '',
            legalises: row.legalises ?? '',
            proposal: row.proposal ?? '',
            correct_deadline: row.correct_deadline ?? '',
            correct_status: String(row.correct_status ?? 1),
            invest_status: String(row.invest_status ?? 1),
            correct_date: row.correct_date ?? '',
            session: row.session ?? '',
            comment: row.comment ?? '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');
        try {
            const payload: Record<string, unknown> = {
                area: form.area || null,
                description: form.description || null,
                hidden_type: form.hidden_type || null,
                hidden_level: form.hidden_level || null,
                legalises: form.legalises || null,
                proposal: form.proposal || null,
                correct_deadline: form.correct_deadline || null,
                correct_status: Number(form.correct_status),
                invest_status: Number(form.invest_status),
                correct_date: form.correct_date || null,
                session: form.session || null,
                comment: form.comment || null,
            };
            if (!editingId) payload.company_id = companyId;
            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }
            setDialogOpen(false);
            reload();
        } catch (err: any) {
            setFormError(err.response?.data?.message ?? '操作失败，请重试');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        await crud.remove(deleteItem.id);
        setDeleteItem(null);
        reload();
    };

    // ── Table columns ─────────────────────────────────────────────

    const columns: ColumnDef<HiddenDanger>[] = [
        {
            accessorKey: 'area',
            header: '场所/区域',
            cell: ({ row }) => <span className="font-medium text-slate-200">{row.original.area}</span>,
        },
        {
            accessorKey: 'description',
            header: '隐患描述',
            cell: ({ row }) => {
                const d = row.original.description;
                if (!d) return <span className="text-slate-700">—</span>;
                return <span className="text-slate-400 line-clamp-2 text-xs">{d}</span>;
            },
        },
        {
            accessorKey: 'hidden_type',
            header: '隐患类别',
            size: 110,
            cell: ({ row }) => row.original.hidden_type
                ? <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-[10px] text-blue-400">{row.original.hidden_type}</span>
                : <span className="text-slate-700">—</span>,
        },
        {
            accessorKey: 'hidden_level',
            header: '等级',
            size: 90,
            cell: ({ row }) => {
                const lvl = row.original.hidden_level;
                if (!lvl) return <span className="text-slate-700">—</span>;
                return <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-medium', LEVEL_CLS[lvl] ?? 'border-slate-700/40 bg-slate-700/20 text-slate-500')}>{lvl}</span>;
            },
        },
        {
            accessorKey: 'correct_deadline',
            header: '整改截止',
            size: 110,
            cell: ({ row }) => {
                const d = row.original.correct_deadline;
                const status = row.original.correct_status;
                if (!d) return <span className="text-slate-700">—</span>;
                const overdue = isOverdue(d) && status !== 3;
                const days = status !== 3 ? daysUntil(d) : null;
                return (
                    <div>
                        <span className={cn('text-xs', overdue ? 'text-red-400 font-medium' : 'text-slate-400')}>{d}</span>
                        {overdue && <p className="text-[10px] text-red-500 mt-0.5">已逾期</p>}
                        {!overdue && days !== null && days <= 7 && days >= 0 && (
                            <p className="text-[10px] text-amber-500 mt-0.5">剩 {days} 天</p>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'correct_status',
            header: '整改状态',
            size: 90,
            cell: ({ row }) => {
                const s = CORRECT_STATUS[row.original.correct_status];
                if (!s) return <span className="text-slate-700">—</span>;
                return <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-medium', s.cls)}>{s.label}</span>;
            },
        },
        {
            accessorKey: 'invest_status',
            header: '审核',
            size: 80,
            cell: ({ row }) => {
                const s = INVEST_STATUS[row.original.invest_status];
                if (!s) return <span className="text-slate-700">—</span>;
                return <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-medium', s.cls)}>{s.label}</span>;
            },
        },
    ];

    if (!readOnly) {
        columns.push({
            id: 'actions',
            header: '操作',
            size: 88,
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    <button onClick={() => openEdit(row.original)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteItem(row.original)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
        });
    }

    // ── Toolbar with filters ──────────────────────────────────────

    const toolbar = (
        <div className="flex items-center gap-2">
            <FilterSelect
                value={filterLevel}
                onChange={(v) => { setFilterLevel(v); applyFilter(v, filterStatus, filterType); }}
                options={HIDDEN_LEVELS.map((l) => ({ value: l, label: l }))}
                placeholder="全部等级"
            />
            <FilterSelect
                value={filterStatus}
                onChange={(v) => { setFilterStatus(v); applyFilter(filterLevel, v, filterType); }}
                options={Object.entries(CORRECT_STATUS).map(([k, s]) => ({ value: k, label: s.label }))}
                placeholder="全部状态"
            />
            <FilterSelect
                value={filterType}
                onChange={(v) => { setFilterType(v); applyFilter(filterLevel, filterStatus, v); }}
                options={HIDDEN_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="全部类别"
            />
        </div>
    );

    // ── Render ────────────────────────────────────────────────────

    return (
        <>
            <Head title="隐患排查" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">隐患排查</h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        共 <span className="font-medium text-slate-400">{total}</span> 条记录
                    </p>
                </div>
                {!readOnly && (
                    <button onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95">
                        <Plus className="h-4 w-4" />新增隐患
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索场所/区域..."
                searchValue={searchValue}
                onSearchChange={handleSearch}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
                toolbar={toolbar}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑隐患记录' : '新增隐患记录'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId ? '修改隐患档案信息' : '填写隐患基本信息并保存'}
                        </p>
                    </div>
                    <button onClick={() => setDialogOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-5">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}

                        {/* ── 基本信息 ── */}
                        <div>
                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">基本信息</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                                        场所/区域 <span className="ml-1 text-blue-500">*</span>
                                    </label>
                                    <input type="text" value={form.area} onChange={(e) => set('area', e.target.value)}
                                        placeholder="隐患所在区域或场所" className={inputCls} />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">隐患类别</label>
                                    <select value={form.hidden_type} onChange={(e) => set('hidden_type', e.target.value)} className={selectCls}>
                                        <option value="" className="bg-[#0d1530]">请选择</option>
                                        {HIDDEN_TYPES.map((t) => <option key={t} value={t} className="bg-[#0d1530]">{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">隐患等级</label>
                                    <select value={form.hidden_level} onChange={(e) => set('hidden_level', e.target.value)} className={selectCls}>
                                        <option value="" className="bg-[#0d1530]">请选择</option>
                                        {HIDDEN_LEVELS.map((l) => <option key={l} value={l} className="bg-[#0d1530]">{l}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                                        隐患描述 <span className="ml-1 text-blue-500">*</span>
                                    </label>
                                    <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                                        rows={3} placeholder="详细描述隐患情况" className={cn(inputCls, 'resize-none')} />
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">排查依据</label>
                                    <textarea value={form.legalises} onChange={(e) => set('legalises', e.target.value)}
                                        rows={2} placeholder="相关法规/标准依据" className={cn(inputCls, 'resize-none')} />
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">整改建议</label>
                                    <textarea value={form.proposal} onChange={(e) => set('proposal', e.target.value)}
                                        rows={2} placeholder="建议整改措施" className={cn(inputCls, 'resize-none')} />
                                </div>
                            </div>
                        </div>

                        {/* ── 整改信息 ── */}
                        <div>
                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">整改与审核</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">整改状态</label>
                                    <select value={form.correct_status} onChange={(e) => set('correct_status', e.target.value)} className={selectCls}>
                                        {Object.entries(CORRECT_STATUS).map(([k, s]) => (
                                            <option key={k} value={k} className="bg-[#0d1530]">{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">审核状态</label>
                                    <select value={form.invest_status} onChange={(e) => set('invest_status', e.target.value)} className={selectCls}>
                                        {Object.entries(INVEST_STATUS).map(([k, s]) => (
                                            <option key={k} value={k} className="bg-[#0d1530]">{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">整改截止日期</label>
                                    <input type="date" value={form.correct_deadline} onChange={(e) => set('correct_deadline', e.target.value)}
                                        className={cn(inputCls, 'cursor-pointer')} />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">实际整改日期</label>
                                    <input type="date" value={form.correct_date} onChange={(e) => set('correct_date', e.target.value)}
                                        className={cn(inputCls, 'cursor-pointer')} />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">排查轮次</label>
                                    <input type="text" value={form.session} onChange={(e) => set('session', e.target.value)}
                                        placeholder="如：第一轮" className={inputCls} />
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">备注</label>
                                    <textarea value={form.comment} onChange={(e) => set('comment', e.target.value)}
                                        rows={2} placeholder="其他备注信息" className={cn(inputCls, 'resize-none')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button onClick={() => setDialogOpen(false)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">
                        取消
                    </button>
                    <button onClick={handleSubmit} disabled={formLoading}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:pointer-events-none">
                        {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
                    <h2 className="mb-1 text-base font-semibold text-slate-100">删除隐患记录</h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;<span className="font-medium text-slate-300">{deleteItem?.area}</span>&rdquo; 的隐患记录吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button onClick={() => setDeleteItem(null)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">
                        取消
                    </button>
                    <button onClick={handleDelete} disabled={crud.loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:opacity-50 disabled:pointer-events-none">
                        {crud.loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {crud.loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>
        </>
    );
}
