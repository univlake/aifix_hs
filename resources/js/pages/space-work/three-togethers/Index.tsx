import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Check,
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
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

// ── Constants ─────────────────────────────────────────────────────

function deriveStatus(row: ThreeTogether): StatusValue | '' {
    if (row.complete_comment || row.acceptance) {
        return '完成验收/评价';
    }

    if (row.construction_comment || row.safety_requirements) {
        return '施工中';
    }

    if (row.evaluation_unit_id || row.write_time) {
        return '完成预评价/设计专篇';
    }

    if (row.design_unit_id || row.design_annex_url) {
        return '设计中';
    }

    return '';
}

const PROJECT_TYPES = [
    { value: '新建项目', label: '新建项目' },
    { value: '改建项目', label: '改建项目' },
    { value: '扩建项目', label: '扩建项目' },
    {
        value: '四新产品/新技术/新设备/新材料',
        label: '四新产品/新技术/新设备/新材料',
    },
];

const STATUSES = [
    { value: '设计中', label: '设计中' },
    { value: '完成预评价/设计专篇', label: '完成预评价/设计专篇' },
    { value: '施工中', label: '施工中' },
    { value: '完成验收/评价', label: '完成验收/评价' },
] as const;

type StatusValue = (typeof STATUSES)[number]['value'];

interface ThreeTogether {
    id: number;
    name: string;
    three_together_type: string;
    establish_time: string;
    establish_section: string;
    status: StatusValue | string;
    design_unit_id: number | null;
    design_annex_url: string;
    evaluation_unit_id: number | null;
    write_time: string;
    construction_comment: string;
    safety_requirements: string;
    complete_comment: string;
    acceptance: string;
    design_unit?: { id: number; name: string } | null;
    evaluation_unit?: { id: number; name: string } | null;
}

type FormData = Partial<ThreeTogether>;

interface SelectOption {
    value: string;
    label: string;
}

// ── Main page ─────────────────────────────────────────────────────

export default function ThreeTogethersIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;
    const { canWrite } = usePermission();
    const canCreate = canWrite('three-togethers.create');
    const canUpdate = canWrite('three-togethers.update');
    const canDelete = canWrite('three-togethers.delete');

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
    } = useApiList<ThreeTogether>({
        endpoint: '/three-togethers',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/three-togethers');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<ThreeTogether>();
    const detailItem = detail.data;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<FormData>({});

    const [designUnits, setDesignUnits] = useState<SelectOption[]>([]);
    const [evaluationUnits, setEvaluationUnits] = useState<SelectOption[]>([]);

    useEffect(() => {
        const params = {
            per_page: 200,
            ...(companyId ? { company_id: companyId } : {}),
        };

        api.get<ApiResponse<{ data: { id: number; name: string }[] }>>(
            '/design-units',
            { params },
        )
            .then((res) => {
                setDesignUnits(
                    (res.data.data?.data ?? []).map((u) => ({
                        value: String(u.id),
                        label: u.name,
                    })),
                );
            })
            .catch(() => {});

        api.get<ApiResponse<{ data: { id: number; name: string }[] }>>(
            '/evaluation-units',
            { params },
        )
            .then((res) => {
                setEvaluationUnits(
                    (res.data.data?.data ?? []).map((u) => ({
                        value: String(u.id),
                        label: u.name,
                    })),
                );
            })
            .catch(() => {});
    }, [companyId]);

    const initForm = useCallback(
        (): FormData => ({
            name: '',
            three_together_type: '',
            establish_time: '',
            establish_section: '',
            status: '',
            design_unit_id: null,
            design_annex_url: '',
            evaluation_unit_id: null,
            write_time: '',
            construction_comment: '',
            safety_requirements: '',
            complete_comment: '',
            acceptance: '',
        }),
        [],
    );

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(initForm());
        setDialogOpen(true);
    };

    const openEdit = (row: ThreeTogether) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            name: row.name ?? '',
            three_together_type: row.three_together_type ?? '',
            establish_time: row.establish_time ?? '',
            establish_section: row.establish_section ?? '',
            status: deriveStatus(row) || row.status || '',
            design_unit_id: row.design_unit_id ?? null,
            design_annex_url: row.design_annex_url ?? '',
            evaluation_unit_id: row.evaluation_unit_id ?? null,
            write_time: row.write_time ?? '',
            construction_comment: row.construction_comment ?? '',
            safety_requirements: row.safety_requirements ?? '',
            complete_comment: row.complete_comment ?? '',
            acceptance: row.acceptance ?? '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = { ...form };

            if (companyId && !payload['company_id']) {
                payload['company_id'] = companyId;
            }

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

    const update = (key: keyof FormData, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    // Table columns
    const tableColumns: ColumnDef<ThreeTogether>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'name', header: '项目名称' },
        { accessorKey: 'three_together_type', header: '项目类型', size: 180 },
        { accessorKey: 'establish_time', header: '立项时间', size: 110 },
        { accessorKey: 'establish_section', header: '立项部门' },
        {
            accessorKey: 'status',
            header: '状态',
            size: 160,
            cell: ({ row }) => {
                const s = deriveStatus(row.original);
                const idx = STATUSES.findIndex((x) => x.value === s);

                return (
                    <span
                        className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            idx === 0 && 'bg-blue-600/15 text-blue-300',
                            idx === 1 && 'bg-purple-600/15 text-purple-300',
                            idx === 2 && 'bg-amber-600/15 text-amber-300',
                            idx === 3 && 'bg-green-600/15 text-green-300',
                            idx === -1 && 'bg-slate-600/15 text-slate-400',
                        )}
                    >
                        {s || '—'}
                    </span>
                );
            },
        },
    ];

    tableColumns.push({
        id: 'actions',
        header: '操作',
        size: readOnly ? 96 : 160,
        cell: ({ row }) => (
            <div className="flex items-center gap-0.5">
                <DetailButton row={row.original} onOpen={detail.openDetail} />
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
                        onClick={() => {
                            setDeleteId(row.original.id);
                            setDeleteLabel(row.original.name ?? '');
                        }}
                        title="删除"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        ),
    });

    const detailData = detailItem
        ? {
              ...detailItem,
              design_unit: detailItem.design_unit?.name ?? null,
              evaluation_unit: detailItem.evaluation_unit?.name ?? null,
              status: deriveStatus(detailItem) || detailItem.status || null,
          }
        : null;

    return (
        <>
            <Head title="三同时管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        三同时管理
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
                        新增三同时管理
                    </button>
                )}
            </div>

            <DataTable
                columns={tableColumns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索三同时项目..."
                searchValue={searchValue}
                onSearchChange={(val) => {
                    setSearchValue(val);
                    search({ name: val || undefined });
                }}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="三同时管理详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    name: '项目名称',
                    three_together_type: '项目类型',
                    establish_time: '立项时间',
                    establish_section: '立项部门',
                    status: '当前状态',
                    design_unit: '设计单位',
                    evaluation_unit: '评价机构',
                    design_annex_url: '设计文件附件',
                    write_time: '设计专篇编制日期',
                    construction_comment: '施工说明',
                    safety_requirements: '安全要求',
                    complete_comment: '竣工说明',
                    acceptance: '验收表',
                }}
            />

            {/* Create / Edit modal */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDialogOpen(false)}
                    />
                    <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-100">
                                    {editingId ? '编辑' : '新增'}三同时管理
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-600">
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

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-5 p-6">
                                {formError && (
                                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                {/* Base fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Field label="项目名称" required>
                                            <Input
                                                value={form.name ?? ''}
                                                onChange={(v) =>
                                                    update('name', v)
                                                }
                                                placeholder="请输入项目名称"
                                            />
                                        </Field>
                                    </div>
                                    <Field label="项目类型">
                                        <Select
                                            value={
                                                form.three_together_type ?? ''
                                            }
                                            onChange={(v) =>
                                                update('three_together_type', v)
                                            }
                                            options={PROJECT_TYPES}
                                        />
                                    </Field>
                                    <Field label="立项时间">
                                        <DateInput
                                            value={form.establish_time ?? ''}
                                            onChange={(v) =>
                                                update('establish_time', v)
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="立项部门"
                                        className="col-span-2"
                                    >
                                        <Input
                                            value={form.establish_section ?? ''}
                                            onChange={(v) =>
                                                update('establish_section', v)
                                            }
                                            placeholder="请输入立项部门"
                                        />
                                    </Field>
                                </div>

                                {/* Timeline status selector */}
                                <div>
                                    <p className="mb-3 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        当前状态
                                    </p>
                                    <StatusTimeline
                                        value={
                                            (form.status as StatusValue) ?? ''
                                        }
                                        onChange={(v) => update('status', v)}
                                    />
                                </div>

                                {/* Conditional fields */}
                                <ConditionalFields
                                    status={(form.status as StatusValue) ?? ''}
                                    form={form}
                                    update={update}
                                    designUnits={designUnits}
                                    evaluationUnits={evaluationUnits}
                                />
                            </div>
                        </div>

                        {/* Footer */}
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
                                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {formLoading && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {formLoading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {!!deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setDeleteId(null);
                            setDeleteLabel('');
                        }}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                        <div className="p-6">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                                <Trash2 className="h-5 w-5 text-red-400" />
                            </div>
                            <h2 className="mb-1 text-base font-semibold text-slate-100">
                                删除三同时管理
                            </h2>
                            <p className="text-sm text-slate-500">
                                确定要删除
                                {deleteLabel ? (
                                    <>
                                        {' '}
                                        &ldquo;
                                        <span className="font-medium text-slate-300">
                                            {deleteLabel}
                                        </span>
                                        &rdquo;
                                    </>
                                ) : (
                                    '这条记录'
                                )}
                                吗？此操作不可撤销。
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                            <button
                                onClick={() => {
                                    setDeleteId(null);
                                    setDeleteLabel('');
                                }}
                                className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={crud.loading}
                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {crud.loading && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {crud.loading ? '删除中...' : '确认删除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Timeline status selector ──────────────────────────────────────

function StatusTimeline({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: StatusValue) => void;
}) {
    const currentIdx = STATUSES.findIndex((s) => s.value === value);

    return (
        <div className="relative flex items-start">
            {/* Connector line */}
            <div className="absolute top-4 right-4 left-4 h-px bg-blue-900/40" />

            {STATUSES.map((status, idx) => {
                const isDone = currentIdx > idx;
                const isActive = currentIdx === idx;

                return (
                    <button
                        key={status.value}
                        type="button"
                        onClick={() => onChange(status.value)}
                        className="relative z-10 flex flex-1 flex-col items-center gap-2 px-1 text-center"
                    >
                        {/* Node */}
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                                isDone &&
                                    'border-blue-500 bg-blue-500 text-white',
                                isActive &&
                                    'border-blue-400 bg-blue-600/30 text-blue-300 ring-2 ring-blue-500/30',
                                !isDone &&
                                    !isActive &&
                                    'border-blue-900/60 bg-[#0d1530] text-slate-600',
                            )}
                        >
                            {isDone ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : (
                                <span className="text-xs font-semibold">
                                    {idx + 1}
                                </span>
                            )}
                        </div>
                        {/* Label */}
                        <span
                            className={cn(
                                'text-xs leading-tight',
                                isActive && 'font-medium text-blue-300',
                                isDone && 'text-slate-400',
                                !isDone && !isActive && 'text-slate-600',
                            )}
                        >
                            {status.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ── Conditional fields ────────────────────────────────────────────

function ConditionalFields({
    status,
    form,
    update,
    designUnits,
    evaluationUnits,
}: {
    status: StatusValue | string;
    form: FormData;
    update: (key: keyof FormData, value: unknown) => void;
    designUnits: SelectOption[];
    evaluationUnits: SelectOption[];
}) {
    if (!status) {
        return null;
    }

    switch (status) {
        case '设计中':
            return (
                <div className="grid grid-cols-2 gap-4">
                    <Field label="设计单位">
                        <Select
                            value={String(form.design_unit_id ?? '')}
                            onChange={(v) =>
                                update('design_unit_id', v ? Number(v) : null)
                            }
                            options={designUnits}
                        />
                    </Field>
                    <Field label="设计文件附件">
                        <OssUploadField
                            value={(form.design_annex_url as string) ?? ''}
                            onChange={(url) => update('design_annex_url', url)}
                        />
                    </Field>
                </div>
            );

        case '完成预评价/设计专篇':
            return (
                <div className="grid grid-cols-2 gap-4">
                    <Field label="评价机构">
                        <Select
                            value={String(form.evaluation_unit_id ?? '')}
                            onChange={(v) =>
                                update(
                                    'evaluation_unit_id',
                                    v ? Number(v) : null,
                                )
                            }
                            options={evaluationUnits}
                        />
                    </Field>
                    <Field label="设计专篇编制日期">
                        <DateInput
                            value={form.write_time ?? ''}
                            onChange={(v) => update('write_time', v)}
                        />
                    </Field>
                </div>
            );

        case '施工中':
            return (
                <div className="grid grid-cols-1 gap-4">
                    <Field label="安全要求">
                        <Textarea
                            value={form.safety_requirements ?? ''}
                            onChange={(v) => update('safety_requirements', v)}
                        />
                    </Field>
                    <Field label="施工说明">
                        <Textarea
                            value={form.construction_comment ?? ''}
                            onChange={(v) => update('construction_comment', v)}
                        />
                    </Field>
                </div>
            );

        case '完成验收/评价':
            return (
                <div className="grid grid-cols-2 gap-4">
                    <Field label="竣工说明" className="col-span-2">
                        <Textarea
                            value={form.complete_comment ?? ''}
                            onChange={(v) => update('complete_comment', v)}
                        />
                    </Field>
                    <Field label="验收表">
                        <OssUploadField
                            value={(form.acceptance as string) ?? ''}
                            onChange={(url) => update('acceptance', url)}
                        />
                    </Field>
                </div>
            );

        default:
            return null;
    }
}

// ── Primitive field components ────────────────────────────────────

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function Field({
    label,
    required,
    className,
    children,
}: {
    label: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-1 text-blue-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function Input({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
        />
    );
}

function DateInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return <DatePicker value={value} onChange={onChange} />;
}

function Textarea({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={cn(inputClass, 'resize-none')}
        />
    );
}

function Select({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, 'cursor-pointer appearance-none')}
        >
            <option value="" disabled className="bg-[#0d1530]">
                请选择
            </option>
            {options.map((opt) => (
                <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[#0d1530]"
                >
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
