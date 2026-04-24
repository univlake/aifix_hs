import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    Download,
    Upload,
    FileDown,
    Copy,
} from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DatePicker } from '@/components/shared/DatePicker';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse } from '@/types/models';

// ── Types ──────────────────────────────────────────────────────────

interface SpecialEquipmentRow {
    id: number;
    equipment_name: string | null;
    special_type_id: number | null;
    special_type: { id: number; title: string } | null;
    utilized_location: string | null;
    serial_number: string | null;
    norm_model1: string | null;
    norm_model2: string | null;
    norm_model3: string | null;
    norm_model4: string | null;
    use_time: string | null;
    valid_period: string | null;
    inspect_unit: string | null;
    maintain_info: string | null;
    comment: string | null;
}

interface SpecType {
    id: number;
    title: string;
}

// ── Spec field config ──────────────────────────────────────────────

type SpecKey = 'norm_model1' | 'norm_model2' | 'norm_model3' | 'norm_model4';

interface SpecFieldDef {
    key: SpecKey;
    label: string;
    unit?: string;
    inputType: 'text' | 'select';
    options?: { value: string; label: string }[];
}

const SPEC_CONFIGS: Record<number, SpecFieldDef[]> = {
    2: [
        {
            key: 'norm_model1',
            label: '设计压力',
            unit: 'MPa',
            inputType: 'text',
        },
        { key: 'norm_model2', label: '容积', unit: 'm³', inputType: 'text' },
        { key: 'norm_model3', label: '盛放介质', inputType: 'text' },
    ],
    3: [
        {
            key: 'norm_model1',
            label: '设计压力',
            unit: 'MPa',
            inputType: 'text',
        },
        {
            key: 'norm_model2',
            label: '设计温度',
            unit: '°C',
            inputType: 'text',
        },
        { key: 'norm_model3', label: '管径', unit: 'cm', inputType: 'text' },
        { key: 'norm_model4', label: '输送介质', inputType: 'text' },
    ],
    4: [
        {
            key: 'norm_model1',
            label: '用途',
            inputType: 'select',
            options: [
                { value: '载人', label: '载人' },
                { value: '载重', label: '载重' },
            ],
        },
        { key: 'norm_model2', label: '载重', unit: '吨', inputType: 'text' },
    ],
};

// ── Shared styles ──────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

// ── ValidPeriodCell ────────────────────────────────────────────────

function ValidPeriodCell({ value }: { value: unknown }) {
    if (!value) {
        return <span className="text-slate-700">—</span>;
    }

    const date = new Date(value as string);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    const expired = daysLeft < 0;
    const nearExpiry = daysLeft >= 0 && daysLeft <= 30;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
                expired
                    ? 'border border-red-500/20 bg-red-600/10 text-red-400'
                    : nearExpiry
                      ? 'border border-amber-500/20 bg-amber-600/10 text-amber-400'
                      : 'text-slate-400',
            )}
        >
            {expired && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            )}
            {nearExpiry && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
            {value as string}
        </span>
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

// ── Main page ──────────────────────────────────────────────────────

export default function SpecialEquipmentIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;
    const { canWrite } = usePermission();
    const canCreate = canWrite('special-equipment.create');
    const canUpdate = canWrite('special-equipment.update');
    const canDelete = canWrite('special-equipment.delete');

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
    } = useApiList<SpecialEquipmentRow>({
        endpoint: '/special-equipment',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/special-equipment');

    const [searchValue, setSearchValue] = useState('');
    const [specialTypes, setSpecialTypes] = useState<SpecType[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<SpecialEquipmentRow>();
    const detailItem = detail.data;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Form state
    const emptyForm = {
        equipment_name: '',
        special_type_id: '',
        utilized_location: '',
        serial_number: '',
        norm_model1: '',
        norm_model2: '',
        norm_model3: '',
        norm_model4: '',
        use_time: '',
        valid_period: '',
        inspect_unit: '',
        maintain_info: '',
        comment: '',
    };
    const [form, setForm] = useState<Record<string, string>>(emptyForm);
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    // Import/export state
    const importRef = useRef<HTMLInputElement>(null);
    const serialNumberRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [copying, setCopying] = useState(false);
    const [actionMsg, setActionMsg] = useState('');
    const [pendingFillCount, setPendingFillCount] = useState(0);

    // Load special types for form select
    useEffect(() => {
        api.get<ApiResponse<{ data: SpecType[] }>>('/special-types', {
            params: { per_page: 200 },
        })
            .then(({ data: res }) => setSpecialTypes(res.data?.data ?? []))
            .catch(() => {});
    }, []);

    const handleSearch = useCallback(
        (val: string) => {
            setSearchValue(val);
            search({ equipment_name: val || undefined });
        },
        [search],
    );

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (row: SpecialEquipmentRow) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            equipment_name: row.equipment_name ?? '',
            special_type_id:
                row.special_type_id != null ? String(row.special_type_id) : '',
            utilized_location: row.utilized_location ?? '',
            serial_number: row.serial_number ?? '',
            norm_model1: row.norm_model1 ?? '',
            norm_model2: row.norm_model2 ?? '',
            norm_model3: row.norm_model3 ?? '',
            norm_model4: row.norm_model4 ?? '',
            use_time: row.use_time ?? '',
            valid_period: row.valid_period ?? '',
            inspect_unit: row.inspect_unit ?? '',
            maintain_info: row.maintain_info ?? '',
            comment: row.comment ?? '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const typeId =
                form.special_type_id !== ''
                    ? Number(form.special_type_id)
                    : null;
            const specConfig = typeId ? (SPEC_CONFIGS[typeId] ?? []) : [];
            const usedSpecKeys = new Set(specConfig.map((f) => f.key));

            const payload: Record<string, unknown> = {
                equipment_name: form.equipment_name || null,
                special_type_id: typeId,
                utilized_location: form.utilized_location || null,
                serial_number: form.serial_number || null,
                use_time: form.use_time || null,
                valid_period: form.valid_period || null,
                inspect_unit: form.inspect_unit || null,
                maintain_info: form.maintain_info || null,
                comment: form.comment || null,
            };

            // Only send spec fields relevant to the selected type; null out others
            (
                [
                    'norm_model1',
                    'norm_model2',
                    'norm_model3',
                    'norm_model4',
                ] as const
            ).forEach((key) => {
                payload[key] = usedSpecKeys.has(key) ? form[key] || null : null;
            });

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
        setDeleteLabel('');
        reload();
    };

    // ── Import / Export / Template ───────────────────────────────

    const handleTemplate = async () => {
        const response = await api.get('/special-equipment/template', {
            responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = '特种设备导入模板.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !companyId) {
            return;
        }

        setImporting(true);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('company_id', String(companyId));
            await api.post('/special-equipment/import', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            flashMsg('导入成功');
            reload();
        } catch (err: unknown) {
            flashMsg(getErrorMessage(err, '导入失败'));
        } finally {
            setImporting(false);

            if (importRef.current) {
                importRef.current.value = '';
            }
        }
    };

    const handleExport = async () => {
        if (!companyId) {
            return;
        }

        setExporting(true);

        try {
            const response = await api.get('/special-equipment/export', {
                params: {
                    company_id: companyId,
                    equipment_name: searchValue || undefined,
                },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = '特种设备列表.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    const handleCopy = async () => {
        if (!selectedIds.size) {
            return;
        }

        setCopying(true);

        try {
            const { data: res } = await api.post<
                ApiResponse<{ ids: number[]; count: number }>
            >('/special-equipment/copy', {
                ids: Array.from(selectedIds),
            });
            const newIds: number[] = res.data?.ids ?? [];
            const count = res.data?.count ?? newIds.length;
            setSelectedIds(new Set());

            if (newIds.length === 1) {
                // Single copy: fetch new record and open edit modal so user fills permit number
                const { data: itemRes } = await api.get<
                    ApiResponse<SpecialEquipmentRow>
                >(`/special-equipment/${newIds[0]}`);
                reload();
                openEdit(itemRes.data);
                // Focus the serial_number field after the modal renders
                setTimeout(() => serialNumberRef.current?.focus(), 120);
            } else {
                reload();
                setPendingFillCount(count);
            }
        } catch (err: unknown) {
            flashMsg(getErrorMessage(err, '复制失败'));
        } finally {
            setCopying(false);
        }
    };

    const flashMsg = (msg: string) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(''), 3000);
    };

    // ── Checkbox helpers ──────────────────────────────────────────

    const toggleRow = (id: number) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });

    const allPageSelected =
        data.length > 0 && data.every((r) => selectedIds.has(r.id));
    const somePageSelected = data.some((r) => selectedIds.has(r.id));

    const toggleAll = () => {
        if (allPageSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                data.forEach((r) => next.delete(r.id));

                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                data.forEach((r) => next.add(r.id));

                return next;
            });
        }
    };

    // ── Table columns ──────────────────────────────────────────────

    const columns: ColumnDef<SpecialEquipmentRow>[] = [
        {
            id: 'select',
            header: () => (
                <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                        if (el) {
                            el.indeterminate =
                                somePageSelected && !allPageSelected;
                        }
                    }}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-blue-900/60 bg-[#070d1f] accent-blue-500"
                />
            ),
            size: 40,
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.original.id)}
                    onChange={() => toggleRow(row.original.id)}
                    className="h-3.5 w-3.5 rounded border-blue-900/60 bg-[#070d1f] accent-blue-500"
                />
            ),
        },
        {
            accessorKey: 'equipment_name',
            header: '设备名称',
            cell: ({ row }) =>
                row.original.equipment_name ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'special_type',
            header: '设备类型',
            size: 120,
            cell: ({ row }) => {
                const t = row.original.special_type?.title;

                return t ? (
                    <span className="rounded-md border border-blue-900/40 bg-blue-600/8 px-2 py-0.5 text-xs text-blue-400">
                        {t}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        {
            accessorKey: 'utilized_location',
            header: '使用位置',
            size: 130,
            cell: ({ row }) =>
                row.original.utilized_location ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'serial_number',
            header: '使用证编号/场内机动车牌证',
            size: 200,
            cell: ({ row }) =>
                row.original.serial_number ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'use_time',
            header: '投用时间',
            size: 110,
            cell: ({ row }) =>
                row.original.use_time ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'valid_period',
            header: '检验有效期',
            size: 130,
            cell: ({ row }) => (
                <ValidPeriodCell value={row.original.valid_period} />
            ),
        },
        {
            accessorKey: 'inspect_unit',
            header: '检验单位',
            size: 150,
            cell: ({ row }) =>
                row.original.inspect_unit ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
    ];

    columns.push({
        id: 'actions',
        header: '操作',
        size: readOnly ? 96 : 164,
        cell: ({ row }) => (
            <div className="flex items-center gap-0.5">
                <DetailButton
                    row={row.original}
                    onOpen={detail.openDetail}
                    className="flex h-8 min-w-[64px] items-center justify-center gap-1 rounded-md px-3 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300"
                />
                {canUpdate && (
                    <button
                        onClick={() => openEdit(row.original)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => {
                            setDeleteId(row.original.id);
                            setDeleteLabel(row.original.equipment_name ?? '');
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        ),
    });

    // ── Spec fields in form ────────────────────────────────────────

    const currentTypeId =
        form.special_type_id !== '' ? Number(form.special_type_id) : null;
    const specFields = currentTypeId ? (SPEC_CONFIGS[currentTypeId] ?? []) : [];
    const detailSpecFields = detailItem?.special_type_id
        ? (SPEC_CONFIGS[detailItem.special_type_id] ?? [])
        : [];
    const detailSpecLabels = Object.fromEntries(
        detailSpecFields.map((field) => [field.key, field.label]),
    );
    // Hide spec keys that don't apply to this equipment's type (only when a
    // type is set; with no type we don't know what applies, so show all).
    const allSpecKeys: SpecKey[] = [
        'norm_model1',
        'norm_model2',
        'norm_model3',
        'norm_model4',
    ];
    const detailHiddenSpecKeys = detailItem?.special_type_id
        ? allSpecKeys.filter(
              (k) => !detailSpecFields.some((f) => f.key === k),
          )
        : [];

    // When type changes, clear spec fields
    const handleTypeChange = (val: string) => {
        set('special_type_id', val);
        setForm((f) => ({
            ...f,
            special_type_id: val,
            norm_model1: '',
            norm_model2: '',
            norm_model3: '',
            norm_model4: '',
        }));
    };

    // ── Toolbar ───────────────────────────────────────────────────

    const toolbar = (
        <div className="flex items-center gap-2">
            {actionMsg && (
                <span className="text-xs text-blue-400">{actionMsg}</span>
            )}
            {selectedIds.size > 0 && canCreate && (
                <button
                    onClick={handleCopy}
                    disabled={copying}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/20 disabled:pointer-events-none disabled:opacity-50"
                >
                    {copying ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                    复制已选 ({selectedIds.size})
                </button>
            )}
            <button
                onClick={handleTemplate}
                className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
            >
                <Download className="h-3.5 w-3.5" />
                下载模板
            </button>
            {canCreate && (
                <>
                    <button
                        onClick={() => importRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {importing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Upload className="h-3.5 w-3.5" />
                        )}
                        导入
                    </button>
                    <input
                        ref={importRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportFile}
                        className="hidden"
                    />
                </>
            )}
            <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
            >
                {exporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <FileDown className="h-3.5 w-3.5" />
                )}
                导出
            </button>
        </div>
    );

    // ── Render ─────────────────────────────────────────────────────

    return (
        <>
            <Head title="特种设备" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        特种设备
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
                        新增特种设备
                    </button>
                )}
            </div>

            {pendingFillCount > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-600/8 px-4 py-3">
                    <p className="text-xs text-amber-400">
                        已复制{' '}
                        <span className="font-semibold">
                            {pendingFillCount}
                        </span>{' '}
                        条记录，新记录的使用证编号/场内机动车牌证已清空，请逐一编辑填写唯一编号后保存。
                    </p>
                    <button
                        onClick={() => setPendingFillCount(0)}
                        className="ml-4 text-amber-600 hover:text-amber-400"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索设备名称..."
                searchValue={searchValue}
                onSearchChange={handleSearch}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
                toolbar={toolbar}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="特种设备详情"
                data={detailItem as Record<string, unknown> | null}
                onClose={detail.close}
                hiddenKeys={detailHiddenSpecKeys}
                labels={{
                    equipment_name: '设备名称',
                    special_type: '设备类型',
                    title: '类型名称',
                    utilized_location: '使用位置',
                    serial_number: '使用证编号/场内机动车牌证',
                    norm_model1: detailSpecLabels.norm_model1 ?? '规格参数1',
                    norm_model2: detailSpecLabels.norm_model2 ?? '规格参数2',
                    norm_model3: detailSpecLabels.norm_model3 ?? '规格参数3',
                    norm_model4: detailSpecLabels.norm_model4 ?? '规格参数4',
                    use_time: '投用时间',
                    valid_period: '检验有效期',
                    inspect_unit: '检验单位',
                    maintain_info: '维护信息',
                    comment: '备注',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}特种设备
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId
                                ? '修改现有记录信息'
                                : '填写信息后保存新记录'}
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
                    <div className="space-y-4">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* 设备名称 */}
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    设备名称{' '}
                                    <span className="ml-1 text-blue-500">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={form.equipment_name}
                                    onChange={(e) =>
                                        set('equipment_name', e.target.value)
                                    }
                                    placeholder="请输入设备名称"
                                    className={inputCls}
                                />
                            </div>

                            {/* 设备类型 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    设备类型
                                </label>
                                <select
                                    value={form.special_type_id}
                                    onChange={(e) =>
                                        handleTypeChange(e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择类型
                                    </option>
                                    {specialTypes.map((t) => (
                                        <option
                                            key={t.id}
                                            value={String(t.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {t.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 使用位置 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    使用位置
                                </label>
                                <input
                                    type="text"
                                    value={form.utilized_location}
                                    onChange={(e) =>
                                        set('utilized_location', e.target.value)
                                    }
                                    placeholder="设备使用位置"
                                    className={inputCls}
                                />
                            </div>

                            {/* 使用证编号 */}
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    使用证编号/场内机动车牌证
                                    {!form.serial_number && editingId && (
                                        <span className="ml-2 text-amber-500 normal-case">
                                            请填写唯一编号
                                        </span>
                                    )}
                                </label>
                                <input
                                    ref={serialNumberRef}
                                    type="text"
                                    value={form.serial_number}
                                    onChange={(e) =>
                                        set('serial_number', e.target.value)
                                    }
                                    placeholder="请输入编号（每台设备唯一）"
                                    className={cn(
                                        inputCls,
                                        !form.serial_number && editingId
                                            ? 'border-amber-500/50 focus:border-amber-500/70'
                                            : '',
                                    )}
                                />
                            </div>

                            {/* Conditional spec fields */}
                            {specFields.map((sf) => (
                                <div key={sf.key}>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        {sf.label}
                                        {sf.unit && (
                                            <span className="ml-1 text-slate-600 normal-case">
                                                ({sf.unit})
                                            </span>
                                        )}
                                    </label>
                                    {sf.inputType === 'select' ? (
                                        <select
                                            value={form[sf.key]}
                                            onChange={(e) =>
                                                set(sf.key, e.target.value)
                                            }
                                            className={cn(
                                                inputCls,
                                                'cursor-pointer appearance-none',
                                            )}
                                        >
                                            <option
                                                value=""
                                                className="bg-[#0d1530]"
                                            >
                                                请选择
                                            </option>
                                            {sf.options?.map((o) => (
                                                <option
                                                    key={o.value}
                                                    value={o.value}
                                                    className="bg-[#0d1530]"
                                                >
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={form[sf.key]}
                                            onChange={(e) =>
                                                set(sf.key, e.target.value)
                                            }
                                            placeholder={
                                                sf.unit
                                                    ? `单位: ${sf.unit}`
                                                    : undefined
                                            }
                                            className={inputCls}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* 投用时间 / 检验有效期 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    投用时间
                                </label>
                                <DatePicker
                                    value={form.use_time}
                                    onChange={(v) => set('use_time', v)}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    检验有效期
                                </label>
                                <DatePicker
                                    value={form.valid_period}
                                    onChange={(v) => set('valid_period', v)}
                                />
                            </div>

                            {/* 检验单位 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    检验单位
                                </label>
                                <input
                                    type="text"
                                    value={form.inspect_unit}
                                    onChange={(e) =>
                                        set('inspect_unit', e.target.value)
                                    }
                                    placeholder="检验机构名称"
                                    className={inputCls}
                                />
                            </div>

                            {/* 维护信息 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    维护信息
                                </label>
                                <input
                                    type="text"
                                    value={form.maintain_info}
                                    onChange={(e) =>
                                        set('maintain_info', e.target.value)
                                    }
                                    placeholder="维护情况简述"
                                    className={inputCls}
                                />
                            </div>

                            {/* 备注 */}
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    备注
                                </label>
                                <textarea
                                    value={form.comment}
                                    onChange={(e) =>
                                        set('comment', e.target.value)
                                    }
                                    rows={3}
                                    placeholder="其他备注信息"
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                        </div>
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
                        删除特种设备
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
