import { useState, useCallback, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { DataTable } from '@/components/data-table/DataTable';
import { useScope } from '@/contexts/ScopeContext';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { OssUploadField } from '@/components/shared/OssUploadField';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'date' | 'file';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    optionsEndpoint?: string;
    optionsLabelKey?: string;
    optionsValueKey?: string;
    colSpan?: 1 | 2;
}

export interface CrudColumn {
    key: string;
    header: string;
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
    width?: number;
}

export interface CrudPageConfig {
    title: string;
    endpoint: string;
    columns: CrudColumn[];
    formFields: FormField[];
    searchField?: string;
    searchPlaceholder?: string;
    idKey?: string;
    /** Row field used as the label in the delete confirmation dialog. Defaults to 'title'. */
    labelKey?: string;
}

interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    last_page: number;
    per_page: number;
    total: number;
}

// ── CrudPage ──────────────────────────────────────────────────────

export function CrudPage({ config }: { config: CrudPageConfig }) {
    const {
        title,
        endpoint,
        columns: colDefs,
        formFields,
        searchField,
        searchPlaceholder,
        idKey = 'id',
        labelKey = 'title',
    } = config;

    const { activeCompany, isSubordinate } = useScope();
    const companyId = activeCompany?.id;
    const readOnly = isSubordinate;

    const { data, loading, total, current_page, last_page, per_page, reload, goToPage, search } =
        useApiList<Record<string, unknown>>({
            endpoint,
            defaultParams: companyId ? { company_id: companyId } : {},
        });
    const crud = useApiCrud(endpoint);

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [deleteId, setDeleteId] = useState<number | string | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<Record<string, unknown>>({});
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});

    // Load dynamic select options
    useEffect(() => {
        formFields.forEach((field) => {
            if (field.type === 'select' && field.optionsEndpoint && !field.options) {
                const labelKey = field.optionsLabelKey ?? 'title';
                const valueKey = field.optionsValueKey ?? 'id';
                api.get<ApiResponse<PaginatedResponse<Record<string, unknown>>>>(field.optionsEndpoint, {
                    params: { per_page: 200 },
                })
                    .then((res) => {
                        const items = res.data.data?.data ?? [];
                        setDynamicOptions((prev) => ({
                            ...prev,
                            [field.key]: items.map((item: Record<string, unknown>) => ({
                                value: String(item[valueKey]),
                                label: String(item[labelKey]),
                            })),
                        }));
                    })
                    .catch(() => {});
            }
        });
    }, [formFields]);

    const initForm = useCallback(() => {
        const f: Record<string, unknown> = {};
        formFields.forEach((field) => {
            f[field.key] = field.type === 'switch' ? 0 : '';
        });
        return f;
    }, [formFields]);

    const handleSearch = useCallback(
        (val: string) => {
            setSearchValue(val);
            if (searchField) search({ [searchField]: val || undefined });
        },
        [search, searchField],
    );

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(initForm());
        setDialogOpen(true);
    };

    const openEdit = (row: Record<string, unknown>) => {
        setEditingId(row[idKey] as number);
        setFormError('');
        const f: Record<string, unknown> = {};
        formFields.forEach((field) => {
            f[field.key] = row[field.key] ?? (field.type === 'switch' ? 0 : '');
        });
        setForm(f);
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');
        try {
            const payload: Record<string, unknown> = { ...form };
            // Always inject active scope company_id
            if (companyId && !payload['company_id']) {
                payload['company_id'] = companyId;
            }
            formFields.forEach((field) => {
                if (field.type === 'number' && payload[field.key] !== '') {
                    payload[field.key] = Number(payload[field.key]);
                }
                if (field.type === 'switch') {
                    payload[field.key] = Number(payload[field.key]);
                }
                if (payload[field.key] === '') payload[field.key] = null;
            });

            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }
            setDialogOpen(false);
            reload();
        } catch (err: any) {
            setFormError(err.response?.data?.message ?? '操作失败，请重试');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await crud.remove(deleteId);
        setDeleteId(null);
        setDeleteLabel('');
        reload();
    };

    const updateForm = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

    // Build table columns
    const tableColumns: ColumnDef<Record<string, unknown>>[] = colDefs.map((col) => ({
        accessorKey: col.key,
        header: col.header,
        size: col.width,
        cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
            if (col.render) return col.render(row.original[col.key], row.original);
            const val = row.original[col.key];
            if (val === null || val === undefined) return <span className="text-slate-700">—</span>;
            return String(val);
        },
    }));

    if (!readOnly) {
        tableColumns.push({
            id: 'actions',
            header: '操作',
            size: 88,
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    <ActionButton
                        onClick={() => openEdit(row.original)}
                        variant="edit"
                        title="编辑"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </ActionButton>
                    <ActionButton
                        onClick={() => {
                            setDeleteId(row.original[idKey] as number);
                            setDeleteLabel(String(row.original[labelKey] ?? row.original[idKey] ?? ''));
                        }}
                        variant="delete"
                        title="删除"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </ActionButton>
                </div>
            ),
        });
    }

    return (
        <>
            <Head title={title} />

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">{title}</h1>
                        <p className="mt-0.5 text-xs text-slate-600">
                            共{' '}
                            <span className="font-medium text-slate-400">{total}</span>{' '}
                            条记录
                        </p>
                    </div>
                </div>
                {!readOnly && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 hover:text-blue-200 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        新增{title}
                    </button>
                )}
            </div>

            <DataTable
                columns={tableColumns}
                data={data}
                isLoading={loading}
                searchPlaceholder={searchPlaceholder ?? `搜索${title}...`}
                searchValue={searchValue}
                onSearchChange={searchField ? handleSearch : undefined}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}{title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {editingId ? '修改现有记录信息' : '填写信息后保存新记录'}
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
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}
                        <div className={cn(
                            'grid gap-4',
                            formFields.some((f) => f.colSpan === 2) ? 'md:grid-cols-2' : 'grid-cols-1',
                        )}>
                            {formFields.map((field) => (
                                <div
                                    key={field.key}
                                    className={field.colSpan === 2 ? 'md:col-span-2' : ''}
                                >
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                                        {field.label}
                                        {field.required && (
                                            <span className="ml-1 text-blue-500">*</span>
                                        )}
                                    </label>
                                    {renderFormField(field, form, updateForm, dynamicOptions)}
                                </div>
                            ))}
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
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {formLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </Modal>

            {/* Delete confirm modal */}
            <Modal open={!!deleteId} onClose={() => { setDeleteId(null); setDeleteLabel(''); }}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">删除{title}</h2>
                    <p className="text-sm text-slate-500">
                        确定要删除{deleteLabel ? (
                            <> &ldquo;<span className="font-medium text-slate-300">{deleteLabel}</span>&rdquo;</>
                        ) : '这条记录'}吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => { setDeleteId(null); setDeleteLabel(''); }}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={crud.loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {crud.loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {crud.loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>
        </>
    );
}

// ── Form field renderer ───────────────────────────────────────────

function renderFormField(
    field: FormField,
    form: Record<string, unknown>,
    updateForm: (key: string, value: unknown) => void,
    dynamicOptions: Record<string, { value: string; label: string }[]>,
) {
    const value = form[field.key];
    const inputClass =
        'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

    switch (field.type) {
        case 'text':
            return (
                <input
                    type="text"
                    value={(value as string) ?? ''}
                    onChange={(e) => updateForm(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                />
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={(value as string | number) ?? ''}
                    onChange={(e) => updateForm(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                />
            );
        case 'date':
            return (
                <input
                    type="date"
                    value={(value as string) ?? ''}
                    onChange={(e) => updateForm(field.key, e.target.value)}
                    className={cn(inputClass, 'cursor-pointer')}
                />
            );
        case 'textarea':
            return (
                <textarea
                    value={(value as string) ?? ''}
                    onChange={(e) => updateForm(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={cn(inputClass, 'resize-none')}
                />
            );
        case 'select': {
            const opts = field.options ?? dynamicOptions[field.key] ?? [];
            return (
                <select
                    value={String(value ?? '')}
                    onChange={(e) => updateForm(field.key, e.target.value)}
                    className={cn(inputClass, 'cursor-pointer appearance-none')}
                >
                    <option value="" disabled className="bg-[#0d1530]">
                        {field.placeholder ?? '请选择'}
                    </option>
                    {opts.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0d1530]">
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }
        case 'switch':
            return (
                <button
                    type="button"
                    role="switch"
                    aria-checked={!!value}
                    onClick={() => updateForm(field.key, value ? 0 : 1)}
                    className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                        value ? 'bg-blue-600' : 'bg-slate-700',
                    )}
                >
                    <span
                        className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                            value ? 'translate-x-4' : 'translate-x-0',
                        )}
                    />
                </button>
            );
        case 'file':
            return (
                <OssUploadField
                    value={(value as string) ?? ''}
                    onChange={(url) => updateForm(field.key, url)}
                />
            );
        default:
            return null;
    }
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
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

// ── Action button ─────────────────────────────────────────────────

function ActionButton({
    children,
    onClick,
    variant,
    title,
}: {
    children: React.ReactNode;
    onClick: () => void;
    variant: 'edit' | 'delete';
    title?: string;
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
