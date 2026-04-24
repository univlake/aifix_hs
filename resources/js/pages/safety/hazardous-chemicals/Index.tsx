import { Head } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    FlaskConical,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';

// ── Types ─────────────────────────────────────────────────────────

interface Ingredient {
    name: string;
    content: string;
    cas: string;
}

interface Chemical {
    id: number;
    name: string;
    alias: string | null;
    cas: string | null;
    matter_state: string | null;
    fire_class: string | null;
    position: string | null;
    temperature: string | null;
    storage: string | null;
    year_use: string | null;
    year_use_unit: string | null;
    storage_unit: string | null;
    pressure: string | null;
    pressure_unit: string | null;
    msds: string | null;
    is_supervision: number;
    is_toxin: number;
    is_explosion: number;
    is_easy_explode: number;
    is_narcotics: number;
    is_monitor: number;
    is_mixing: number;
    chemical_ingredients?: Ingredient[];
}

// ── Constants ─────────────────────────────────────────────────────

const FLAG_FIELDS: { key: keyof Chemical; label: string; color: string }[] = [
    { key: 'is_supervision', label: '重点监管', color: 'red' },
    { key: 'is_toxin', label: '毒性物质', color: 'violet' },
    { key: 'is_explosion', label: '爆炸品', color: 'amber' },
    { key: 'is_easy_explode', label: '易燃易爆', color: 'amber' },
    { key: 'is_narcotics', label: '麻醉品', color: 'violet' },
    { key: 'is_monitor', label: '监控化学品', color: 'blue' },
    { key: 'is_mixing', label: '混合物', color: 'cyan' },
];

const MATTER_STATES = ['液态', '固态', '气态', '液化气体', '溶液', '粉末'];
const FIRE_CLASSES = ['甲类', '乙类', '丙类', '丁类', '戊类', '不适用'];
const PRESSURE_UNITS = ['MPa', 'kPa', 'Pa', 'bar', 'atm'];
const YEAR_USE_UNITS = ['吨/年', 'kg/年', 'L/年', 'm³/年'];
const STORAGE_UNITS = ['吨', 'kg', 'L', 'm³'];

const flagColor: Record<string, string> = {
    red: 'border-red-500/25 bg-red-600/10 text-red-400',
    violet: 'border-violet-500/25 bg-violet-600/10 text-violet-400',
    amber: 'border-amber-500/25 bg-amber-600/10 text-amber-400',
    blue: 'border-blue-500/25 bg-blue-600/10 text-blue-400',
    cyan: 'border-cyan-500/25 bg-cyan-600/10 text-cyan-400',
};

// ── Helpers ───────────────────────────────────────────────────────

function FlagBadge({ label, color }: { label: string; color: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                flagColor[color],
            )}
        >
            {label}
        </span>
    );
}

function emptyChemical(): Partial<Chemical> {
    return {
        name: '',
        alias: '',
        cas: '',
        matter_state: '',
        fire_class: '',
        position: '',
        temperature: '',
        storage: '',
        year_use: '',
        year_use_unit: '',
        storage_unit: '',
        pressure: '',
        pressure_unit: '',
        msds: '',
        is_supervision: 0,
        is_toxin: 0,
        is_explosion: 0,
        is_easy_explode: 0,
        is_narcotics: 0,
        is_monitor: 0,
        is_mixing: 0,
    };
}

function emptyIngredient(): Ingredient {
    return { name: '', content: '', cas: '' };
}

// ── Main page ─────────────────────────────────────────────────────

export default function HazardousChemicalsIndex() {
    const { activeCompany } = useScope();
    const { canWrite } = usePermission();
    const canCreate = canWrite('hazardous-chemicals.create');
    const canUpdate = canWrite('hazardous-chemicals.update');
    const canDelete = canWrite('hazardous-chemicals.delete');
    const companyId = activeCompany?.id;

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
    } = useApiList<Chemical>({
        endpoint: '/hazardous-chemicals',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/hazardous-chemicals');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<Chemical>();
    const detailItem = detail.data;

    // Derive drawer data: merge value+unit pairs, flip 0/1 flags to 是/否.
    const detailData = useMemo(() => {
        if (!detailItem) {
            return null;
        }

        const join = (v: unknown, unit: unknown) => {
            const val = v != null && v !== '' ? String(v) : '';
            const u = unit != null && unit !== '' ? String(unit) : '';

            return val ? (u ? `${val} ${u}` : val) : null;
        };

        const d: Record<string, unknown> = {
            ...(detailItem as unknown as Record<string, unknown>),
            year_use: join(detailItem.year_use, detailItem.year_use_unit),
            storage: join(detailItem.storage, detailItem.storage_unit),
            pressure: join(detailItem.pressure, detailItem.pressure_unit),
        };

        for (const f of FLAG_FIELDS) {
            d[f.key] = detailItem[f.key] ? '是' : '否';
        }

        delete d.year_use_unit;
        delete d.storage_unit;
        delete d.pressure_unit;

        return d;
    }, [detailItem]);

    const detailHiddenKeys = detailItem?.is_mixing
        ? []
        : ['chemical_ingredients'];
    const [deleteItem, setDeleteItem] = useState<Chemical | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<Partial<Chemical>>(emptyChemical());
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyChemical());
        setIngredients([]);
        setDialogOpen(true);
    };

    const openEdit = (row: Chemical) => {
        setEditingId(row.id);
        setFormError('');
        setForm({ ...row });
        setIngredients(row.chemical_ingredients?.map((i) => ({ ...i })) ?? []);
        setDialogOpen(true);
    };

    const setField = (key: keyof Chemical, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload = {
                ...form,
                company_id: companyId,
                ingredients: ingredients.filter((i) => i.name.trim()),
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

    // Table columns
    const columns = [
        {
            accessorKey: 'name',
            header: '化学品名称',
            cell: ({ row }: any) => (
                <div>
                    <p className="font-medium text-slate-200">
                        {row.original.name}
                    </p>
                    {row.original.alias && (
                        <p className="text-xs text-slate-600">
                            {row.original.alias}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'cas',
            header: 'CAS 号',
            size: 130,
            cell: ({ row }: any) =>
                row.original.cas ? (
                    <span className="font-mono text-xs text-slate-400">
                        {row.original.cas}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'matter_state',
            header: '物质状态',
            size: 90,
            cell: ({ row }: any) =>
                row.original.matter_state ? (
                    <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-xs text-blue-400">
                        {row.original.matter_state}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'position',
            header: '存储位置',
            size: 130,
            cell: ({ row }: any) =>
                row.original.position || (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'year_use',
            header: '年使用量',
            size: 110,
            cell: ({ row }: any) => {
                const { year_use, year_use_unit } = row.original;

                if (!year_use) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span className="text-slate-300">
                        {year_use}
                        {year_use_unit ? ` ${year_use_unit}` : ''}
                    </span>
                );
            },
        },
        {
            id: 'flags',
            header: '监管属性',
            cell: ({ row }: any) => {
                const active = FLAG_FIELDS.filter((f) => row.original[f.key]);

                if (!active.length) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {active.map((f) => (
                            <FlagBadge
                                key={f.key}
                                label={f.label}
                                color={f.color}
                            />
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
            <Head title="危险化学品" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        危险化学品
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
                        新增危险化学品
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索化学品名称..."
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
                title="危险化学品详情"
                data={detailData}
                onClose={detail.close}
                hiddenKeys={detailHiddenKeys}
                labels={{
                    name: '化学品名称',
                    alias: '别名',
                    cas: 'CAS号',
                    matter_state: '物质状态',
                    fire_class: '火灾危险性类别',
                    position: '存储位置',
                    temperature: '操作温度',
                    storage: '最大存储量',
                    year_use: '年使用量',
                    pressure: '操作压力',
                    msds: 'MSDS附件',
                    is_supervision: '重点监管',
                    is_toxin: '毒性物质',
                    is_explosion: '爆炸品',
                    is_easy_explode: '易燃易爆',
                    is_narcotics: '麻醉品',
                    is_monitor: '监控化学品',
                    is_mixing: '混合物',
                    chemical_ingredients: '化学成分',
                    name_ingredient: '成分名称',
                    content: '含量',
                }}
            />

            {/* Form modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} wide>
                <ModalHeader
                    title={`${editingId ? '编辑' : '新增'}危险化学品`}
                    subtitle={
                        editingId
                            ? '修改化学品档案信息'
                            : '填写化学品基本及储存信息'
                    }
                    onClose={() => setDialogOpen(false)}
                />
                <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
                    {formError && <ErrorBanner message={formError} />}

                    {/* 基本信息 */}
                    <FormSection
                        title="基本信息"
                        icon={<FlaskConical className="h-3.5 w-3.5" />}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="化学品名称" required>
                                <Input
                                    value={form.name ?? ''}
                                    onChange={(v) => setField('name', v)}
                                    placeholder="中文名称"
                                />
                            </Field>
                            <Field label="别名">
                                <Input
                                    value={form.alias ?? ''}
                                    onChange={(v) => setField('alias', v)}
                                    placeholder="别名/商品名"
                                />
                            </Field>
                            <Field label="CAS 号">
                                <Input
                                    value={form.cas ?? ''}
                                    onChange={(v) => setField('cas', v)}
                                    placeholder="如 74-82-8"
                                    className="font-mono"
                                />
                            </Field>
                            <Field label="物质状态">
                                <SelectInput
                                    value={form.matter_state ?? ''}
                                    onChange={(v) =>
                                        setField('matter_state', v)
                                    }
                                    options={MATTER_STATES}
                                    placeholder="请选择"
                                />
                            </Field>
                            <Field label="火灾危险性类别">
                                <SelectInput
                                    value={form.fire_class ?? ''}
                                    onChange={(v) => setField('fire_class', v)}
                                    options={FIRE_CLASSES}
                                    placeholder="请选择"
                                />
                            </Field>
                            <Field label="存储位置">
                                <Input
                                    value={form.position ?? ''}
                                    onChange={(v) => setField('position', v)}
                                    placeholder="存储地点/罐区/仓库编号"
                                />
                            </Field>
                            <Field label="MSDS 附件" colSpan={2}>
                                <OssUploadField
                                    value={form.msds ?? ''}
                                    onChange={(v) => setField('msds', v)}
                                    dir="hazardous-chemicals/msds"
                                    accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
                                />
                            </Field>
                        </div>
                    </FormSection>

                    {/* 储存信息 */}
                    <FormSection title="储存与使用">
                        <div className="grid grid-cols-3 gap-4">
                            <Field label="年使用量">
                                <Input
                                    value={form.year_use ?? ''}
                                    onChange={(v) => setField('year_use', v)}
                                    placeholder="数值"
                                />
                            </Field>
                            <Field label="年使用量单位">
                                <SelectInput
                                    value={form.year_use_unit ?? ''}
                                    onChange={(v) =>
                                        setField('year_use_unit', v)
                                    }
                                    options={YEAR_USE_UNITS}
                                    placeholder="单位"
                                />
                            </Field>
                            <div />
                            <Field label="最大存储量">
                                <Input
                                    value={form.storage ?? ''}
                                    onChange={(v) => setField('storage', v)}
                                    placeholder="数值"
                                />
                            </Field>
                            <Field label="最大存储量单位">
                                <SelectInput
                                    value={form.storage_unit ?? ''}
                                    onChange={(v) =>
                                        setField('storage_unit', v)
                                    }
                                    options={STORAGE_UNITS}
                                    placeholder="单位"
                                />
                            </Field>
                            <div />
                            <Field label="操作温度">
                                <Input
                                    value={form.temperature ?? ''}
                                    onChange={(v) => setField('temperature', v)}
                                    placeholder="如 25°C"
                                />
                            </Field>
                            <Field label="操作压力">
                                <Input
                                    value={form.pressure ?? ''}
                                    onChange={(v) => setField('pressure', v)}
                                    placeholder="数值"
                                />
                            </Field>
                            <Field label="压力单位">
                                <SelectInput
                                    value={form.pressure_unit ?? ''}
                                    onChange={(v) =>
                                        setField('pressure_unit', v)
                                    }
                                    options={PRESSURE_UNITS}
                                    placeholder="单位"
                                />
                            </Field>
                        </div>
                    </FormSection>

                    {/* 监管属性 */}
                    <FormSection title="监管属性">
                        <div className="grid grid-cols-4 gap-2">
                            {FLAG_FIELDS.map((f) => {
                                const active = !!(form[f.key] as number);

                                return (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() =>
                                            setField(f.key, active ? 0 : 1)
                                        }
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                                            active
                                                ? flagColor[f.color] +
                                                      ' border-opacity-100'
                                                : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                                active
                                                    ? 'bg-current'
                                                    : 'bg-slate-700',
                                            )}
                                        />
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                    </FormSection>

                    {/* 主要成分 — only shown for mixtures */}
                    {!!form.is_mixing && (
                        <FormSection title="主要成分">
                            <div className="space-y-2">
                                {ingredients.map((ing, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-[1fr_100px_120px_32px] items-center gap-2"
                                    >
                                        <Input
                                            value={ing.name}
                                            onChange={(v) => {
                                                const n = [...ingredients];
                                                n[idx].name = v;
                                                setIngredients(n);
                                            }}
                                            placeholder="成分名称"
                                        />
                                        <Input
                                            value={ing.content}
                                            onChange={(v) => {
                                                const n = [...ingredients];
                                                n[idx].content = v;
                                                setIngredients(n);
                                            }}
                                            placeholder="含量 %"
                                        />
                                        <Input
                                            value={ing.cas}
                                            onChange={(v) => {
                                                const n = [...ingredients];
                                                n[idx].cas = v;
                                                setIngredients(n);
                                            }}
                                            placeholder="CAS 号"
                                            className="font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIngredients(
                                                    ingredients.filter(
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
                                {ingredients.length === 0 && (
                                    <p className="py-1 text-xs text-slate-700">
                                        暂无成分记录，点击下方添加
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIngredients([
                                            ...ingredients,
                                            emptyIngredient(),
                                        ])
                                    }
                                    className="mt-1 flex items-center gap-1.5 text-xs text-blue-500 transition-colors hover:text-blue-400"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    添加成分
                                </button>
                            </div>
                        </FormSection>
                    )}
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
                        删除危险化学品
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
