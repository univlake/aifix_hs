import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
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

// ── Types ──────────────────────────────────────────────────────────

interface ProcessRow {
    id: number;
    process_type_id: number | null;
    process_type: { id: number; title: string } | null;
    position: string | null;
    hazardous_chemical_id: number | null;
    hazardous_chemical: { id: number; name: string } | null;
    dangerous_equipment_id: number | null;
    dangerous_equipment: { id: number; equipment_name: string } | null;
    other_equipment_name: string | null;
    operating_people_num: string | null;
    is_online_test: number;
    is_automatic: number;
    is_control: number;
    is_dust: number;
}

interface Option {
    id: number;
    label: string;
}

// ── Switch flags config ────────────────────────────────────────────

const SWITCH_FIELDS: { key: string; label: string }[] = [
    { key: 'is_online_test', label: '在线监测' },
    { key: 'is_automatic', label: '自动化控制' },
    { key: 'is_control', label: '控制措施' },
    { key: 'is_dust', label: '涉及粉尘' },
];

// ── Shared styles ──────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

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

// ── Page ───────────────────────────────────────────────────────────

export default function HazardousProcessIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;
    const { canWrite } = usePermission();
    const canCreate = canWrite('hazardous-processes.create');
    const canUpdate = canWrite('hazardous-processes.update');
    const canDelete = canWrite('hazardous-processes.delete');

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
    } = useApiList<ProcessRow>({
        endpoint: '/hazardous-processes',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/hazardous-processes');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<ProcessRow>();
    const detailItem = detail.data;
    const [deleteItem, setDeleteItem] = useState<ProcessRow | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Reference data
    const [processTypes, setProcessTypes] = useState<Option[]>([]);
    const [chemicals, setChemicals] = useState<Option[]>([]);
    const [equipment, setEquipment] = useState<Option[]>([]);

    const emptyForm = () => ({
        process_type_id: '',
        position: '',
        hazardous_chemical_id: '',
        dangerous_equipment_id: '',
        other_equipment_name: '',
        operating_people_num: '',
        is_online_test: '0',
        is_automatic: '0',
        is_control: '0',
        is_dust: '0',
    });
    const [form, setForm] = useState<Record<string, string>>(emptyForm());
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const loadOptions = useCallback(async () => {
        try {
            const [ptRes, chRes, eqRes] = await Promise.all([
                api.get('/process-types', { params: { per_page: 200 } }),
                api.get('/hazardous-chemicals', {
                    params: {
                        per_page: 200,
                        ...(companyId ? { company_id: companyId } : {}),
                    },
                }),
                api.get('/dangerous-equipment', {
                    params: {
                        per_page: 200,
                        ...(companyId ? { company_id: companyId } : {}),
                    },
                }),
            ]);
            setProcessTypes(
                (ptRes.data?.data?.data ?? []).map((x: any) => ({
                    id: x.id,
                    label: x.title,
                })),
            );
            setChemicals(
                (chRes.data?.data?.data ?? []).map((x: any) => ({
                    id: x.id,
                    label: x.name,
                })),
            );
            setEquipment(
                (eqRes.data?.data?.data ?? []).map((x: any) => ({
                    id: x.id,
                    label: x.equipment_name,
                })),
            );
        } catch {
            // silently ignore
        }
    }, [companyId]);

    const openCreate = async () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        await loadOptions();
        setDialogOpen(true);
    };

    const openEdit = async (row: ProcessRow) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            process_type_id: row.process_type_id
                ? String(row.process_type_id)
                : '',
            position: row.position ?? '',
            hazardous_chemical_id: row.hazardous_chemical_id
                ? String(row.hazardous_chemical_id)
                : '',
            dangerous_equipment_id: row.dangerous_equipment_id
                ? String(row.dangerous_equipment_id)
                : '',
            other_equipment_name: row.other_equipment_name ?? '',
            operating_people_num: row.operating_people_num ?? '',
            is_online_test: String(row.is_online_test ?? 0),
            is_automatic: String(row.is_automatic ?? 0),
            is_control: String(row.is_control ?? 0),
            is_dust: String(row.is_dust ?? 0),
        });
        await loadOptions();
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                process_type_id: form.process_type_id
                    ? Number(form.process_type_id)
                    : null,
                position: form.position || null,
                hazardous_chemical_id: form.hazardous_chemical_id
                    ? Number(form.hazardous_chemical_id)
                    : null,
                dangerous_equipment_id: form.dangerous_equipment_id
                    ? Number(form.dangerous_equipment_id)
                    : null,
                other_equipment_name: form.other_equipment_name || null,
                operating_people_num: form.operating_people_num || null,
                is_online_test: Number(form.is_online_test),
                is_automatic: Number(form.is_automatic),
                is_control: Number(form.is_control),
                is_dust: Number(form.is_dust),
            };

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
        if (!deleteItem) {
            return;
        }

        await crud.remove(deleteItem.id);
        setDeleteItem(null);
        reload();
    };

    // ── Table columns ─────────────────────────────────────────────

    const columns: ColumnDef<ProcessRow>[] = [
        {
            accessorKey: 'process_type',
            header: '工艺名称',
            cell: ({ row }) =>
                row.original.process_type?.title ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'position',
            header: '所在位置',
            size: 140,
            cell: ({ row }) =>
                row.original.position ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'operating_people_num',
            header: '操作人数',
            size: 80,
            cell: ({ row }) =>
                row.original.operating_people_num ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'flags',
            header: '功能配置',
            cell: ({ row }) => {
                const active = SWITCH_FIELDS.filter(
                    (f) => row.original[f.key as keyof ProcessRow],
                );

                if (!active.length) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {active.map((f) => (
                            <span
                                key={f.key}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-600/8 px-1.5 py-0.5 text-[10px] text-emerald-400"
                            >
                                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                {f.label}
                            </span>
                        ))}
                    </div>
                );
            },
        },
    ];

    columns.push({
        id: 'actions',
        header: '操作',
        size: readOnly ? 96 : 160,
        cell: ({ row }) => (
            <div className="flex items-center gap-0.5">
                <DetailButton row={row.original} onOpen={detail.openDetail} />
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
                        onClick={() => setDeleteItem(row.original)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
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
              process_type: detailItem.process_type?.title ?? null,
              hazardous_chemical: detailItem.hazardous_chemical?.name ?? null,
              dangerous_equipment:
                  detailItem.dangerous_equipment?.equipment_name ?? null,
              is_online_test: detailItem.is_online_test === 1 ? '是' : '否',
              is_automatic: detailItem.is_automatic === 1 ? '是' : '否',
              is_control: detailItem.is_control === 1 ? '是' : '否',
              is_dust: detailItem.is_dust === 1 ? '是' : '否',
          }
        : null;

    // ── Render ────────────────────────────────────────────────────

    return (
        <>
            <Head title="高危险工艺" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        高危险工艺
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
                        新增高危险工艺
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索工艺位置..."
                searchValue={searchValue}
                onSearchChange={(v) => {
                    setSearchValue(v);
                    search({ position: v || undefined });
                }}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="较危险工艺详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    process_type: '工艺名称',
                    position: '所在位置',
                    hazardous_chemical: '使用物料',
                    dangerous_equipment: '使用设备',
                    other_equipment_name: '其他设备名称',
                    operating_people_num: '操作人数',
                    is_online_test: '在线监测',
                    is_automatic: '自动化控制',
                    is_control: '控制措施',
                    is_dust: '涉及粉尘',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}高危险工艺
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId
                                ? '修改工艺档案信息'
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
                            {/* 工艺名称 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    工艺名称{' '}
                                    <span className="ml-1 text-blue-500">
                                        *
                                    </span>
                                </label>
                                <select
                                    value={form.process_type_id}
                                    onChange={(e) =>
                                        set('process_type_id', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {processTypes.map((o) => (
                                        <option
                                            key={o.id}
                                            value={String(o.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 所在位置 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    所在位置
                                </label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={(e) =>
                                        set('position', e.target.value)
                                    }
                                    placeholder="装置区/车间位置"
                                    className={inputCls}
                                />
                            </div>

                            {/* 适用物料 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    适用物料
                                    <span className="ml-1 font-normal text-slate-600 normal-case">
                                        （只能从本企业中选择）
                                    </span>
                                </label>
                                <select
                                    value={form.hazardous_chemical_id}
                                    onChange={(e) =>
                                        set(
                                            'hazardous_chemical_id',
                                            e.target.value,
                                        )
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {chemicals.map((o) => (
                                        <option
                                            key={o.id}
                                            value={String(o.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 使用设备 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    使用设备
                                    <span className="ml-1 font-normal text-slate-600 normal-case">
                                        （只能从本企业中选择）
                                    </span>
                                </label>
                                <select
                                    value={form.dangerous_equipment_id}
                                    onChange={(e) =>
                                        set(
                                            'dangerous_equipment_id',
                                            e.target.value,
                                        )
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {equipment.map((o) => (
                                        <option
                                            key={o.id}
                                            value={String(o.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 其他设备名称 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    其他设备名称
                                </label>
                                <input
                                    type="text"
                                    value={form.other_equipment_name}
                                    onChange={(e) =>
                                        set(
                                            'other_equipment_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="其他相关设备"
                                    className={inputCls}
                                />
                            </div>

                            {/* 操作人数 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    操作人数
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.operating_people_num}
                                    onChange={(e) =>
                                        set(
                                            'operating_people_num',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="人数"
                                    className={inputCls}
                                />
                            </div>

                            {/* 四个开关 */}
                            {SWITCH_FIELDS.map((f) => (
                                <div key={f.key}>
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        {f.label}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            set(
                                                f.key,
                                                form[f.key] === '1' ? '0' : '1',
                                            )
                                        }
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                                            form[f.key] === '1'
                                                ? 'border-emerald-500/25 bg-emerald-600/10 text-emerald-400'
                                                : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                                form[f.key] === '1'
                                                    ? 'bg-emerald-400'
                                                    : 'bg-slate-700',
                                            )}
                                        />
                                        {form[f.key] === '1' ? '是' : '否'}
                                    </button>
                                </div>
                            ))}
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
            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除高危险工艺
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {deleteItem?.process_type?.title ?? '该记录'}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
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
