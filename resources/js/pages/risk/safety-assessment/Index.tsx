import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DatePicker } from '@/components/shared/DatePicker';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface SkillUnitKid {
    id: number;
    qualification_name: string | null;
}
interface SkillUnit {
    id: number;
    name: string;
    kids: SkillUnitKid[];
}

interface AssessDetect {
    id: number;
    name: string;
    assess_detect_type: string | null;
    skill_unit_id: number | null;
    skill_unit_kid_id: number | null;
    valid_period: string | null;
    annex_url: string | null;
    company_id: number;
    skill_unit?: { id: number; name: string } | null;
    skill_unit_kid?: { id: number; qualification_name: string | null } | null;
}

interface FormData {
    name: string;
    assess_detect_type: string;
    skill_unit_id: string;
    skill_unit_kid_id: string;
    valid_period: string;
    annex_url: string;
}

const ASSESS_TYPES = [
    '安全现状评价',
    '安全生产检测检验',
    '防爆电器检测',
    '防雷检测',
];

const EMPTY_FORM: FormData = {
    name: '',
    assess_detect_type: '',
    skill_unit_id: '',
    skill_unit_kid_id: '',
    valid_period: '',
    annex_url: '',
};

// ── Page ──────────────────────────────────────────────────────────

export default function SafetyAssessmentIndex() {
    const { activeCompany } = useScope();
    const { canWrite } = usePermission();
    const canCreate = canWrite('assess-detects.create');
    const canUpdate = canWrite('assess-detects.update');
    const canDelete = canWrite('assess-detects.delete');
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
    } = useApiList<AssessDetect>({
        endpoint: '/assess-detects',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/assess-detects');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<AssessDetect>();
    const detailItem = detail.data;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [searchValue, setSearchValue] = useState('');

    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [skillUnits, setSkillUnits] = useState<SkillUnit[]>([]);

    // Load company-scoped skill units (with kids nested)
    useEffect(() => {
        if (!companyId) {
            return;
        }

        api.get<ApiResponse<{ data: SkillUnit[] }>>('/skill-units', {
            params: { company_id: companyId, per_page: 200 },
        })
            .then((r) => setSkillUnits(r.data.data?.data ?? []))
            .catch(() => {});
    }, [companyId]);

    // Kids available for the currently selected skill unit
    const availableKids =
        skillUnits.find((u) => String(u.id) === form.skill_unit_id)?.kids ?? [];

    const update = (key: keyof FormData, value: string) =>
        setForm((f) => {
            const next = { ...f, [key]: value };

            // Reset kid when institution changes
            if (key === 'skill_unit_id') {
                next.skill_unit_kid_id = '';
            }

            return next;
        });

    const openCreate = () => {
        setFormError('');
        setForm(EMPTY_FORM);
        setEditingId(null);
        setDialogOpen(true);
    };

    const openEdit = (row: AssessDetect) => {
        setFormError('');
        setForm({
            name: row.name ?? '',
            assess_detect_type: row.assess_detect_type ?? '',
            skill_unit_id: row.skill_unit_id ? String(row.skill_unit_id) : '',
            skill_unit_kid_id: row.skill_unit_kid_id
                ? String(row.skill_unit_kid_id)
                : '',
            valid_period: row.valid_period ?? '',
            annex_url: row.annex_url ?? '',
        });
        setEditingId(row.id);
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                name: form.name,
                assess_detect_type: form.assess_detect_type || null,
                skill_unit_id: form.skill_unit_id
                    ? Number(form.skill_unit_id)
                    : null,
                skill_unit_kid_id: form.skill_unit_kid_id
                    ? Number(form.skill_unit_kid_id)
                    : null,
                valid_period: form.valid_period || null,
                annex_url: form.annex_url || null,
                company_id: companyId,
            };

            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }

            setDialogOpen(false);
            reload();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setFormError(e.response?.data?.message ?? '操作失败，请重试');
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
        setDeleteLabel('');
        reload();
    };

    const handleSearch = useCallback(
        (v: string) => {
            setSearchValue(v);
            search({ name: v || undefined });
        },
        [search],
    );

    // ── Table columns ──────────────────────────────────────────────

    const columns: ColumnDef<AssessDetect>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'name', header: '名称' },
        {
            id: 'type',
            header: '评价或监测类型',
            size: 160,
            cell: ({ row }) =>
                row.original.assess_detect_type ? (
                    <span className="text-slate-300">
                        {row.original.assess_detect_type}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'skill_unit',
            header: '评价/检测机构',
            cell: ({ row }) =>
                row.original.skill_unit?.name ? (
                    <span className="text-slate-300">
                        {row.original.skill_unit.name}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'skill_unit_kid',
            header: '资质',
            cell: ({ row }) =>
                row.original.skill_unit_kid?.qualification_name ? (
                    <span className="text-slate-300">
                        {row.original.skill_unit_kid.qualification_name}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'valid_period',
            header: '报告有效期',
            size: 120,
            cell: ({ row }) =>
                row.original.valid_period ? (
                    <span className="text-slate-300">
                        {row.original.valid_period}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
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
                        <ActionBtn
                            onClick={() => openEdit(row.original)}
                            title="编辑"
                            variant="edit"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                    {canDelete && (
                        <ActionBtn
                            onClick={() => {
                                setDeleteId(row.original.id);
                                setDeleteLabel(row.original.name);
                            }}
                            title="删除"
                            variant="delete"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                </div>
            ),
        },
    ];

    const detailData = detailItem
        ? {
              ...detailItem,
              skill_unit: detailItem.skill_unit?.name ?? null,
              skill_unit_kid:
                  detailItem.skill_unit_kid?.qualification_name ?? null,
          }
        : null;

    return (
        <>
            <Head title="安全评价与检测" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        安全评价与检测
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
                    <button onClick={openCreate} className={primaryBtn}>
                        <Plus className="h-4 w-4" />
                        新增记录
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索安全评价记录..."
                searchValue={searchValue}
                onSearchChange={handleSearch}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="安全评价与检测详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    name: '名称',
                    assess_detect_type: '评价或监测类型',
                    skill_unit: '评价/检测机构',
                    skill_unit_kid: '资质',
                    valid_period: '报告有效期',
                    annex_url: '附件',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <ModalHeader
                    title={editingId ? '编辑记录' : '新增记录'}
                    onClose={() => setDialogOpen(false)}
                />
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {formError && <ErrorAlert message={formError} />}

                    <Field label="名称" required>
                        <input
                            className={inputClass}
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="请输入名称"
                        />
                    </Field>

                    <Field label="评价或监测类型">
                        <select
                            className={inputClass}
                            value={form.assess_detect_type}
                            onChange={(e) =>
                                update('assess_detect_type', e.target.value)
                            }
                        >
                            <option value="">请选择类型</option>
                            {ASSESS_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="评价/检测机构">
                        <select
                            className={inputClass}
                            value={form.skill_unit_id}
                            onChange={(e) =>
                                update('skill_unit_id', e.target.value)
                            }
                        >
                            <option value="">请选择机构</option>
                            {skillUnits.map((u) => (
                                <option key={u.id} value={String(u.id)}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="资质证书">
                        <select
                            className={inputClass}
                            value={form.skill_unit_kid_id}
                            onChange={(e) =>
                                update('skill_unit_kid_id', e.target.value)
                            }
                            disabled={
                                !form.skill_unit_id ||
                                availableKids.length === 0
                            }
                        >
                            <option value="">
                                {!form.skill_unit_id
                                    ? '请先选择机构'
                                    : availableKids.length === 0
                                      ? '该机构暂无资质记录'
                                      : '请选择资质证书'}
                            </option>
                            {availableKids.map((k) => (
                                <option key={k.id} value={String(k.id)}>
                                    {k.qualification_name ?? `资质 #${k.id}`}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="报告有效期">
                        <DatePicker
                            value={form.valid_period}
                            onChange={(v) => update('valid_period', v)}
                        />
                    </Field>

                    <Field label="附件">
                        <OssUploadField
                            value={form.annex_url}
                            onChange={(url) => update('annex_url', url)}
                        />
                    </Field>
                </div>
                <ModalFooter
                    onCancel={() => setDialogOpen(false)}
                    onConfirm={handleSubmit}
                    loading={formLoading}
                />
            </Modal>

            {/* Delete confirm */}
            <Modal
                open={!!deleteId}
                onClose={() => {
                    setDeleteId(null);
                    setDeleteLabel('');
                }}
            >
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除记录
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {deleteLabel}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => {
                            setDeleteId(null);
                            setDeleteLabel('');
                        }}
                        className={ghostBtn}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={crud.loading}
                        className={dangerBtn}
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

// ── Shared primitives ─────────────────────────────────────────────

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 appearance-none disabled:opacity-40 disabled:cursor-not-allowed';
const primaryBtn =
    'flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 hover:text-blue-200 active:scale-95';
const ghostBtn =
    'rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200';
const dangerBtn =
    'flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50';

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-1 text-blue-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function ErrorAlert({ message }: { message: string }) {
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
            <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

function ModalHeader({
    title,
    onClose,
}: {
    title: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
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
    onConfirm,
    loading,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    return (
        <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
            <button onClick={onCancel} className={ghostBtn}>
                取消
            </button>
            <button
                onClick={onConfirm}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
            >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? '保存中...' : '保存'}
            </button>
        </div>
    );
}

function ActionBtn({
    children,
    onClick,
    title,
    variant,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    variant: 'edit' | 'delete';
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
