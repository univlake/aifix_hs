import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Save,
    Loader2,
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Check,
    ShieldCheck,
    Stethoscope,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
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
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface ProductionStandardization {
    id: number;
    grade: string;
    get_time: string | null;
    valid_period: string | null;
    annex_url: string | null;
}

interface OccupationalHealthSafety {
    id: number;
    certification_body: string | null;
    standard_edition: string | null;
    get_time: string | null;
    valid_period: string | null;
    annex_url: string | null;
}

interface FilingPermission {
    id: number;
    record_type_id: number | null;
    record_type?: { id: number; title: string };
    issuing_department: string | null;
    filing_range: string | null;
    filing_time: string | null;
    valid_period: string | null;
    comment: string | null;
    annex_url: string | null;
    company_id: number;
}

interface RecordType {
    id: number;
    title: string;
}

// ── Shared styles (matching Enterprise Information page) ──────────

const inputCls =
    'w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2 px-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30';

// ── Shared sub-components ─────────────────────────────────────────

function ReadonlyField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
            <dt className="mb-1 text-xs text-slate-600">{label}</dt>
            <dd className="text-sm font-medium text-slate-300">
                {value || '未填写'}
            </dd>
        </div>
    );
}

function ReadonlyFileField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
            <dt className="mb-1 text-xs text-slate-600">{label}</dt>
            {value ? (
                <AttachmentViewer
                    url={value}
                    label="查看附件"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                />
            ) : (
                <dd className="text-sm font-medium text-slate-600">未上传</dd>
            )}
        </div>
    );
}

function FieldLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-1.5 block text-xs text-slate-500">
            {children}
            {required && <span className="ml-0.5 text-blue-500">*</span>}
        </label>
    );
}

function ErrorBanner({ message }: { message: string }) {
    if (!message) {
        return null;
    }

    return (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
        </div>
    );
}

function SuccessBanner({ message }: { message: string }) {
    if (!message) {
        return null;
    }

    return (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            {message}
        </div>
    );
}

// Action buttons — exact enterprise page style
function EditButtons({
    isNew,
    editMode,
    saving,
    loading,
    onEdit,
    onSave,
    onCancel,
}: {
    isNew: boolean;
    editMode: boolean;
    saving: boolean;
    loading: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    if (!editMode && !isNew) {
        return (
            <button
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-lg border border-blue-600/40 bg-blue-600/15 px-3.5 py-2 text-xs font-medium text-blue-400 transition-all hover:bg-blue-600/25"
            >
                <Pencil className="h-3.5 w-3.5" />
                编辑
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {!isNew && (
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 px-3.5 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200"
                >
                    <X className="h-3.5 w-3.5" />
                    取消
                </button>
            )}
            <button
                onClick={onSave}
                disabled={saving || loading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            >
                {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Save className="h-3.5 w-3.5" />
                )}
                {saving ? '保存中...' : '保存'}
            </button>
        </div>
    );
}

// InfoCard — matches enterprise InfoCard style
const accentMap = {
    blue: {
        border: 'border-blue-900/40',
        icon: 'bg-blue-600/15 border-blue-600/20',
        iconColor: 'text-blue-400',
    },
    teal: {
        border: 'border-teal-900/40',
        icon: 'bg-teal-600/15 border-teal-600/20',
        iconColor: 'text-teal-400',
    },
};

function InfoCard({
    title,
    subtitle,
    icon: Icon,
    accent = 'blue',
    action,
    children,
}: {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: keyof typeof accentMap;
    action: React.ReactNode;
    children: React.ReactNode;
}) {
    const a = accentMap[accent];

    return (
        <div className={`rounded-xl border ${a.border} bg-[#0d1530] p-6`}>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${a.icon}`}
                    >
                        <Icon className={`h-4 w-4 ${a.iconColor}`} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-200">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {subtitle}
                        </p>
                    </div>
                </div>
                <div className="shrink-0">{action}</div>
            </div>
            {children}
        </div>
    );
}

// ── Production Standardization card ──────────────────────────────

function ProductionStandardizationCard({ companyId }: { companyId: number }) {
    const { canWrite } = usePermission();
    const canCreate = canWrite('production-standardizations.create');
    const canUpdate = canWrite('production-standardizations.update');
    const [record, setRecord] = useState<ProductionStandardization | null>(
        null,
    );
    const [form, setForm] = useState({
        grade: '',
        get_time: '',
        valid_period: '',
        annex_url: '',
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');
    const [error, setError] = useState('');
    const canEdit = record ? canUpdate : canCreate;

    useEffect(() => {
        setLoading(true);
        api.get<ApiResponse<ProductionStandardization | null>>(
            '/production-standardizations',
            {
                params: { company_id: companyId },
            },
        )
            .then(({ data: res }) => {
                const rec = res.data ?? null;
                setRecord(rec);

                if (rec) {
                    setForm({
                        grade: rec.grade ?? '',
                        get_time: rec.get_time ?? '',
                        valid_period: rec.valid_period ?? '',
                        annex_url: rec.annex_url ?? '',
                    });
                }
            })
            .catch((err) => setError(err.response?.data?.message ?? '加载失败'))
            .finally(() => setLoading(false));
    }, [companyId]);

    const isNew = !record;
    const isEditing = canEdit && (isNew || editMode);

    const handleEdit = () => {
        setEditMode(true);
        setError('');
    };

    const handleCancel = () => {
        if (record) {
            setForm({
                grade: record.grade ?? '',
                get_time: record.get_time ?? '',
                valid_period: record.valid_period ?? '',
                annex_url: record.annex_url ?? '',
            });
        }

        setEditMode(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const payload = { ...form, company_id: companyId };

            if (record?.id) {
                const { data: res } = await api.put<
                    ApiResponse<ProductionStandardization>
                >(`/production-standardizations/${record.id}`, payload);
                setRecord(res.data);
            } else {
                const { data: res } = await api.post<
                    ApiResponse<ProductionStandardization>
                >('/production-standardizations', payload);
                setRecord(res.data);
            }

            setEditMode(false);
            setSavedMsg('已保存');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '保存失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <InfoCard
            title="安全生产标准化体系"
            subtitle="Work Safety Standardization System"
            icon={ShieldCheck}
            accent="blue"
            action={
                canEdit ? (
                    <EditButtons
                        isNew={isNew}
                        editMode={editMode}
                        saving={saving}
                        loading={loading}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : null
            }
        >
            {loading ? (
                <div className="flex h-36 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                </div>
            ) : (
                <>
                    <ErrorBanner message={error} />
                    <SuccessBanner message={savedMsg} />
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <FieldLabel required>达标等级</FieldLabel>
                                <select
                                    value={form.grade}
                                    onChange={(e) =>
                                        set('grade', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option
                                        value=""
                                        disabled
                                        className="bg-[#0d1530]"
                                    >
                                        请选择等级
                                    </option>
                                    <option
                                        value="一级"
                                        className="bg-[#0d1530]"
                                    >
                                        一级
                                    </option>
                                    <option
                                        value="二级"
                                        className="bg-[#0d1530]"
                                    >
                                        二级
                                    </option>
                                    <option
                                        value="三级"
                                        className="bg-[#0d1530]"
                                    >
                                        三级
                                    </option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>取得时间</FieldLabel>
                                    <DatePicker
                                        value={form.get_time}
                                        onChange={(v) => set('get_time', v)}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>有效期</FieldLabel>
                                    <DatePicker
                                        value={form.valid_period}
                                        onChange={(v) => set('valid_period', v)}
                                    />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>附件</FieldLabel>
                                <OssUploadField
                                    value={form.annex_url}
                                    onChange={(url) => set('annex_url', url)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <ReadonlyField
                                label="达标等级"
                                value={record?.grade}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <ReadonlyField
                                    label="取得时间"
                                    value={record?.get_time}
                                />
                                <ReadonlyField
                                    label="有效期"
                                    value={record?.valid_period}
                                />
                            </div>
                            <ReadonlyFileField
                                label="附件"
                                value={record?.annex_url}
                            />
                        </div>
                    )}
                </>
            )}
        </InfoCard>
    );
}

// ── Occupational Health Safety card ──────────────────────────────

function OccupationalHealthSafetyCard({ companyId }: { companyId: number }) {
    const { canWrite } = usePermission();
    const canCreate = canWrite('occupational-health-safeties.create');
    const canUpdate = canWrite('occupational-health-safeties.update');
    const [record, setRecord] = useState<OccupationalHealthSafety | null>(null);
    const [form, setForm] = useState({
        certification_body: '',
        standard_edition: '',
        get_time: '',
        valid_period: '',
        annex_url: '',
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');
    const [error, setError] = useState('');
    const canEdit = record ? canUpdate : canCreate;

    useEffect(() => {
        setLoading(true);
        api.get<ApiResponse<OccupationalHealthSafety | null>>(
            '/occupational-health-safeties',
            {
                params: { company_id: companyId },
            },
        )
            .then(({ data: res }) => {
                const rec = res.data ?? null;
                setRecord(rec);

                if (rec) {
                    setForm({
                        certification_body: rec.certification_body ?? '',
                        standard_edition: rec.standard_edition ?? '',
                        get_time: rec.get_time ?? '',
                        valid_period: rec.valid_period ?? '',
                        annex_url: rec.annex_url ?? '',
                    });
                }
            })
            .catch((err) => setError(err.response?.data?.message ?? '加载失败'))
            .finally(() => setLoading(false));
    }, [companyId]);

    const isNew = !record;
    const isEditing = canEdit && (isNew || editMode);

    const handleEdit = () => {
        setEditMode(true);
        setError('');
    };

    const handleCancel = () => {
        if (record) {
            setForm({
                certification_body: record.certification_body ?? '',
                standard_edition: record.standard_edition ?? '',
                get_time: record.get_time ?? '',
                valid_period: record.valid_period ?? '',
                annex_url: record.annex_url ?? '',
            });
        }

        setEditMode(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const payload = { ...form, company_id: companyId };

            if (record?.id) {
                const { data: res } = await api.put<
                    ApiResponse<OccupationalHealthSafety>
                >(`/occupational-health-safeties/${record.id}`, payload);
                setRecord(res.data);
            } else {
                const { data: res } = await api.post<
                    ApiResponse<OccupationalHealthSafety>
                >('/occupational-health-safeties', payload);
                setRecord(res.data);
            }

            setEditMode(false);
            setSavedMsg('已保存');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '保存失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <InfoCard
            title="职业健康安全管理体系"
            subtitle="Occupational Health and Safety Management System"
            icon={Stethoscope}
            accent="teal"
            action={
                canEdit ? (
                    <EditButtons
                        isNew={isNew}
                        editMode={editMode}
                        saving={saving}
                        loading={loading}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : null
            }
        >
            {loading ? (
                <div className="flex h-36 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                </div>
            ) : (
                <>
                    <ErrorBanner message={error} />
                    <SuccessBanner message={savedMsg} />
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>认证机构</FieldLabel>
                                    <input
                                        type="text"
                                        value={form.certification_body}
                                        onChange={(e) =>
                                            set(
                                                'certification_body',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="认证机构名称"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>标准版本</FieldLabel>
                                    <input
                                        type="text"
                                        value={form.standard_edition}
                                        onChange={(e) =>
                                            set(
                                                'standard_edition',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="如：ISO 45001:2018"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>取得时间</FieldLabel>
                                    <DatePicker
                                        value={form.get_time}
                                        onChange={(v) => set('get_time', v)}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>有效期</FieldLabel>
                                    <DatePicker
                                        value={form.valid_period}
                                        onChange={(v) => set('valid_period', v)}
                                    />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>附件</FieldLabel>
                                <OssUploadField
                                    value={form.annex_url}
                                    onChange={(url) => set('annex_url', url)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <ReadonlyField
                                    label="认证机构"
                                    value={record?.certification_body}
                                />
                                <ReadonlyField
                                    label="标准版本"
                                    value={record?.standard_edition}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadonlyField
                                    label="取得时间"
                                    value={record?.get_time}
                                />
                                <ReadonlyField
                                    label="有效期"
                                    value={record?.valid_period}
                                />
                            </div>
                            <ReadonlyFileField
                                label="附件"
                                value={record?.annex_url}
                            />
                        </div>
                    )}
                </>
            )}
        </InfoCard>
    );
}

// ── Modal ─────────────────────────────────────────────────────────

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

// ── Filing Permissions section ────────────────────────────────────

function FilingPermissionsSection({ companyId }: { companyId: number }) {
    const {
        data,
        loading,
        total,
        current_page,
        last_page,
        per_page,
        reload,
        goToPage,
    } = useApiList<FilingPermission>({
        endpoint: '/filing-permissions',
        defaultParams: { company_id: companyId },
        enabled: !!companyId,
    });

    const crud = useApiCrud('/filing-permissions');
    const { canWrite } = usePermission();
    const canCreate = canWrite('filing-permissions.create');
    const canUpdate = canWrite('filing-permissions.update');
    const canDelete = canWrite('filing-permissions.delete');
    const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const detail = useDetailDrawer<FilingPermission>();
    const detailItem = detail.data;
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const emptyForm = {
        record_type_id: '',
        issuing_department: '',
        filing_range: '',
        filing_time: '',
        valid_period: '',
        comment: '',
        annex_url: '',
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        api.get<ApiResponse<{ data: RecordType[] }>>('/record-types', {
            params: { per_page: 200 },
        })
            .then(({ data: res }) => setRecordTypes(res.data?.data ?? []))
            .catch(() => {});
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (row: FilingPermission) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            record_type_id: row.record_type_id
                ? String(row.record_type_id)
                : '',
            issuing_department: row.issuing_department ?? '',
            filing_range: row.filing_range ?? '',
            filing_time: row.filing_time ?? '',
            valid_period: row.valid_period ?? '',
            comment: row.comment ?? '',
            annex_url: row.annex_url ?? '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                ...form,
                company_id: companyId,
                record_type_id: form.record_type_id
                    ? Number(form.record_type_id)
                    : null,
            };
            Object.keys(payload).forEach((k) => {
                if (payload[k] === '') {
                    payload[k] = null;
                }
            });

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

    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const columns: ColumnDef<FilingPermission>[] = [
        {
            accessorKey: 'record_type',
            header: '备案/许可类型',
            cell: ({ row }) =>
                row.original.record_type?.title ?? (
                    <span className="text-slate-600">—</span>
                ),
        },
        {
            accessorKey: 'issuing_department',
            header: '发证部门',
            cell: ({ row }) =>
                row.original.issuing_department ?? (
                    <span className="text-slate-600">—</span>
                ),
        },
        {
            accessorKey: 'filing_time',
            header: '备案/许可时间',
            cell: ({ row }) =>
                row.original.filing_time ?? (
                    <span className="text-slate-600">—</span>
                ),
        },
        {
            accessorKey: 'valid_period',
            header: '有效期',
            cell: ({ row }) =>
                row.original.valid_period ?? (
                    <span className="text-slate-600">—</span>
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
                            title="编辑"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => setDeleteId(row.original.id)}
                            title="删除"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
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
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        新增
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
                title="备案/许可证详情"
                data={detailItem as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    record_type: '备案/许可类型',
                    title: '类型名称',
                    issuing_department: '发证部门',
                    filing_time: '备案/许可时间',
                    valid_period: '有效期',
                    filing_range: '备案/许可范围',
                    annex_url: '附件',
                    comment: '备注',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}备案/许可
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {editingId
                                ? '修改现有记录信息'
                                : '填写信息后保存新记录'}
                        </p>
                    </div>
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4 p-6">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {formError}
                            </div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <FieldLabel required>备案/许可类型</FieldLabel>
                                <select
                                    value={form.record_type_id}
                                    onChange={(e) =>
                                        set('record_type_id', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option
                                        value=""
                                        disabled
                                        className="bg-[#0d1530]"
                                    >
                                        请选择类型
                                    </option>
                                    {recordTypes.map((rt) => (
                                        <option
                                            key={rt.id}
                                            value={String(rt.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {rt.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FieldLabel>发证部门</FieldLabel>
                                <input
                                    type="text"
                                    value={form.issuing_department}
                                    onChange={(e) =>
                                        set(
                                            'issuing_department',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="发证/备案部门"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <FieldLabel>备案/许可时间</FieldLabel>
                                <DatePicker
                                    value={form.filing_time}
                                    onChange={(v) => set('filing_time', v)}
                                />
                            </div>
                            <div>
                                <FieldLabel>有效期</FieldLabel>
                                <DatePicker
                                    value={form.valid_period}
                                    onChange={(v) => set('valid_period', v)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>备案/许可范围</FieldLabel>
                                <textarea
                                    value={form.filing_range}
                                    onChange={(e) =>
                                        set('filing_range', e.target.value)
                                    }
                                    placeholder="备案/许可范围说明"
                                    rows={3}
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>备注</FieldLabel>
                                <textarea
                                    value={form.comment}
                                    onChange={(e) =>
                                        set('comment', e.target.value)
                                    }
                                    rows={2}
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>附件</FieldLabel>
                                <OssUploadField
                                    value={form.annex_url}
                                    onChange={(url) => set('annex_url', url)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formLoading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-60"
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
                        删除备案/许可
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除这条记录吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDeleteId(null)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={crud.loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
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

// ── Divider ───────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-medium tracking-widest text-slate-600 uppercase">
                {label}
            </span>
            <div className="h-px flex-1 bg-slate-800" />
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────

export default function QualificationsIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    return (
        <>
            <Head title="安全资质管理" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-100">
                    安全资质管理
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    管理企业安全生产相关证书、资质及许可证
                </p>
            </div>

            {!companyId ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-600">
                    请先选择企业
                </div>
            ) : (
                <div className="space-y-8">
                    {/* ── 安全体系 ── */}
                    <div>
                        <p className="mb-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">
                            安全体系
                        </p>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <ProductionStandardizationCard
                                companyId={companyId}
                            />
                            <OccupationalHealthSafetyCard
                                companyId={companyId}
                            />
                        </div>
                    </div>

                    <Divider label="备案 / 许可证" />

                    {/* ── 备案/许可证 ── */}
                    <div>
                        <p className="mb-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">
                            备案 / 许可证
                        </p>
                        <FilingPermissionsSection companyId={companyId} />
                    </div>
                </div>
            )}
        </>
    );
}
