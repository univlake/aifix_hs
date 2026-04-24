import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
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

interface ConstructionUnitRow {
    id: number;
    name: string;
    is_qualification: number;
    qualification_name: string | null;
    qualification_annex_url: string | null;
    evaluation_area: string | null;
    contact: string | null;
    contact_tel: string | null;
    is_agreement: number;
    agreement_annex_url: string | null;
    supervision_url: string | null;
    annex_url: string | null;
}

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function ToggleBtn({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(value === '1' ? '0' : '1')}
            className={cn(
                'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                value === '1'
                    ? 'border-emerald-500/25 bg-emerald-600/10 text-emerald-400'
                    : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-900/50 hover:text-slate-400',
            )}
        >
            <span
                className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    value === '1' ? 'bg-emerald-400' : 'bg-slate-700',
                )}
            />
            {value === '1' ? '是' : '否'}
        </button>
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
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

export default function ConstructionUnitsIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;
    const { canWrite } = usePermission();
    const canCreate = canWrite('evaluation-units.create');
    const canUpdate = canWrite('evaluation-units.update');
    const canDelete = canWrite('evaluation-units.delete');

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
    } = useApiList<ConstructionUnitRow>({
        endpoint: '/evaluation-units',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });
    const crud = useApiCrud('/evaluation-units');

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const detail = useDetailDrawer<ConstructionUnitRow>();
    const detailItem = detail.data;
    const [deleteItem, setDeleteItem] = useState<ConstructionUnitRow | null>(
        null,
    );
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const emptyForm = () => ({
        name: '',
        is_qualification: '0',
        qualification_name: '',
        qualification_annex_url: '',
        evaluation_area: '',
        contact: '',
        contact_tel: '',
        is_agreement: '0',
        agreement_annex_url: '',
        supervision_url: '',
        annex_url: '',
    });
    const [form, setForm] = useState(emptyForm());
    const set = (k: keyof typeof form, v: string) =>
        setForm((f) => ({ ...f, [k]: v }));

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (row: ConstructionUnitRow) => {
        setEditingId(row.id);
        setFormError('');
        setForm({
            name: row.name,
            is_qualification: String(row.is_qualification ?? 0),
            qualification_name: row.qualification_name ?? '',
            qualification_annex_url: row.qualification_annex_url ?? '',
            evaluation_area: row.evaluation_area ?? '',
            contact: row.contact ?? '',
            contact_tel: row.contact_tel ?? '',
            is_agreement: String(row.is_agreement ?? 0),
            agreement_annex_url: row.agreement_annex_url ?? '',
            supervision_url: row.supervision_url ?? '',
            annex_url: row.annex_url ?? '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            setFormError('单位名称不能为空');

            return;
        }

        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                name: form.name,
                is_qualification: Number(form.is_qualification),
                qualification_name: form.qualification_name || null,
                qualification_annex_url: form.qualification_annex_url || null,
                evaluation_area: form.evaluation_area || null,
                contact: form.contact || null,
                contact_tel: form.contact_tel || null,
                is_agreement: Number(form.is_agreement),
                agreement_annex_url: form.agreement_annex_url || null,
                supervision_url: form.supervision_url || null,
                annex_url: form.annex_url || null,
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

    const columns: ColumnDef<ConstructionUnitRow>[] = [
        { accessorKey: 'name', header: '单位名称' },
        {
            accessorKey: 'evaluation_area',
            header: '服务区域',
            size: 140,
            cell: ({ row }) =>
                row.original.evaluation_area ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'contact',
            header: '联系人',
            size: 110,
            cell: ({ row }) =>
                row.original.contact ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            accessorKey: 'contact_tel',
            header: '联系电话',
            size: 140,
            cell: ({ row }) =>
                row.original.contact_tel ?? (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'is_qualification',
            header: '有资质',
            size: 80,
            cell: ({ row }) =>
                row.original.is_qualification ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-600/8 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        是
                    </span>
                ) : (
                    <span className="text-slate-700">否</span>
                ),
        },
        {
            id: 'is_agreement',
            header: '有协议',
            size: 80,
            cell: ({ row }) =>
                row.original.is_agreement ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-600/8 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        是
                    </span>
                ) : (
                    <span className="text-slate-700">否</span>
                ),
        },
    ];

    columns.push({
        id: 'actions',
        header: '操作',
        size: 160,
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
              is_qualification: detailItem.is_qualification === 1 ? '是' : '否',
              is_agreement: detailItem.is_agreement === 1 ? '是' : '否',
          }
        : null;

    return (
        <>
            <Head title="施工单位" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        施工单位
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
                        新增施工单位
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索施工单位..."
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
                title="施工单位详情"
                data={detailData as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    name: '单位名称',
                    qualification_name: '资质名称',
                    qualification_annex_url: '资质附件',
                    evaluation_area: '服务区域',
                    contact: '联系人',
                    contact_tel: '联系电话',
                    is_qualification: '是否有资质',
                    is_agreement: '是否签订协议',
                    agreement_annex_url: '协议附件',
                    supervision_url: '监督检查记录',
                    annex_url: '其他附件',
                }}
            />

            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}施工单位
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId
                                ? '修改单位档案信息'
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
                        <div>
                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                单位名称{' '}
                                <span className="ml-1 text-blue-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="施工单位全称"
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    联系人
                                </label>
                                <input
                                    type="text"
                                    value={form.contact}
                                    onChange={(e) =>
                                        set('contact', e.target.value)
                                    }
                                    placeholder="联系人姓名"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    联系电话
                                </label>
                                <input
                                    type="text"
                                    value={form.contact_tel}
                                    onChange={(e) =>
                                        set('contact_tel', e.target.value)
                                    }
                                    placeholder="联系电话"
                                    className={inputCls}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    服务区域
                                </label>
                                <input
                                    type="text"
                                    value={form.evaluation_area}
                                    onChange={(e) =>
                                        set('evaluation_area', e.target.value)
                                    }
                                    placeholder="服务区域描述"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    是否有资质
                                </label>
                                <ToggleBtn
                                    value={form.is_qualification}
                                    onChange={(v) => set('is_qualification', v)}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    是否签有协议
                                </label>
                                <ToggleBtn
                                    value={form.is_agreement}
                                    onChange={(v) => set('is_agreement', v)}
                                />
                            </div>
                            {form.is_qualification === '1' && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            资质名称
                                        </label>
                                        <input
                                            type="text"
                                            value={form.qualification_name}
                                            onChange={(e) =>
                                                set(
                                                    'qualification_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="资质证书名称"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            资质证书附件
                                        </label>
                                        <OssUploadField
                                            value={form.qualification_annex_url}
                                            onChange={(url) =>
                                                set(
                                                    'qualification_annex_url',
                                                    url ?? '',
                                                )
                                            }
                                            dir="construction-units/qualifications/"
                                        />
                                    </div>
                                </>
                            )}
                            {form.is_agreement === '1' && (
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        协议附件
                                    </label>
                                    <OssUploadField
                                        value={form.agreement_annex_url}
                                        onChange={(url) =>
                                            set(
                                                'agreement_annex_url',
                                                url ?? '',
                                            )
                                        }
                                        dir="construction-units/agreements/"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                监督检查记录
                            </label>
                            <OssUploadField
                                value={form.supervision_url}
                                onChange={(url) =>
                                    set('supervision_url', url ?? '')
                                }
                                dir="construction-units/supervision/"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                其他附件
                            </label>
                            <OssUploadField
                                value={form.annex_url}
                                onChange={(url) => set('annex_url', url ?? '')}
                                dir="construction-units/"
                            />
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
                        删除施工单位
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
