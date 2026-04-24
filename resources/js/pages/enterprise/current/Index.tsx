import { Head } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    Globe,
    User,
    AlertTriangle,
    Pencil,
    Save,
    X,
    Layers,
    Navigation,
    Check,
} from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { DatePicker } from '@/components/shared/DatePicker';
import { useScope } from '@/contexts/ScopeContext';

// Map modals are lazy-loaded — they pull in Leaflet (~148 KB) which is
// otherwise added to every initial page load even though the modals are
// rarely opened.
const LatLngPickerModal = lazy(() =>
    import('@/components/map/LatLngPickerModal').then((m) => ({ default: m.LatLngPickerModal })),
);
const GeoRangeDrawerModal = lazy(() =>
    import('@/components/map/GeoRangeDrawerModal').then((m) => ({ default: m.GeoRangeDrawerModal })),
);
import api from '@/lib/api';
import { usePermission } from '@/hooks/use-permission';
import { getErrorMessage } from '@/types/api-error';

// ── Types ─────────────────────────────────────────────────────────

interface TypeOption {
    id: number;
    title: string;
}

interface Company {
    id: number;
    title: string;
    credit_code?: string;
    address?: string;
    established?: string;
    business_scope?: string;
    company_introduction?: string;
    supervise_name?: string;
    supervise_tel?: string;
    supervise_fix?: string;
    supervise_email?: string;
    supervise_position?: string;
    status: number;
    status_str: string;
    inherent_risk_grade?: string;
    float_risk_grade?: string;
    acreage?: string;
    longitude?: string | number;
    dimension?: string | number; // latitude
    geographic_range?: string;
    enterprise_type_id?: number | string;
    operational_type_id?: number | string;
    enterprise_type?: { title: string };
    operational_type?: { title: string };
    inherent_risk?: string | number;
    float_risk?: string | number;
}

type EditForm = Omit<
    Company,
    'id' | 'status_str' | 'enterprise_type' | 'operational_type'
>;

// ── Page ──────────────────────────────────────────────────────────

export default function CurrentEnterprise() {
    const { activeCompany } = useScope();
    const { canWrite } = usePermission();
    const canUpdate = canWrite('companies.update');

    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<Partial<EditForm>>({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saved, setSaved] = useState(false);

    // Type options
    const [enterpriseTypes, setEnterpriseTypes] = useState<TypeOption[]>([]);
    const [operationalTypes, setOperationalTypes] = useState<TypeOption[]>([]);

    // Map modal state
    const [latlngOpen, setLatlngOpen] = useState(false);
    const [geoRangeOpen, setGeoRangeOpen] = useState(false);

    useEffect(() => {
        if (!activeCompany?.id) {
            return;
        }

        setLoading(true);
        setError('');

        // Load company data independently from type options (types may be 403 for some users)
        api.get(`/companies/${activeCompany.id}`)
            .then((res) => {
                setCompany(res.data.data);
                setForm(res.data.data);
            })
            .catch(() => setError('加载企业信息失败'))
            .finally(() => setLoading(false));

        // Type options are best-effort; failure is silently ignored
        // API returns paginated: { data: { data: [...], current_page, ... } }
        Promise.all([
            api.get('/enterprise-types').catch(() => null),
            api.get('/operational-types').catch(() => null),
        ]).then(([etRes, otRes]) => {
            if (etRes) {
                setEnterpriseTypes(
                    etRes.data.data?.data ?? etRes.data.data ?? [],
                );
            }

            if (otRes) {
                setOperationalTypes(
                    otRes.data.data?.data ?? otRes.data.data ?? [],
                );
            }
        });
    }, [activeCompany?.id]);

    const setField = (key: keyof EditForm, value: string | number) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSave = async () => {
        if (!company) {
            return;
        }

        setSaving(true);
        setSaveError('');

        try {
            const res = await api.put(`/companies/${company.id}`, form);
            setCompany(res.data.data);
            setForm(res.data.data);
            setEditMode(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: unknown) {
            setSaveError(getErrorMessage(err, '保存失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm(company ?? {});
        setEditMode(false);
        setSaveError('');
    };

    // ── Render ─────────────────────────────────────────────────────

    return (
        <>
            <Head title="当前企业" />

            {/* Map modals — lazy-loaded, only mounted when first opened. */}
            {latlngOpen && (
                <Suspense fallback={null}>
                    <LatLngPickerModal
                        open={latlngOpen}
                        onClose={() => setLatlngOpen(false)}
                        value={{ lat: form.dimension, lng: form.longitude }}
                        onConfirm={(lat, lng) => {
                            setField('dimension', lat);
                            setField('longitude', lng);
                        }}
                    />
                </Suspense>
            )}
            {geoRangeOpen && (
                <Suspense fallback={null}>
                    <GeoRangeDrawerModal
                        open={geoRangeOpen}
                        onClose={() => setGeoRangeOpen(false)}
                        center={{ lat: form.dimension, lng: form.longitude }}
                        value={form.geographic_range}
                        onConfirm={(coords) =>
                            setField('geographic_range', JSON.stringify(coords))
                        }
                    />
                </Suspense>
            )}

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        当前企业
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        查看与管理当前登录企业的基本信息
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {company && (
                        <StatusBadge
                            status={company.status}
                            label={company.status_str}
                        />
                    )}
                    {!loading && company && !editMode && canUpdate && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-600/40 bg-blue-600/15 px-3.5 py-2 text-xs font-medium text-blue-400 transition-all hover:bg-blue-600/25"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            编辑信息
                        </button>
                    )}
                    {editMode && (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 px-3.5 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200"
                            >
                                <X className="h-3.5 w-3.5" />
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {saving ? '保存中...' : '保存'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Success toast */}
            {saved && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    企业信息已保存
                </div>
            )}

            {saveError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {saveError}
                </div>
            )}

            {loading && <LoadingSkeleton />}
            {error && !loading && <ErrorState message={error} />}

            {company && !loading && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* ── Left column ── */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic info */}
                        <InfoCard
                            title="基本信息"
                            icon={Building2}
                            accent="blue"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <EditableField
                                    label="企业名称"
                                    required
                                    value={
                                        editMode
                                            ? (form.title ?? '')
                                            : (company.title ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) => setField('title', v)}
                                />
                                <EditableField
                                    label="统一社会信用代码"
                                    value={
                                        editMode
                                            ? (form.credit_code ?? '')
                                            : (company.credit_code ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) => setField('credit_code', v)}
                                />
                                <SelectField
                                    label="企业类型"
                                    value={
                                        editMode
                                            ? String(
                                                  form.enterprise_type_id ?? '',
                                              )
                                            : String(
                                                  company.enterprise_type_id ??
                                                      '',
                                              )
                                    }
                                    displayValue={
                                        company.enterprise_type?.title
                                    }
                                    options={enterpriseTypes}
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField(
                                            'enterprise_type_id',
                                            Number(v),
                                        )
                                    }
                                />
                                <SelectField
                                    label="经营类型"
                                    value={
                                        editMode
                                            ? String(
                                                  form.operational_type_id ??
                                                      '',
                                              )
                                            : String(
                                                  company.operational_type_id ??
                                                      '',
                                              )
                                    }
                                    displayValue={
                                        company.operational_type?.title
                                    }
                                    options={operationalTypes}
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField(
                                            'operational_type_id',
                                            Number(v),
                                        )
                                    }
                                />
                                <EditableField
                                    label="成立时间"
                                    type="date"
                                    value={
                                        editMode
                                            ? (form.established ?? '')
                                            : (company.established ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) => setField('established', v)}
                                />
                                <EditableField
                                    label="占地面积 (㎡)"
                                    value={
                                        editMode
                                            ? String(form.acreage ?? '')
                                            : String(company.acreage ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) => setField('acreage', v)}
                                />
                            </div>
                        </InfoCard>

                        {/* Location & Coordinates */}
                        <InfoCard
                            title="位置与坐标"
                            icon={Navigation}
                            accent="cyan"
                        >
                            <div className="space-y-3">
                                {/* Address */}
                                <EditableField
                                    label="详细地址"
                                    multiline
                                    value={
                                        editMode
                                            ? (form.address ?? '')
                                            : (company.address ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) => setField('address', v)}
                                />

                                {/* Latitude / Longitude with map picker */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
                                        <div className="mb-1 flex items-center justify-between">
                                            <dt className="text-xs text-slate-600">
                                                经度 (Longitude)
                                            </dt>
                                            {editMode && (
                                                <button
                                                    onClick={() =>
                                                        setLatlngOpen(true)
                                                    }
                                                    className="flex items-center gap-1 text-[10px] text-blue-500 transition-colors hover:text-blue-400"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    地图选点
                                                </button>
                                            )}
                                        </div>
                                        {editMode ? (
                                            <input
                                                type="number"
                                                step="0.000001"
                                                value={form.longitude ?? ''}
                                                onChange={(e) =>
                                                    setField(
                                                        'longitude',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="如：116.407400"
                                                className={inputCls}
                                            />
                                        ) : (
                                            <dd className="font-mono text-sm text-slate-300">
                                                {company.longitude
                                                    ? Number(
                                                          company.longitude,
                                                      ).toFixed(6)
                                                    : '未填写'}
                                            </dd>
                                        )}
                                    </div>
                                    <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
                                        <div className="mb-1 flex items-center justify-between">
                                            <dt className="text-xs text-slate-600">
                                                纬度 (Latitude)
                                            </dt>
                                            {editMode && (
                                                <button
                                                    onClick={() =>
                                                        setLatlngOpen(true)
                                                    }
                                                    className="flex items-center gap-1 text-[10px] text-blue-500 transition-colors hover:text-blue-400"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    地图选点
                                                </button>
                                            )}
                                        </div>
                                        {editMode ? (
                                            <input
                                                type="number"
                                                step="0.000001"
                                                value={form.dimension ?? ''}
                                                onChange={(e) =>
                                                    setField(
                                                        'dimension',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="如：39.904200"
                                                className={inputCls}
                                            />
                                        ) : (
                                            <dd className="font-mono text-sm text-slate-300">
                                                {company.dimension
                                                    ? Number(
                                                          company.dimension,
                                                      ).toFixed(6)
                                                    : '未填写'}
                                            </dd>
                                        )}
                                    </div>
                                </div>

                                {/* Geographic Range */}
                                <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <dt className="text-xs text-slate-600">
                                            企业地理范围
                                        </dt>
                                        {editMode && (
                                            <button
                                                onClick={() =>
                                                    setGeoRangeOpen(true)
                                                }
                                                className="flex items-center gap-1 rounded-md border border-blue-600/30 bg-blue-600/10 px-2.5 py-1 text-[10px] font-medium text-blue-400 transition-colors hover:bg-blue-600/20"
                                            >
                                                <Layers className="h-3 w-3" />
                                                绘制范围
                                            </button>
                                        )}
                                    </div>
                                    <GeoRangePreview
                                        value={
                                            editMode
                                                ? form.geographic_range
                                                : company.geographic_range
                                        }
                                        editing={editMode}
                                        onOpenDrawer={() =>
                                            setGeoRangeOpen(true)
                                        }
                                    />
                                </div>
                            </div>
                        </InfoCard>

                        {/* Descriptions */}
                        <InfoCard title="企业描述" icon={Globe} accent="violet">
                            <div className="space-y-3">
                                <EditableField
                                    label="经营范围"
                                    multiline
                                    rows={3}
                                    value={
                                        editMode
                                            ? (form.business_scope ?? '')
                                            : (company.business_scope ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('business_scope', v)
                                    }
                                />
                                <EditableField
                                    label="企业简介"
                                    multiline
                                    rows={4}
                                    value={
                                        editMode
                                            ? (form.company_introduction ?? '')
                                            : (company.company_introduction ??
                                              '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('company_introduction', v)
                                    }
                                />
                            </div>
                        </InfoCard>
                    </div>

                    {/* ── Right column ── */}
                    <div className="space-y-6">
                        {/* Supervisor */}
                        <InfoCard
                            title="安全监督联系人"
                            icon={User}
                            accent="violet"
                        >
                            <div className="space-y-3">
                                <EditableField
                                    label="姓名"
                                    value={
                                        editMode
                                            ? (form.supervise_name ?? '')
                                            : (company.supervise_name ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('supervise_name', v)
                                    }
                                />
                                <EditableField
                                    label="职位"
                                    value={
                                        editMode
                                            ? (form.supervise_position ?? '')
                                            : (company.supervise_position ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('supervise_position', v)
                                    }
                                />
                                <EditableField
                                    label="手机号"
                                    value={
                                        editMode
                                            ? (form.supervise_tel ?? '')
                                            : (company.supervise_tel ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('supervise_tel', v)
                                    }
                                />
                                <EditableField
                                    label="座机"
                                    value={
                                        editMode
                                            ? (form.supervise_fix ?? '')
                                            : (company.supervise_fix ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('supervise_fix', v)
                                    }
                                />
                                <EditableField
                                    label="邮箱"
                                    type="email"
                                    value={
                                        editMode
                                            ? (form.supervise_email ?? '')
                                            : (company.supervise_email ?? '')
                                    }
                                    editing={editMode}
                                    onChange={(v) =>
                                        setField('supervise_email', v)
                                    }
                                />
                            </div>
                        </InfoCard>

                        {/* Risk */}
                        <InfoCard
                            title="风险等级"
                            icon={AlertTriangle}
                            accent="amber"
                        >
                            <p className="mb-3 text-[11px] text-slate-600">
                                风险值由系统自动计算，不可手动修改
                            </p>
                            <div className="space-y-3">
                                <ReadonlyField
                                    label="固有风险分值"
                                    value={String(
                                        company.inherent_risk ?? '未计算',
                                    )}
                                />
                                <ReadonlyField
                                    label="固有风险等级"
                                    value={
                                        company.inherent_risk_grade ?? '未计算'
                                    }
                                />
                                <ReadonlyField
                                    label="浮动风险分值"
                                    value={String(
                                        company.float_risk ?? '未计算',
                                    )}
                                />
                                <ReadonlyField
                                    label="浮动风险等级"
                                    value={company.float_risk_grade ?? '未计算'}
                                />
                            </div>
                        </InfoCard>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Sub-components ────────────────────────────────────────────────

function StatusBadge({ status, label }: { status: number; label: string }) {
    const colors: Record<number, string> = {
        0: 'border-amber-500/30 bg-amber-600/10 text-amber-400',
        1: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400',
        2: 'border-slate-500/30 bg-slate-600/10 text-slate-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colors[status] ?? colors[2]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${status === 1 ? 'animate-pulse bg-emerald-400' : 'bg-current'}`}
            />
            {label}
        </span>
    );
}

const accentMap = {
    blue: {
        border: 'border-blue-900/40',
        icon: 'bg-blue-600/15 border-blue-600/20',
        iconColor: 'text-blue-400',
    },
    cyan: {
        border: 'border-cyan-900/40',
        icon: 'bg-cyan-600/15 border-cyan-600/20',
        iconColor: 'text-cyan-400',
    },
    violet: {
        border: 'border-violet-900/40',
        icon: 'bg-violet-600/15 border-violet-600/20',
        iconColor: 'text-violet-400',
    },
    amber: {
        border: 'border-amber-900/40',
        icon: 'bg-amber-600/15 border-amber-600/20',
        iconColor: 'text-amber-400',
    },
};

function InfoCard({
    title,
    icon: Icon,
    accent = 'blue',
    children,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: keyof typeof accentMap;
    children: React.ReactNode;
}) {
    const a = accentMap[accent];

    return (
        <div className={`rounded-xl border ${a.border} bg-[#0d1530] p-6`}>
            <div className="mb-5 flex items-center gap-2">
                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${a.icon}`}
                >
                    <Icon className={`h-4 w-4 ${a.iconColor}`} />
                </div>
                <h2 className="text-sm font-semibold text-slate-200">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );
}

function ReadonlyField({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
            <dt className="mb-1 text-xs text-slate-600">{label}</dt>
            <dd className="text-sm font-medium text-slate-300">
                {value || '未填写'}
            </dd>
        </div>
    );
}

function SelectField({
    label,
    value,
    displayValue,
    options,
    editing,
    onChange,
}: {
    label: string;
    value: string;
    displayValue?: string;
    options: { id: number; title: string }[];
    editing: boolean;
    onChange: (v: string) => void;
}) {
    return (
        <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
            <dt className="mb-1.5 text-xs text-slate-600">{label}</dt>
            {editing ? (
                <div className="relative">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${inputCls} cursor-pointer appearance-none pr-8`}
                    >
                        <option
                            value=""
                            disabled
                            className="bg-[#0d1530] text-slate-500"
                        >
                            请选择{label}
                        </option>
                        {options.map((o) => (
                            <option
                                key={o.id}
                                value={String(o.id)}
                                className="bg-[#0d1530] text-slate-200"
                            >
                                {o.title}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                        <svg
                            className="h-3.5 w-3.5 text-slate-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>
            ) : (
                <dd className="text-sm font-medium text-slate-300">
                    {displayValue || '未填写'}
                </dd>
            )}
        </div>
    );
}

function EditableField({
    label,
    required,
    value,
    editing,
    onChange,
    type = 'text',
    multiline,
    rows = 2,
}: {
    label: string;
    required?: boolean;
    value: string;
    editing: boolean;
    onChange: (v: string) => void;
    type?: string;
    multiline?: boolean;
    rows?: number;
}) {
    return (
        <div className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
            <dt className="mb-1.5 text-xs text-slate-600">
                {label}
                {required && <span className="ml-0.5 text-blue-500">*</span>}
            </dt>
            {editing ? (
                multiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={rows}
                        className={`${inputCls} resize-none leading-relaxed`}
                        placeholder={`请输入${label}`}
                    />
                ) : type === 'date' ? (
                    <DatePicker value={value} onChange={onChange} />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={inputCls}
                        placeholder={`请输入${label}`}
                    />
                )
            ) : (
                <dd className="text-sm leading-relaxed font-medium whitespace-pre-line text-slate-300">
                    {value || '未填写'}
                </dd>
            )}
        </div>
    );
}

function GeoRangePreview({
    value,
    editing,
    onOpenDrawer,
}: {
    value?: string;
    editing: boolean;
    onOpenDrawer: () => void;
}) {
    if (!value) {
        return (
            <div className="flex items-center gap-3">
                <dd className="text-sm text-slate-500">未设置</dd>
                {editing && (
                    <button
                        onClick={onOpenDrawer}
                        className="text-xs text-blue-500 transition-colors hover:text-blue-400"
                    >
                        点击绘制
                    </button>
                )}
            </div>
        );
    }

    let coords: [number, number][] = [];

    try {
        coords = JSON.parse(value);
    } catch {
        /* noop */
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {coords.slice(0, 3).map(([lat, lng], i) => (
                    <span
                        key={i}
                        className="inline-block rounded bg-blue-900/30 px-2 py-0.5 font-mono text-[10px] text-blue-300"
                    >
                        [{lat.toFixed(4)}, {lng.toFixed(4)}]
                    </span>
                ))}
                {coords.length > 3 && (
                    <span className="inline-block rounded bg-blue-900/20 px-2 py-0.5 text-[10px] text-slate-500">
                        +{coords.length - 3} 个顶点
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-600">
                {coords.length} 个顶点 · 已定义地理围栏
            </p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid animate-pulse gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                {[200, 240, 160].map((h, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-6"
                        style={{ minHeight: h }}
                    >
                        <div className="mb-5 h-4 w-28 rounded bg-slate-800" />
                        <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="h-14 rounded-lg bg-slate-800/50"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="space-y-6">
                {[220, 140].map((h, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-6"
                        style={{ minHeight: h }}
                    >
                        <div className="mb-5 h-4 w-24 rounded bg-slate-800" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="h-12 rounded-lg bg-slate-800/50"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 p-5 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
        </div>
    );
}

const inputCls =
    'w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2 px-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30';
