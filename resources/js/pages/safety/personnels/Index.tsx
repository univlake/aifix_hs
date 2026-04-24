import { Head } from '@inertiajs/react';
import {
    Loader2,
    Save,
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Users,
    ShieldCheck,
    Flame,
    HardHat,
    Download,
    Upload,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface PersonnelStats {
    id?: number;
    total_people: number;
    staff: number;
    service: number;
    manager: number;
    high_school_diploma: number;
    safety_engineer: number;
    safety_engineering_major: number;
    fire_engineer: number;
    security_officer: number;
    other: number;
}

interface CertStatus {
    id?: number;
    type: number;
    name: string;
    should_obtain_people: number | null;
    already_obtain_people: number | null;
    no_obtain_people: string;
    train_people: number | null;
}

const EMPTY_STATS: PersonnelStats = {
    total_people: 0,
    staff: 0,
    service: 0,
    manager: 0,
    high_school_diploma: 0,
    safety_engineer: 0,
    safety_engineering_major: 0,
    fire_engineer: 0,
    security_officer: 0,
    other: 0,
};

// Certificate status types
const SAFETY_CERT_TYPES = [
    { type: 1, name: '主要负责人' },
    { type: 2, name: '安全管理人员' },
    { type: 3, name: '特种作业人员' },
];
const FIRE_CERT_TYPES = [
    { type: 4, name: '主要负责人' },
    { type: 5, name: '消防安全管理人员' },
    { type: 6, name: '消防控制室操作人员' },
];

// ── Main Page ─────────────────────────────────────────────────────

export default function PersonnelsIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;
    const [activeTab, setActiveTab] = useState<
        'safety-mgmt' | 'special-op' | 'fire-control'
    >('safety-mgmt');

    return (
        <>
            <Head title="人员管理" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-100">人员管理</h1>
                <p className="mt-0.5 text-xs text-slate-600">
                    管理企业人员信息、专业资质及持证情况
                </p>
            </div>

            <div className="space-y-6">
                <EmploymentStatsSection companyId={companyId} />
                <CertStatusSection
                    companyId={companyId}
                    types={SAFETY_CERT_TYPES}
                    title="安全生产三类人员持证情况"
                />
                <CertStatusSection
                    companyId={companyId}
                    types={FIRE_CERT_TYPES}
                    title="消防人员持证情况"
                    icon="fire"
                />
                <StaffSubModulesSection
                    companyId={companyId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
        </>
    );
}

// ── Section 1 & 2: Employment Statistics ─────────────────────────

function EmploymentStatsSection({
    companyId,
}: {
    companyId: number | undefined;
}) {
    const { canWrite } = usePermission();
    const canCreate = canWrite('personnels.create');
    const canUpdate = canWrite('personnels.update');
    const [stats, setStats] = useState<PersonnelStats>(EMPTY_STATS);
    const [savedStats, setSavedStats] = useState<PersonnelStats>(EMPTY_STATS);
    const [recordId, setRecordId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState('');

    const isNew = !recordId;
    const isEditing = isNew || editMode;
    const canActOnRecord = isNew ? canCreate : canUpdate;

    useEffect(() => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        api.get<ApiResponse<PaginatedData<PersonnelStats>>>('/personnels', {
            params: { company_id: companyId, per_page: 1 },
        })
            .then(({ data: res }) => {
                const first = res.data?.data?.[0];

                if (first) {
                    setStats(first);
                    setSavedStats(first);
                    setRecordId((first as any).id ?? null);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [companyId]);

    const handleSave = async () => {
        if (!companyId) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload = { ...stats, company_id: companyId };

            if (recordId) {
                await api.put(`/personnels/${recordId}`, payload);
            } else {
                const { data: res } = await api.post<
                    ApiResponse<{ id: number }>
                >('/personnels', payload);
                setRecordId((res.data as any).id);
            }

            setSavedStats(stats);
            setSaved(true);
            setEditMode(false);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '保存失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setStats(savedStats);
        setEditMode(false);
        setError('');
    };

    const num = (key: keyof PersonnelStats) => (
        <NumberInput
            value={stats[key] as number}
            onChange={(v) => setStats((s) => ({ ...s, [key]: v }))}
        />
    );

    const val = (key: keyof PersonnelStats) => (
        <ReadonlyStatValue value={stats[key] as number} />
    );

    const actionButtons = isEditing ? (
        canActOnRecord ? (
            <div className="flex items-center gap-2">
                {!isNew && (
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                        取消
                    </button>
                )}
                <SaveButton
                    saving={saving}
                    saved={saved}
                    disabled={loading}
                    onClick={handleSave}
                />
            </div>
        ) : null
    ) : canUpdate ? (
        <button
            onClick={() => {
                setEditMode(true);
                setError('');
            }}
            className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
        >
            <Pencil className="h-3 w-3" />
            编辑
        </button>
    ) : null;

    return (
        <SectionCard
            title="基本用工 & 专业人员信息"
            icon={<Users className="h-4 w-4" />}
            action={!loading ? actionButtons : undefined}
        >
            {error && <ErrorBanner>{error}</ErrorBanner>}
            {loading ? (
                <LoadingRow />
            ) : (
                <div className="space-y-5">
                    {/* Basic employment */}
                    <div>
                        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            基本用工信息
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            <StatField
                                label="从业人员总数"
                                field={
                                    isEditing
                                        ? num('total_people')
                                        : val('total_people')
                                }
                            />
                            <StatField
                                label="合同制员工"
                                field={isEditing ? num('staff') : val('staff')}
                            />
                            <StatField
                                label="劳务派遣人员"
                                field={
                                    isEditing ? num('service') : val('service')
                                }
                            />
                            <StatField
                                label="管理人员"
                                field={
                                    isEditing ? num('manager') : val('manager')
                                }
                            />
                            <StatField
                                label="高中及以上学历"
                                field={
                                    isEditing
                                        ? num('high_school_diploma')
                                        : val('high_school_diploma')
                                }
                            />
                        </div>
                    </div>

                    <div className="border-t border-blue-900/20" />

                    {/* Professional personnel */}
                    <div>
                        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            专业人员信息
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            <StatField
                                label="注册安全工程师"
                                field={
                                    isEditing
                                        ? num('safety_engineer')
                                        : val('safety_engineer')
                                }
                            />
                            <StatField
                                label="安全工程专业人员"
                                field={
                                    isEditing
                                        ? num('safety_engineering_major')
                                        : val('safety_engineering_major')
                                }
                            />
                            <StatField
                                label="注册消防工程师"
                                field={
                                    isEditing
                                        ? num('fire_engineer')
                                        : val('fire_engineer')
                                }
                            />
                            <StatField
                                label="安全管理人员"
                                field={
                                    isEditing
                                        ? num('security_officer')
                                        : val('security_officer')
                                }
                            />
                            <StatField
                                label="其他人员"
                                field={isEditing ? num('other') : val('other')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}

// ── Section 3 & 4: Certificate Status ────────────────────────────

function CertStatusSection({
    companyId,
    types,
    title,
    icon,
}: {
    companyId: number | undefined;
    types: { type: number; name: string }[];
    title: string;
    icon?: string;
}) {
    const [rows, setRows] = useState<CertStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRow, setEditingRow] = useState<CertStatus | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const typeIds = types.map((t) => t.type);

    const fetchRows = useCallback(() => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        // Fetch all types in one call via multiple requests, merge results
        Promise.all(
            typeIds.map((t) =>
                api
                    .get<ApiResponse<PaginatedData<CertStatus>>>(
                        '/certificate-statuses',
                        {
                            params: {
                                company_id: companyId,
                                type: t,
                                per_page: 1,
                            },
                        },
                    )
                    .then(({ data: res }) => res.data?.data?.[0] ?? null),
            ),
        )
            .then((results) => {
                // Merge fetched records with defaults
                const merged = types.map((t, idx) => {
                    const existing = results[idx];

                    return (
                        existing ?? {
                            type: t.type,
                            name: t.name,
                            should_obtain_people: null,
                            already_obtain_people: null,
                            no_obtain_people: '',
                            train_people: null,
                        }
                    );
                });
                setRows(merged);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [companyId]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const openEdit = (row: CertStatus) => {
        setEditingRow({ ...row });
        setError('');
    };

    const handleSave = async () => {
        if (!editingRow || !companyId) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload = {
                ...editingRow,
                company_id: companyId,
                name: editingRow.name,
            };

            if (editingRow.id) {
                await api.put(
                    `/certificate-statuses/${editingRow.id}`,
                    payload,
                );
            } else {
                await api.post('/certificate-statuses', payload);
            }

            setEditingRow(null);
            fetchRows();
        } catch (err: unknown) {
            setError(getErrorMessage(err, '保存失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const typeName = (t: number) => types.find((x) => x.type === t)?.name ?? '';

    return (
        <SectionCard
            title={title}
            icon={
                icon === 'fire' ? (
                    <Flame className="h-4 w-4" />
                ) : (
                    <ShieldCheck className="h-4 w-4" />
                )
            }
        >
            {loading ? (
                <LoadingRow />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-blue-900/20">
                                {[
                                    '类别',
                                    '已取证人数',
                                    '应取证人数',
                                    '未取证说明',
                                    '培训人数',
                                    '操作',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="pr-4 pb-2 text-left text-xs font-medium tracking-wide text-slate-500 uppercase last:pr-0"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.type}
                                    className="border-b border-blue-900/10 last:border-0"
                                >
                                    <td className="py-3 pr-4 font-medium text-slate-300">
                                        {typeName(row.type)}
                                    </td>
                                    <td className="py-3 pr-4 text-slate-400">
                                        {row.already_obtain_people ?? <Dash />}
                                    </td>
                                    <td className="py-3 pr-4 text-slate-400">
                                        {row.should_obtain_people ?? <Dash />}
                                    </td>
                                    <td className="max-w-[180px] py-3 pr-4 text-slate-400">
                                        {row.no_obtain_people ? (
                                            <span className="block truncate">
                                                {row.no_obtain_people}
                                            </span>
                                        ) : (
                                            <Dash />
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-slate-400">
                                        {row.train_people ?? <Dash />}
                                    </td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => openEdit(row)}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit modal */}
            {editingRow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setEditingRow(null)}
                    />
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-blue-900/30 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-100">
                                编辑持证情况 — {typeName(editingRow.type)}
                            </h2>
                            <button
                                onClick={() => setEditingRow(null)}
                                className="text-slate-600 hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4 p-5">
                            {error && <ErrorBanner>{error}</ErrorBanner>}
                            <ModalField label="已取证人数">
                                <NumberInput
                                    value={
                                        editingRow.already_obtain_people ?? 0
                                    }
                                    onChange={(v) =>
                                        setEditingRow(
                                            (r) =>
                                                r && {
                                                    ...r,
                                                    already_obtain_people: v,
                                                },
                                        )
                                    }
                                />
                            </ModalField>
                            <ModalField label="应取证人数">
                                <NumberInput
                                    value={editingRow.should_obtain_people ?? 0}
                                    onChange={(v) =>
                                        setEditingRow(
                                            (r) =>
                                                r && {
                                                    ...r,
                                                    should_obtain_people: v,
                                                },
                                        )
                                    }
                                />
                            </ModalField>
                            <ModalField label="未取证说明">
                                <textarea
                                    value={editingRow.no_obtain_people}
                                    onChange={(e) =>
                                        setEditingRow(
                                            (r) =>
                                                r && {
                                                    ...r,
                                                    no_obtain_people:
                                                        e.target.value,
                                                },
                                        )
                                    }
                                    rows={2}
                                    placeholder="说明未取证原因或情况"
                                    className={inputClass + ' resize-none'}
                                />
                            </ModalField>
                            <ModalField label="培训人数">
                                <NumberInput
                                    value={editingRow.train_people ?? 0}
                                    onChange={(v) =>
                                        setEditingRow(
                                            (r) =>
                                                r && { ...r, train_people: v },
                                        )
                                    }
                                />
                            </ModalField>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-blue-900/30 px-5 py-4">
                            <button
                                onClick={() => setEditingRow(null)}
                                className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {saving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}

// ── Section 5: Personnel Sub-modules ─────────────────────────────

type SubTab = 'safety-mgmt' | 'special-op' | 'fire-control';

function StaffSubModulesSection({
    companyId,
    activeTab,
    onTabChange,
}: {
    companyId: number | undefined;
    activeTab: SubTab;
    onTabChange: (tab: SubTab) => void;
}) {
    const [safetyMgmtTypes, setSafetyMgmtTypes] = useState<SelectOption[]>([]);

    useEffect(() => {
        api.get<ApiResponse<{ data: { id: number; title: string }[] }>>(
            '/safety-management-types',
        )
            .then(({ data: res }) => {
                setSafetyMgmtTypes(
                    (res.data?.data ?? []).map((t) => ({
                        value: t.id,
                        label: t.title,
                    })),
                );
            })
            .catch(() => {});
    }, []);

    const tabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
        {
            id: 'safety-mgmt',
            label: '安全管理人员',
            icon: <ShieldCheck className="h-3.5 w-3.5" />,
        },
        {
            id: 'special-op',
            label: '特种作业及设备操作人员',
            icon: <HardHat className="h-3.5 w-3.5" />,
        },
        {
            id: 'fire-control',
            label: '消防控制室人员',
            icon: <Flame className="h-3.5 w-3.5" />,
        },
    ];

    return (
        <SectionCard title="安全人员管理" icon={<Users className="h-4 w-4" />}>
            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-lg border border-blue-900/30 bg-[#070d1f] p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
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

            {activeTab === 'safety-mgmt' && (
                <StaffTable
                    endpoint="/safety-management"
                    companyId={companyId}
                    columns={[
                        { key: 'name', header: '姓名' },
                        {
                            key: 'safety_management_type_id',
                            header: '人员类型',
                            valueGetter: (row) =>
                                (row.safety_management_type as any)?.title,
                        },
                        { key: 'cert_title', header: '证书名称' },
                        { key: 'cert_number', header: '证书编号' },
                        {
                            key: 'valid_period',
                            header: '有效期',
                            format: (v) => (v ? String(v).slice(0, 10) : ''),
                        },
                    ]}
                    formFields={[
                        { key: 'name', label: '姓名', required: true },
                        {
                            key: 'safety_management_type_id',
                            label: '人员类型',
                            type: 'select',
                            options: safetyMgmtTypes,
                        },
                        { key: 'tel', label: '联系电话' },
                        { key: 'cert_title', label: '证书名称' },
                        { key: 'cert_number', label: '证书编号' },
                        { key: 'valid_period', label: '有效期', type: 'date' },
                    ]}
                />
            )}

            {activeTab === 'special-op' && (
                <StaffTable
                    endpoint="/special-equipment-staff"
                    companyId={companyId}
                    columns={[
                        { key: 'name', header: '姓名' },
                        { key: 'cert_title', header: '证书名称' },
                        { key: 'cert_number', header: '证书编号' },
                        {
                            key: 'valid_period',
                            header: '有效期',
                            format: (v) => (v ? String(v).slice(0, 10) : ''),
                        },
                    ]}
                    formFields={[
                        { key: 'name', label: '姓名', required: true },
                        { key: 'cert_title', label: '证书名称' },
                        { key: 'cert_number', label: '证书编号' },
                        { key: 'valid_period', label: '有效期', type: 'date' },
                    ]}
                />
            )}

            {activeTab === 'fire-control' && (
                <StaffTable
                    endpoint="/elimination-control-staff"
                    companyId={companyId}
                    columns={[
                        { key: 'name', header: '姓名' },
                        { key: 'cert_title', header: '证书名称' },
                        { key: 'cert_number', header: '证书编号' },
                        {
                            key: 'valid_period',
                            header: '有效期',
                            format: (v) => (v ? String(v).slice(0, 10) : ''),
                        },
                    ]}
                    formFields={[
                        { key: 'name', label: '姓名', required: true },
                        { key: 'cert_title', label: '证书名称' },
                        { key: 'cert_number', label: '证书编号' },
                        { key: 'valid_period', label: '有效期', type: 'date' },
                    ]}
                />
            )}
        </SectionCard>
    );
}

// ── Staff Table (embedded mini CRUD) ─────────────────────────────

interface TableColumn {
    key: string;
    header: string;
    format?: (value: unknown) => string;
    valueGetter?: (row: Record<string, unknown>) => unknown;
}

interface SelectOption {
    value: number;
    label: string;
}

interface FormFieldDef {
    key: string;
    label: string;
    required?: boolean;
    type?: 'text' | 'date' | 'number' | 'select';
    options?: SelectOption[];
}

function StaffTable({
    endpoint,
    companyId,
    columns,
    formFields,
}: {
    endpoint: string;
    companyId: number | undefined;
    columns: TableColumn[];
    formFields: FormFieldDef[];
}) {
    const { data, loading, reload, total } = useApiList<
        Record<string, unknown>
    >({
        endpoint,
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud(endpoint);
    const permModule = endpoint.replace(/^\//, '');
    const { canWrite } = usePermission();
    const canCreate = canWrite(`${permModule}.create`);
    const canUpdate = canWrite(`${permModule}.update`);
    const canDelete = canWrite(`${permModule}.delete`);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState('');
    const detail = useDetailDrawer<Record<string, unknown>>();
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);

    const initForm = () => {
        const f: Record<string, string> = {};
        formFields.forEach((f2) => {
            f[f2.key] = '';
        });

        return f;
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(initForm());
        setError('');
        setDialogOpen(true);
    };

    const openEdit = (row: Record<string, unknown>) => {
        setEditingId(row.id as number);
        const f: Record<string, string> = {};
        formFields.forEach((f2) => {
            const raw = row[f2.key] ?? '';
            f[f2.key] =
                f2.type === 'date' && raw
                    ? String(raw).slice(0, 10)
                    : String(raw);
        });
        setForm(f);
        setError('');
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!companyId) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload: Record<string, unknown> = {
                ...form,
                company_id: companyId,
            };
            // clean empty strings to null for date/optional fields
            formFields.forEach((f2) => {
                if (payload[f2.key] === '') {
                    payload[f2.key] = null;
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
            setError(getErrorMessage(err, '操作失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        await crud.remove(deleteId);
        setDeleteId(null);
        setDeleteName('');
        reload();
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get(`${endpoint}/template`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            const disposition = response.headers['content-disposition'] ?? '';
            link.setAttribute(
                'download',
                parseDispositionFilename(disposition, '导入模板.xlsx'),
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            // silently ignore download errors
        }
    };

    const handleImportFile = async (file: File) => {
        if (!companyId || !file) {
            return;
        }

        setImporting(true);
        setImportError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('company_id', String(companyId));
            await api.post(`${endpoint}/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            reload();
        } catch (err: unknown) {
            setImportError(getErrorMessage(err, '导入失败，请重试'));
        } finally {
            setImporting(false);

            if (importInputRef.current) {
                importInputRef.current.value = '';
            }
        }
    };

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                    共 <span className="text-slate-400">{total}</span> 条记录
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        <Download className="h-3.5 w-3.5" />
                        下载模板
                    </button>
                    <button
                        onClick={() => importInputRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {importing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Upload className="h-3.5 w-3.5" />
                        )}
                        {importing ? '导入中...' : '导入'}
                    </button>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (file) {
                                handleImportFile(file);
                            }
                        }}
                    />
                    {canCreate && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-600/25"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            新增
                        </button>
                    )}
                </div>
            </div>
            {importError && (
                <div className="mb-3">
                    <ErrorBanner>{importError}</ErrorBanner>
                </div>
            )}

            {loading ? (
                <LoadingRow />
            ) : data.length === 0 ? (
                <div className="rounded-lg border border-blue-900/20 bg-[#070d1f] py-8 text-center text-sm text-slate-600">
                    暂无数据
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-blue-900/20 bg-[#070d1f]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-blue-900/20">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-slate-500 uppercase"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                <th className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr
                                    key={row.id as number}
                                    className="border-b border-blue-900/10 last:border-0"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-4 py-3 text-slate-300"
                                        >
                                            {col.format
                                                ? col.format(
                                                      col.valueGetter
                                                          ? col.valueGetter(row)
                                                          : row[col.key],
                                                  ) || <Dash />
                                                : (() => {
                                                      const v = col.valueGetter
                                                          ? col.valueGetter(row)
                                                          : row[col.key];

                                                      return v != null ? (
                                                          String(v)
                                                      ) : (
                                                          <Dash />
                                                      );
                                                  })()}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-0.5">
                                            <DetailButton
                                                row={row}
                                                onOpen={detail.openDetail}
                                            />
                                            {canUpdate && (
                                                <button
                                                    onClick={() =>
                                                        openEdit(row)
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(
                                                            row.id as number,
                                                        );
                                                        setDeleteName(
                                                            String(
                                                                row.name ??
                                                                    row.id,
                                                            ),
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ObjectDetailDrawer
                open={detail.open}
                title="人员详情"
                data={detail.data}
                onClose={detail.close}
                labels={Object.fromEntries(
                    formFields.map((field) => [field.key, field.label]),
                )}
            />

            {/* Create/Edit modal */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDialogOpen(false)}
                    />
                    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-blue-900/30 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-100">
                                {editingId ? '编辑' : '新增'}人员
                            </h2>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="text-slate-600 hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4 p-5">
                            {error && <ErrorBanner>{error}</ErrorBanner>}
                            {formFields.map((field) => (
                                <ModalField
                                    key={field.key}
                                    label={field.label}
                                    required={field.required}
                                >
                                    {field.type === 'select' ? (
                                        <select
                                            value={form[field.key] ?? ''}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    [field.key]: e.target.value,
                                                }))
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">请选择</option>
                                            {field.options?.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type ?? 'text'}
                                            value={form[field.key] ?? ''}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    [field.key]: e.target.value,
                                                }))
                                            }
                                            className={inputClass}
                                        />
                                    )}
                                </ModalField>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-blue-900/30 px-5 py-4">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {saving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteId(null)}
                    />
                    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl">
                        <div className="p-6">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                                <Trash2 className="h-5 w-5 text-red-400" />
                            </div>
                            <h2 className="mb-1 text-base font-semibold text-slate-100">
                                确认删除
                            </h2>
                            <p className="text-sm text-slate-500">
                                确定要删除
                                {deleteName ? (
                                    <>
                                        {' '}
                                        &ldquo;
                                        <span className="font-medium text-slate-300">
                                            {deleteName}
                                        </span>
                                        &rdquo;
                                    </>
                                ) : (
                                    '这条记录'
                                )}
                                吗？
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
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Shared UI primitives ──────────────────────────────────────────

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function SectionCard({
    title,
    icon,
    action,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-blue-900/30 bg-[#0d1530] p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                    {icon && <span className="text-blue-400">{icon}</span>}
                    <span className="text-sm font-semibold">{title}</span>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function StatField({
    label,
    field,
}: {
    label: string;
    field: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs text-slate-500">
                {label}
            </label>
            {field}
        </div>
    );
}

function NumberInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className={inputClass}
        />
    );
}

function ReadonlyStatValue({ value }: { value: number }) {
    return (
        <div className="rounded-lg bg-[#070d1f]/60 px-3 py-2">
            <span className="text-sm font-medium text-slate-200">{value}</span>
        </div>
    );
}

function ModalField({
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

function SaveButton({
    saving,
    saved,
    disabled,
    onClick,
}: {
    saving: boolean;
    saved: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={saving || disabled}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-medium text-blue-300 transition-all hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
        >
            {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Save className="h-3.5 w-3.5" />
            )}
            {saving ? '保存中...' : saved ? '已保存 ✓' : '保存'}
        </button>
    );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {children}
        </div>
    );
}

function LoadingRow() {
    return (
        <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
        </div>
    );
}

function Dash() {
    return <span className="text-slate-700">—</span>;
}

/**
 * Parse a `Content-Disposition` header into a filename. Prefers RFC 5987
 * `filename*=UTF-8''…` over the ASCII `filename=` fallback so Chinese template
 * names round-trip correctly.
 */
function parseDispositionFilename(
    disposition: string,
    fallback: string,
): string {
    const ext = disposition.match(
        /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i,
    );

    if (ext) {
        try {
            return decodeURIComponent(ext[2].trim());
        } catch {
            // fall through to ASCII form
        }
    }

    const plain = disposition.match(
        /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i,
    );

    if (plain) {
        const raw = (plain[1] ?? plain[2] ?? '').trim();

        try {
            return decodeURIComponent(raw) || fallback;
        } catch {
            return raw || fallback;
        }
    }

    return fallback;
}
