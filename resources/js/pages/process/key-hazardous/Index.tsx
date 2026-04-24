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
    name: string;
    dangerous_craft_type_id: number | null;
    dangerous_craft_type: { id: number; title: string } | null;
    position: string | null;
    hazardous_chemical_id: number | null;
    hazardous_chemical: { id: number; name: string } | null;
    dangerous_equipment_id: number | null;
    dangerous_equipment: { id: number; equipment_name: string } | null;
    operating_people_num: string | null;
    temperature: string | null;
    pressure: string | null;
    pressure_unit: string | null;
    is_sis: number;
    sil_level: string | null;
    detect_parameter: string | null;
}

interface Option {
    id: number;
    label: string;
}

// ── Constants ──────────────────────────────────────────────────────

const PRESSURE_UNITS = ['Pa', 'MPa', 'kg/cm²'];
const SIL_OPTIONS = ['SL1', 'SL2', 'SL3', 'SL4'];
const DETECT_PARAMS = ['液位', '温度', '压力', '气体泄漏'];

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

export default function KeyHazardousProcessIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;
    const { canWrite } = usePermission();
    const canCreate = canWrite('major-hazardous-processes.create');
    const canUpdate = canWrite('major-hazardous-processes.update');
    const canDelete = canWrite('major-hazardous-processes.delete');

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
        endpoint: '/major-hazardous-processes',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/major-hazardous-processes');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<ProcessRow>();
    const detailItem = detail.data;
    const [deleteItem, setDeleteItem] = useState<ProcessRow | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Reference data
    const [craftTypes, setCraftTypes] = useState<Option[]>([]);
    const [chemicals, setChemicals] = useState<Option[]>([]);
    const [equipment, setEquipment] = useState<Option[]>([]);

    const emptyForm = () => ({
        name: '',
        dangerous_craft_type_id: '',
        position: '',
        hazardous_chemical_id: '',
        dangerous_equipment_id: '',
        operating_people_num: '',
        temperature: '',
        pressure: '',
        pressure_unit: '',
        is_sis: '0',
        sil_level: '',
        detect_parameter: '',
    });
    const [form, setForm] = useState<Record<string, string>>(emptyForm());
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const loadOptions = useCallback(async () => {
        try {
            const [ctRes, chRes, eqRes] = await Promise.all([
                api.get('/dangerous-craft-types', {
                    params: { per_page: 200 },
                }),
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
            setCraftTypes(
                (ctRes.data?.data?.data ?? []).map((x: any) => ({
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
            name: row.name ?? '',
            dangerous_craft_type_id: row.dangerous_craft_type_id
                ? String(row.dangerous_craft_type_id)
                : '',
            position: row.position ?? '',
            hazardous_chemical_id: row.hazardous_chemical_id
                ? String(row.hazardous_chemical_id)
                : '',
            dangerous_equipment_id: row.dangerous_equipment_id
                ? String(row.dangerous_equipment_id)
                : '',
            operating_people_num: row.operating_people_num ?? '',
            temperature: row.temperature ?? '',
            pressure: row.pressure ?? '',
            pressure_unit: row.pressure_unit ?? '',
            is_sis: String(row.is_sis ?? 0),
            sil_level: row.sil_level ?? '',
            detect_parameter: row.detect_parameter ?? '',
        });
        await loadOptions();
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                name: form.name || null,
                dangerous_craft_type_id: form.dangerous_craft_type_id
                    ? Number(form.dangerous_craft_type_id)
                    : null,
                position: form.position || null,
                hazardous_chemical_id: form.hazardous_chemical_id
                    ? Number(form.hazardous_chemical_id)
                    : null,
                dangerous_equipment_id: form.dangerous_equipment_id
                    ? Number(form.dangerous_equipment_id)
                    : null,
                operating_people_num: form.operating_people_num || null,
                temperature: form.temperature || null,
                pressure: form.pressure || null,
                pressure_unit: form.pressure_unit || null,
                is_sis: Number(form.is_sis),
                sil_level: form.sil_level || null,
                detect_parameter: form.detect_parameter || null,
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

    // ── Detect parameter multi-select ─────────────────────────────

    const toggleDetect = (p: string) => {
        const current = (form.detect_parameter ?? '')
            .split(',')
            .filter(Boolean);
        const next = current.includes(p)
            ? current.filter((x) => x !== p)
            : [...current, p];
        set('detect_parameter', next.join(','));
    };

    // ── Table columns ─────────────────────────────────────────────

    const columns: ColumnDef<ProcessRow>[] = [
        {
            accessorKey: 'name',
            header: '工艺名称',
            cell: ({ row }) => (
                <span className="font-medium text-slate-200">
                    {row.original.name}
                </span>
            ),
        },
        {
            accessorKey: 'dangerous_craft_type',
            header: '危险工艺类型',
            size: 140,
            cell: ({ row }) =>
                row.original.dangerous_craft_type?.title ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'position',
            header: '所在位置',
            size: 130,
            cell: ({ row }) =>
                row.original.position ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'temperature',
            header: '温度',
            size: 90,
            cell: ({ row }) =>
                row.original.temperature ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'pressure',
            header: '压力',
            size: 110,
            cell: ({ row }) => {
                const { pressure, pressure_unit } = row.original;

                if (!pressure) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span className="font-mono text-xs text-slate-300">
                        {pressure}
                        {pressure_unit ? ` ${pressure_unit}` : ''}
                    </span>
                );
            },
        },
        {
            accessorKey: 'is_sis',
            header: 'SIS',
            size: 80,
            cell: ({ row }) =>
                row.original.is_sis ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-600/8 px-2 py-0.5 text-xs text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        是
                    </span>
                ) : (
                    <span className="text-slate-700">否</span>
                ),
        },
        {
            accessorKey: 'detect_parameter',
            header: '监测远传参数',
            cell: ({ row }) => {
                const val = row.original.detect_parameter;

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
              dangerous_craft_type:
                  detailItem.dangerous_craft_type?.title ?? null,
              hazardous_chemical: detailItem.hazardous_chemical?.name ?? null,
              dangerous_equipment:
                  detailItem.dangerous_equipment?.equipment_name ?? null,
              is_sis: detailItem.is_sis === 1 ? '是' : '否',
          }
        : null;

    // ── Render ────────────────────────────────────────────────────

    return (
        <>
            <Head title="重点监管危险工艺" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        重点监管危险工艺
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
                        新增危险工艺
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索工艺名称..."
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
                title="重点监管危险工艺详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    name: '工艺名称',
                    dangerous_craft_type: '危险工艺类型',
                    position: '所在位置',
                    hazardous_chemical: '使用物料',
                    dangerous_equipment: '使用设备',
                    operating_people_num: '操作人数',
                    temperature: '温度',
                    pressure: '压力',
                    pressure_unit: '压力单位',
                    is_sis: 'SIS',
                    sil_level: 'SIL等级',
                    detect_parameter: '监测远传参数',
                }}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}重点监管危险工艺
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
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    工艺名称{' '}
                                    <span className="ml-1 text-blue-500">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        set('name', e.target.value)
                                    }
                                    placeholder="请输入工艺名称"
                                    className={inputCls}
                                />
                            </div>

                            {/* 危险工艺类型 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    危险工艺类型
                                </label>
                                <select
                                    value={form.dangerous_craft_type_id}
                                    onChange={(e) =>
                                        set(
                                            'dangerous_craft_type_id',
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
                                    {craftTypes.map((o) => (
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

                            {/* 温度 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    温度
                                </label>
                                <input
                                    type="text"
                                    value={form.temperature}
                                    onChange={(e) =>
                                        set('temperature', e.target.value)
                                    }
                                    placeholder="如：120°C"
                                    className={inputCls}
                                />
                            </div>

                            {/* 压力 + 单位 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    压力
                                </label>
                                <input
                                    type="text"
                                    value={form.pressure}
                                    onChange={(e) =>
                                        set('pressure', e.target.value)
                                    }
                                    placeholder="数值"
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    压力单位
                                </label>
                                <select
                                    value={form.pressure_unit}
                                    onChange={(e) =>
                                        set('pressure_unit', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {PRESSURE_UNITS.map((u) => (
                                        <option
                                            key={u}
                                            value={u}
                                            className="bg-[#0d1530]"
                                        >
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SIS */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    SIS 安全仪表系统
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        set(
                                            'is_sis',
                                            form.is_sis === '1' ? '0' : '1',
                                        )
                                    }
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                                        form.is_sis === '1'
                                            ? 'border-emerald-500/25 bg-emerald-600/10 text-emerald-400'
                                            : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-1.5 w-1.5 shrink-0 rounded-full',
                                            form.is_sis === '1'
                                                ? 'bg-emerald-400'
                                                : 'bg-slate-700',
                                        )}
                                    />
                                    {form.is_sis === '1' ? '已配置' : '未配置'}
                                </button>
                            </div>

                            {/* SIL等级 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    SIL 等级
                                </label>
                                <select
                                    value={form.sil_level}
                                    onChange={(e) =>
                                        set('sil_level', e.target.value)
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {SIL_OPTIONS.map((o) => (
                                        <option
                                            key={o}
                                            value={o}
                                            className="bg-[#0d1530]"
                                        >
                                            {o}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 监测远传参数 */}
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    监测远传参数
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DETECT_PARAMS.map((p) => {
                                        const selected = (
                                            form.detect_parameter ?? ''
                                        )
                                            .split(',')
                                            .filter(Boolean)
                                            .includes(p);

                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => toggleDetect(p)}
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
            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除重点监管危险工艺
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
