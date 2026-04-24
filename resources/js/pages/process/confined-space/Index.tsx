import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { useScope } from '@/contexts/ScopeContext';
import { useApiCrud, useApiList } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';

interface SpaceWorkRow {
    id: number;
    name: string;
    position: string | null;
    space_work_type_id: number | null;
    space_work_type: { id: number; title: string } | null;
    size: string | null;
    people_num: string | null;
    hazard_id: string | null;
    word_content: string | null;
}

interface Option {
    id: number;
    label: string;
}

interface HazardOption {
    id: number;
    title: string;
}

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

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

export default function ConfinedSpaceIndex() {
    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;
    const { canWrite } = usePermission();
    const canCreate = !readOnly && canWrite('space-works.create');
    const canUpdate = !readOnly && canWrite('space-works.update');
    const canDelete = !readOnly && canWrite('space-works.delete');

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
    } = useApiList<SpaceWorkRow>({
        endpoint: '/space-works',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });

    const crud = useApiCrud('/space-works');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<SpaceWorkRow>();
    const detailItem = detail.data;
    const [deleteItem, setDeleteItem] = useState<SpaceWorkRow | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [spaceWorkTypes, setSpaceWorkTypes] = useState<Option[]>([]);
    const [hazardOptions, setHazardOptions] = useState<HazardOption[]>([]);

    const emptyForm = () => ({
        name: '',
        position: '',
        space_work_type_id: '',
        size: '',
        people_num: '',
        hazard_id: '',
        word_content: '',
    });

    const [form, setForm] = useState<Record<string, string>>(emptyForm());

    const set = (key: string, value: string) => {
        setForm((previous) => ({ ...previous, [key]: value }));
    };

    useEffect(() => {
        api.get('/hazards', { params: { per_page: 200 } })
            .then((response) =>
                setHazardOptions(
                    response.data?.data?.data ?? response.data?.data ?? [],
                ),
            )
            .catch(() => {});
    }, []);

    const loadTypes = useCallback(async () => {
        try {
            const [typeResponse, hazardResponse] = await Promise.all([
                api.get('/space-work-types', { params: { per_page: 200 } }),
                api.get('/hazards', { params: { per_page: 200 } }),
            ]);

            setSpaceWorkTypes(
                (typeResponse.data?.data?.data ?? []).map(
                    (item: { id: number; title: string }) => ({
                        id: item.id,
                        label: item.title,
                    }),
                ),
            );
            setHazardOptions(
                hazardResponse.data?.data?.data ??
                    hazardResponse.data?.data ??
                    [],
            );
        } catch {
            // silently ignore
        }
    }, []);

    const openCreate = async () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        await loadTypes();
        setDialogOpen(true);
    };

    const openEdit = async (row: SpaceWorkRow) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            name: row.name ?? '',
            position: row.position ?? '',
            space_work_type_id: row.space_work_type_id
                ? String(row.space_work_type_id)
                : '',
            size: row.size ?? '',
            people_num: row.people_num ? String(row.people_num) : '',
            hazard_id: row.hazard_id ?? '',
            word_content: row.word_content ?? '',
        });
        await loadTypes();
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                name: form.name || null,
                position: form.position || null,
                space_work_type_id: form.space_work_type_id
                    ? Number(form.space_work_type_id)
                    : null,
                size: form.size || null,
                people_num: form.people_num ? Number(form.people_num) : null,
                hazard_id: form.hazard_id || null,
                word_content: form.word_content || null,
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
        } catch (error: unknown) {
            setFormError(getErrorMessage(error, '操作失败，请重试'));
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

    const toggleHazard = (id: string) => {
        const current = (form.hazard_id ?? '').split(',').filter(Boolean);
        const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id];
        set('hazard_id', next.join(','));
    };

    const columns: ColumnDef<SpaceWorkRow>[] = [
        {
            accessorKey: 'name',
            header: '名称',
            cell: ({ row }) => (
                <span className="font-medium text-slate-200">
                    {row.original.name}
                </span>
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
            accessorKey: 'space_work_type',
            header: '有限空间类型',
            size: 130,
            cell: ({ row }) =>
                row.original.space_work_type?.title ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'size',
            header: '空间大小 (m³)',
            size: 120,
            cell: ({ row }) =>
                row.original.size ? (
                    <span className="font-mono text-xs text-slate-300">
                        {row.original.size} m³
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'hazard_id',
            header: '危险有害因素',
            cell: ({ row }) => {
                const value = row.original.hazard_id;

                if (!value) {
                    return <span className="text-slate-700">—</span>;
                }

                const titles = value
                    .split(',')
                    .filter(Boolean)
                    .map(
                        (id) =>
                            hazardOptions.find(
                                (hazard) => String(hazard.id) === id,
                            )?.title ?? id,
                    );

                if (!titles.length) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {titles.map((title, index) => (
                            <span
                                key={index}
                                className="rounded-md border border-amber-500/25 bg-amber-600/8 px-1.5 py-0.5 text-[10px] text-amber-400"
                            >
                                {title}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'people_num',
            header: '作业人数',
            size: 80,
            cell: ({ row }) =>
                row.original.people_num ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'actions',
            header: '操作',
            size: readOnly ? 96 : 160,
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    <DetailButton
                        row={row.original}
                        onOpen={detail.openDetail}
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
                            onClick={() => setDeleteItem(row.original)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const detailData = detailItem
        ? {
              ...detailItem,
              space_work_type: detailItem.space_work_type?.title ?? null,
              hazards: detailItem.hazard_id
                  ? detailItem.hazard_id
                        .split(',')
                        .filter(Boolean)
                        .map(
                            (id) =>
                                hazardOptions.find(
                                    (hazard) => String(hazard.id) === id,
                                )?.title ?? id,
                        )
                        .join('、')
                  : null,
          }
        : null;

    return (
        <>
            <Head title="有限空间辨识" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        有限空间辨识
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
                        新增有限空间
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索有限空间名称..."
                searchValue={searchValue}
                onSearchChange={(value) => {
                    setSearchValue(value);
                    search({ name: value || undefined });
                }}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="有限空间辨识详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    name: '名称',
                    position: '所在位置',
                    space_work_type: '有限空间类型',
                    size: '空间大小 (m³)',
                    people_num: '作业人数',
                    hazards: '危险有害因素',
                    word_content: '作业内容',
                }}
            />

            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}有限空间
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId
                                ? '修改有限空间档案信息'
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
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    名称{' '}
                                    <span className="ml-1 text-blue-500">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        set('name', event.target.value)
                                    }
                                    placeholder="有限空间名称"
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    所在位置
                                </label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={(event) =>
                                        set('position', event.target.value)
                                    }
                                    placeholder="具体位置"
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    有限空间类型
                                </label>
                                <select
                                    value={form.space_work_type_id}
                                    onChange={(event) =>
                                        set(
                                            'space_work_type_id',
                                            event.target.value,
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
                                    {spaceWorkTypes.map((option) => (
                                        <option
                                            key={option.id}
                                            value={String(option.id)}
                                            className="bg-[#0d1530]"
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    空间大小{' '}
                                    <span className="ml-1 font-normal text-slate-600 normal-case">
                                        (m³)
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.size}
                                        onChange={(event) =>
                                            set('size', event.target.value)
                                        }
                                        placeholder="请输入体积数值"
                                        className={cn(inputCls, 'pr-10')}
                                    />
                                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-600">
                                        m³
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    可能涉及作业人数
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.people_num}
                                    onChange={(event) =>
                                        set('people_num', event.target.value)
                                    }
                                    placeholder="人数"
                                    className={inputCls}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    危险有害因素
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {hazardOptions.map((hazard) => {
                                        const selected = (form.hazard_id ?? '')
                                            .split(',')
                                            .filter(Boolean)
                                            .includes(String(hazard.id));

                                        return (
                                            <button
                                                key={hazard.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleHazard(
                                                        String(hazard.id),
                                                    )
                                                }
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                                                    selected
                                                        ? 'border-amber-500/40 bg-amber-600/12 text-amber-300'
                                                        : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'h-1.5 w-1.5 shrink-0 rounded-full',
                                                        selected
                                                            ? 'bg-amber-400'
                                                            : 'bg-slate-700',
                                                    )}
                                                />
                                                {hazard.title}
                                            </button>
                                        );
                                    })}
                                    {hazardOptions.length === 0 && (
                                        <span className="text-xs text-slate-700">
                                            加载中...
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    可能涉及的作业内容
                                </label>
                                <textarea
                                    value={form.word_content}
                                    onChange={(event) =>
                                        set('word_content', event.target.value)
                                    }
                                    rows={3}
                                    placeholder="描述可能涉及的作业内容"
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

            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除有限空间
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
