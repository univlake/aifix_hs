import { Head } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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

// ── Types ─────────────────────────────────────────────────────────

interface Constitute {
    name: string;
    hazardous_chemical_id: string;
    number: string;
}

interface Chemical {
    id: number;
    name: string;
}

interface MajorHazard {
    id: number;
    name: string;
    level: string | null;
    position: string | null;
    r_value: string | null;
    is_sis: number;
    sil_level: string | null;
    detect_parameter: string | null;
    major_constitutes?: Constitute[];
}

// ── Constants ─────────────────────────────────────────────────────

const LEVEL_OPTIONS = ['一级', '二级', '三级', '四级'];
const SIL_OPTIONS = ['SIL 1', 'SIL 2', 'SIL 3', 'SIL 4'];
const DETECT_PARAMS = ['液位', '温度', '压力', '气体泄漏'];

const levelColor: Record<string, string> = {
    一级: 'border-red-500/25 bg-red-600/10 text-red-400',
    二级: 'border-amber-500/25 bg-amber-600/10 text-amber-400',
    三级: 'border-yellow-500/25 bg-yellow-600/10 text-yellow-400',
    四级: 'border-blue-500/25 bg-blue-600/10 text-blue-400',
};

// ── Helpers ───────────────────────────────────────────────────────

function emptyHazard(): Partial<MajorHazard> {
    return {
        name: '',
        level: '',
        position: '',
        r_value: '',
        is_sis: 0,
        sil_level: '',
        detect_parameter: '',
    };
}

function emptyConstitute(): Constitute {
    return { name: '', hazardous_chemical_id: '', number: '' };
}

// ── Main page ─────────────────────────────────────────────────────

export default function MajorHazardsIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;
    const { canWrite } = usePermission();
    const canCreate = canWrite('major-hazards.create');
    const canUpdate = canWrite('major-hazards.update');
    const canDelete = canWrite('major-hazards.delete');

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
    } = useApiList<MajorHazard>({
        endpoint: '/major-hazards',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/major-hazards');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<MajorHazard>();
    const detailItem = detail.data;

    const detailData = useMemo(() => {
        if (!detailItem) {
            return null;
        }

        return {
            ...(detailItem as unknown as Record<string, unknown>),
            is_sis: detailItem.is_sis ? '是' : '否',
        };
    }, [detailItem]);
    const [deleteItem, setDeleteItem] = useState<MajorHazard | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<Partial<MajorHazard>>(emptyHazard());
    const [constitutes, setConstitutes] = useState<Constitute[]>([]);
    const [chemicals, setChemicals] = useState<Chemical[]>([]);

    const loadChemicals = async () => {
        try {
            const res = await api.get('/hazardous-chemicals', {
                params: {
                    per_page: 200,
                    ...(companyId ? { company_id: companyId } : {}),
                },
            });
            setChemicals(res.data?.data?.data ?? []);
        } catch {
            setChemicals([]);
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyHazard());
        setConstitutes([]);
        loadChemicals();
        setDialogOpen(true);
    };

    const openEdit = (row: MajorHazard) => {
        setEditingId(row.id);
        setFormError('');
        setForm({ ...row });
        setConstitutes(row.major_constitutes?.map((c) => ({ ...c })) ?? []);
        loadChemicals();
        setDialogOpen(true);
    };

    const setField = (key: keyof MajorHazard, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload = {
                ...form,
                company_id: companyId,
                constitutes: constitutes.filter((c) => c.hazardous_chemical_id),
            };

            if (editingId) {
                await crud.update(
                    editingId,
                    payload as Record<string, unknown>,
                );
            } else {
                await crud.create(payload as Record<string, unknown>);
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

    const columns = [
        {
            accessorKey: 'name',
            header: '危险源名称',
            cell: ({ row }: any) => (
                <span className="font-medium text-slate-200">
                    {row.original.name}
                </span>
            ),
        },
        {
            accessorKey: 'level',
            header: '危险等级',
            size: 100,
            cell: ({ row }: any) => {
                const lvl = row.original.level as string | null;

                if (!lvl) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span
                        className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                            levelColor[lvl] ??
                                'border-slate-700/50 bg-slate-700/20 text-slate-500',
                        )}
                    >
                        {lvl}
                    </span>
                );
            },
        },
        {
            accessorKey: 'position',
            header: '所在位置',
            size: 140,
            cell: ({ row }: any) =>
                row.original.position || (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'r_value',
            header: 'R 值',
            size: 90,
            cell: ({ row }: any) =>
                row.original.r_value ? (
                    <span className="font-mono text-xs text-slate-400">
                        {row.original.r_value}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'is_sis',
            header: '安全联锁',
            size: 100,
            cell: ({ row }: any) =>
                row.original.is_sis ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-600/8 px-2 py-0.5 text-xs text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        已配置
                    </span>
                ) : (
                    <span className="text-slate-700">未配置</span>
                ),
        },
        {
            accessorKey: 'sil_level',
            header: 'SIL 等级',
            size: 100,
            cell: ({ row }: any) =>
                row.original.sil_level || (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'detect_parameter',
            header: '检测远传参数',
            cell: ({ row }: any) => {
                const val = row.original.detect_parameter as string | null;

                if (!val) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {val
                            .split(',')
                            .filter(Boolean)
                            .map((p) => (
                                <span
                                    key={p}
                                    className="rounded-md border border-blue-900/40 bg-blue-600/8 px-1.5 py-0.5 text-[10px] text-blue-400"
                                >
                                    {p}
                                </span>
                            ))}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: '操作',
            size: 160,
            cell: ({ row }: any) => (
                <div className="flex items-center gap-0.5">
                    <DetailButton
                        row={row.original}
                        onOpen={detail.openDetail}
                    />
                    {canUpdate && (
                        <ActionBtn
                            variant="edit"
                            title="编辑"
                            onClick={() => openEdit(row.original)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                    {canDelete && (
                        <ActionBtn
                            variant="delete"
                            title="删除"
                            onClick={() => setDeleteItem(row.original)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="重大危险源" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        重大危险源
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
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 hover:text-blue-200 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        新增危险源
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索危险源名称..."
                searchValue={searchValue}
                onSearchChange={(v) => {
                    setSearchValue(v);
                    search({ name: v || undefined });
                }}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="重大危险源详情"
                data={detailData}
                onClose={detail.close}
                labels={{
                    name: '危险源名称',
                    level: '危险等级',
                    position: '所在位置',
                    r_value: 'R值',
                    is_sis: '安全仪表系统 (SIS)',
                    sil_level: 'SIL 等级',
                    detect_parameter: '检测远传参数',
                    major_constitutes: '危险源构成',
                    hazardous_chemical_id: '危险化学品',
                    number: '数量',
                }}
            />

            {/* Form modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} wide>
                <ModalHeader
                    title={`${editingId ? '编辑' : '新增'}重大危险源`}
                    subtitle={
                        editingId
                            ? '修改危险源档案信息'
                            : '填写危险源基本及联锁信息'
                    }
                    onClose={() => setDialogOpen(false)}
                />
                <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
                    {formError && <ErrorBanner message={formError} />}

                    {/* 基本信息 */}
                    <FormSection
                        title="基本信息"
                        icon={<ShieldAlert className="h-3.5 w-3.5" />}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="危险源名称" required>
                                <Input
                                    value={form.name ?? ''}
                                    onChange={(v) => setField('name', v)}
                                    placeholder="危险源名称"
                                />
                            </Field>
                            <Field label="危险等级">
                                <SelectInput
                                    value={form.level ?? ''}
                                    onChange={(v) => setField('level', v)}
                                    options={LEVEL_OPTIONS}
                                    placeholder="请选择等级"
                                />
                            </Field>
                            <Field label="所在位置">
                                <Input
                                    value={form.position ?? ''}
                                    onChange={(v) => setField('position', v)}
                                    placeholder="装置区/罐区/建筑物位置"
                                />
                            </Field>
                            <Field label="R 值">
                                <Input
                                    value={form.r_value ?? ''}
                                    onChange={(v) => setField('r_value', v)}
                                    placeholder="风险评估 R 值"
                                    className="font-mono"
                                />
                            </Field>
                        </div>
                    </FormSection>

                    {/* 安全联锁 */}
                    <FormSection title="安全联锁系统">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="安全仪表系统 (SIS)" colSpan={2}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setField('is_sis', form.is_sis ? 0 : 1)
                                    }
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                                        form.is_sis
                                            ? 'border-emerald-500/25 bg-emerald-600/10 text-emerald-400'
                                            : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-1.5 w-1.5 shrink-0 rounded-full',
                                            form.is_sis
                                                ? 'bg-emerald-400'
                                                : 'bg-slate-700',
                                        )}
                                    />
                                    {form.is_sis
                                        ? '已配置安全仪表系统'
                                        : '未配置安全仪表系统'}
                                </button>
                            </Field>
                            <Field label="SIL 等级">
                                <SelectInput
                                    value={form.sil_level ?? ''}
                                    onChange={(v) => setField('sil_level', v)}
                                    options={SIL_OPTIONS}
                                    placeholder="请选择 SIL 等级"
                                />
                            </Field>
                            <Field label="检测远传参数">
                                <div className="flex flex-wrap gap-2">
                                    {DETECT_PARAMS.map((p) => {
                                        const selected = (
                                            form.detect_parameter ?? ''
                                        )
                                            .split(',')
                                            .filter(Boolean)
                                            .includes(p);
                                        const toggle = () => {
                                            const current = (
                                                form.detect_parameter ?? ''
                                            )
                                                .split(',')
                                                .filter(Boolean);
                                            const next = selected
                                                ? current.filter((x) => x !== p)
                                                : [...current, p];
                                            setField(
                                                'detect_parameter',
                                                next.join(','),
                                            );
                                        };

                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={toggle}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                                                    selected
                                                        ? 'border-blue-500/40 bg-blue-600/15 text-blue-300'
                                                        : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'h-1.5 w-1.5 shrink-0 rounded-full',
                                                        selected
                                                            ? 'bg-blue-400'
                                                            : 'bg-slate-700',
                                                    )}
                                                />
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>
                        </div>
                    </FormSection>

                    {/* 主要构成 */}
                    <FormSection title="主要构成">
                        <div className="space-y-2">
                            {constitutes.map((c, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-[1fr_120px_32px] items-center gap-2"
                                >
                                    <select
                                        value={c.hazardous_chemical_id}
                                        onChange={(e) => {
                                            const n = [...constitutes];
                                            n[idx].hazardous_chemical_id =
                                                e.target.value;
                                            const ch = chemicals.find(
                                                (x) =>
                                                    String(x.id) ===
                                                    e.target.value,
                                            );
                                            n[idx].name = ch?.name ?? '';
                                            setConstitutes(n);
                                        }}
                                        className="w-full cursor-pointer appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 transition-colors outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0d1530]"
                                        >
                                            选择危险化学品
                                        </option>
                                        {chemicals.map((ch) => (
                                            <option
                                                key={ch.id}
                                                value={String(ch.id)}
                                                className="bg-[#0d1530]"
                                            >
                                                {ch.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        value={c.number}
                                        onChange={(v) => {
                                            const n = [...constitutes];
                                            n[idx].number = v;
                                            setConstitutes(n);
                                        }}
                                        placeholder="数量"
                                        className="font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConstitutes(
                                                constitutes.filter(
                                                    (_, i) => i !== idx,
                                                ),
                                            )
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                            {constitutes.length === 0 && (
                                <p className="py-1 text-xs text-slate-700">
                                    暂无构成记录，点击下方添加
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    setConstitutes([
                                        ...constitutes,
                                        emptyConstitute(),
                                    ])
                                }
                                className="mt-1 flex items-center gap-1.5 text-xs text-blue-500 transition-colors hover:text-blue-400"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                添加构成物质
                            </button>
                        </div>
                    </FormSection>
                </div>
                <ModalFooter
                    onCancel={() => setDialogOpen(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                />
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除重大危险源
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {deleteItem?.name}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <CancelBtn onClick={() => setDeleteItem(null)} />
                    <DangerBtn
                        onClick={handleDelete}
                        loading={crud.loading}
                        label="确认删除"
                    />
                </div>
            </Modal>
        </>
    );
}

// ── Shared sub-components ─────────────────────────────────────────

function Modal({
    open,
    onClose,
    children,
    wide = false,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
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
            <div
                className={cn(
                    'relative overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60',
                    wide ? 'w-full max-w-2xl' : 'w-full max-w-lg',
                )}
            >
                {children}
            </div>
        </div>
    );
}

function ModalHeader({
    title,
    subtitle,
    onClose,
}: {
    title: string;
    subtitle: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <div>
                <h2 className="text-base font-semibold text-slate-100">
                    {title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
            </div>
            <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function ModalFooter({
    onCancel,
    onSubmit,
    loading,
}: {
    onCancel: () => void;
    onSubmit: () => void;
    loading: boolean;
}) {
    return (
        <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
            <CancelBtn onClick={onCancel} />
            <button
                onClick={onSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
            >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? '保存中...' : '保存'}
            </button>
        </div>
    );
}

function FormSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                {icon && <span className="text-blue-500">{icon}</span>}
                <h3 className="text-xs font-semibold tracking-widest text-slate-600 uppercase">
                    {title}
                </h3>
                <div className="flex-1 border-t border-blue-900/20" />
            </div>
            {children}
        </div>
    );
}

function Field({
    label,
    required,
    colSpan,
    children,
}: {
    label: string;
    required?: boolean;
    colSpan?: number;
    children: React.ReactNode;
}) {
    return (
        <div
            className={
                colSpan === 2 ? 'col-span-2' : colSpan === 3 ? 'col-span-3' : ''
            }
        >
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-1 text-blue-500">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function Input({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(inputClass, className)}
        />
    );
}

function SelectInput({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, 'cursor-pointer appearance-none')}
        >
            <option value="" disabled className="bg-[#0d1530]">
                {placeholder ?? '请选择'}
            </option>
            {options.map((o) => (
                <option key={o} value={o} className="bg-[#0d1530]">
                    {o}
                </option>
            ))}
        </select>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {message}
        </div>
    );
}

function ActionBtn({
    children,
    onClick,
    variant,
    title,
}: {
    children: React.ReactNode;
    onClick: () => void;
    variant: 'edit' | 'delete';
    title?: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                variant === 'edit'
                    ? 'text-slate-600 hover:bg-blue-600/10 hover:text-blue-400'
                    : 'text-slate-600 hover:bg-red-600/10 hover:text-red-400',
            )}
        >
            {children}
        </button>
    );
}

function CancelBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
        >
            取消
        </button>
    );
}

function DangerBtn({
    onClick,
    loading,
    label,
}: {
    onClick: () => void;
    loading: boolean;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
        >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? '删除中...' : label}
        </button>
    );
}
