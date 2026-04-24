import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    Upload,
    Download,
    FileDown,
    Copy,
} from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { DatePicker } from '@/components/shared/DatePicker';
import { DetailButton } from '@/components/shared/DetailButton';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { OssVideoUploadField } from '@/components/shared/OssVideoUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getApiPayload, getErrorMessage } from '@/types/api-error';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

export interface SubField {
    key: string;
    label: string;
    placeholder?: string;
}

export interface FormField {
    key: string;
    label: string;
    type:
        | 'text'
        | 'number'
        | 'textarea'
        | 'select'
        | 'switch'
        | 'date'
        | 'file'
        | 'video'
        | 'sub-table';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    optionsEndpoint?: string;
    optionsLabelKey?: string;
    optionsValueKey?: string;
    /** Key of another field whose value this select depends on */
    dependsOnField?: string;
    /** Endpoint template for cascading options, e.g. '/skill-units/{value}' */
    dependsOnEndpoint?: string;
    /** Key inside response data to extract the options array, e.g. 'kids' */
    dependsOnDataKey?: string;
    colSpan?: 1 | 2;
    visibleWhen?: (form: Record<string, unknown>) => boolean;
    /** Columns for 'sub-table' type repeatable rows */
    subFields?: SubField[];
    /** Small helper text rendered below the field */
    hint?: string;
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
    formFields?: FormField[];
    searchField?: string;
    searchPlaceholder?: string;
    idKey?: string;
    /** Row field used as the label in the delete confirmation dialog. Defaults to 'title'. */
    labelKey?: string;
    importEndpoint?: string;
    exportEndpoint?: string;
    templateEndpoint?: string;
    copyEndpoint?: string;
    /** When false, omit company_id from list queries (shared/global data). Default true. */
    companyScoped?: boolean;
    /** Extra static params always merged into the list query (e.g. parent_company_id). */
    extraParams?: Record<string, unknown>;
    /** Force read-only regardless of isSubordinate (hides all create/edit/delete UI). */
    forceReadOnly?: boolean;
    /** Extra filter dropdowns shown beside the search bar */
    filterFields?: Array<{
        key: string;
        placeholder: string;
        options?: { value: string; label: string }[];
        optionsEndpoint?: string;
        optionsLabelKey?: string;
        optionsValueKey?: string;
        /** Static params to send when loading options (e.g. { pid: 0 } to load only top-level) */
        optionsParams?: Record<string, unknown>;
        /** Key of another filterField whose value this filter depends on */
        dependsOnKey?: string;
        /** Query param name to pass the parent value as (default: same as dependsOnKey) */
        dependsOnParam?: string;
    }>;
    /** Enable a read-only detail modal using the form fields as the display schema. */
    enableDetail?: boolean;
    /** Override the title shown in the detail modal header. */
    detailTitle?: string;
    /**
     * Permission names controlling which actions the user can perform. When omitted,
     * no client-side gate is applied (backend 403 is the only line of defence).
     * Conventionally `{module}.{list|create|update|delete}`; see docs/permissions-audit.md.
     */
    permissions?: {
        list?: string;
        create?: string;
        update?: string;
        delete?: string;
    };
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
        formFields = [],
        searchField,
        searchPlaceholder,
        idKey = 'id',
        labelKey = 'title',
        importEndpoint,
        exportEndpoint,
        templateEndpoint,
        copyEndpoint,
        companyScoped = true,
        extraParams,
        forceReadOnly,
        filterFields = [],
        enableDetail = false,
        detailTitle,
        permissions: pagePermissions,
    } = config;

    const { activeCompany, isSubordinate, rootCompany } = useScope();
    const { can } = usePermission();
    const companyId = activeCompany?.id;

    // Rule 1: when an upper-level enterprise drills into a subordinate company,
    // all write operations are hidden regardless of the user's permissions.
    const globalReadOnly = (forceReadOnly ?? false) || isSubordinate;
    const readOnly = globalReadOnly;

    // Rule 3: hide action buttons the user doesn't have permission for.
    // When `permissions.{action}` is omitted, we fall back to allowed (= existing behaviour).
    const canCreate =
        !readOnly &&
        (pagePermissions?.create ? can(pagePermissions.create) : true);
    const canUpdate =
        !readOnly &&
        (pagePermissions?.update ? can(pagePermissions.update) : true);
    const canDelete =
        !readOnly &&
        (pagePermissions?.delete ? can(pagePermissions.delete) : true);

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
    } = useApiList<Record<string, unknown>>({
        endpoint,
        defaultParams: {
            ...(companyScoped && companyId ? { company_id: companyId } : {}),
            ...(extraParams ?? {}),
        },
        enabled: companyScoped ? !!companyId : true,
    });
    const crud = useApiCrud(endpoint);
    const detail = useDetailDrawer<Record<string, unknown>>({
        endpoint,
        idKey,
        prefetch: true,
    });

    const [searchValue, setSearchValue] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [deleteId, setDeleteId] = useState<number | string | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<Record<string, unknown>>({});
    const [dynamicOptions, setDynamicOptions] = useState<
        Record<string, { value: string; label: string }[]>
    >({});
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState<
        { row: number; errors: string[] }[]
    >([]);
    const [exportLoading, setExportLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [copyLoading, setCopyLoading] = useState(false);
    const [copyMsg, setCopyMsg] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string>>(
        {},
    );
    const [filterOptions, setFilterOptions] = useState<
        Record<string, { value: string; label: string }[]>
    >({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load dynamic select options (scoped to current company)
    useEffect(() => {
        formFields.forEach((field) => {
            if (
                field.type === 'select' &&
                field.optionsEndpoint &&
                !field.options &&
                !field.dependsOnField
            ) {
                const labelKey = field.optionsLabelKey ?? 'title';
                const valueKey = field.optionsValueKey ?? 'id';
                const params: Record<string, unknown> = { per_page: 200 };

                if (companyId) {
                    params.company_id = companyId;
                }

                api.get<
                    ApiResponse<PaginatedResponse<Record<string, unknown>>>
                >(field.optionsEndpoint, { params })
                    .then((res) => {
                        const items = res.data.data?.data ?? [];
                        setDynamicOptions((prev) => ({
                            ...prev,
                            [field.key]: items.map(
                                (item: Record<string, unknown>) => ({
                                    value: String(item[valueKey]),
                                    label: String(item[labelKey]),
                                }),
                            ),
                        }));
                    })
                    .catch(() => {});
            }
        });
    }, [formFields, companyId]);

    // Load cascading options when a dependsOnField value changes
    useEffect(() => {
        formFields.forEach((field) => {
            if (!field.dependsOnField || !field.dependsOnEndpoint) {
                return;
            }

            const parentValue = form[field.dependsOnField];

            if (!parentValue) {
                setDynamicOptions((prev) => ({ ...prev, [field.key]: [] }));

                return;
            }

            const endpoint = field.dependsOnEndpoint.replace(
                '{value}',
                String(parentValue),
            );
            const labelKey = field.optionsLabelKey ?? 'title';
            const valueKey = field.optionsValueKey ?? 'id';
            const dataKey = field.dependsOnDataKey;
            api.get<ApiResponse<Record<string, unknown>>>(endpoint)
                .then((res) => {
                    const raw = res.data.data;
                    const items: Record<string, unknown>[] = dataKey
                        ? ((raw?.[dataKey] as Record<string, unknown>[]) ?? [])
                        : Array.isArray(raw)
                          ? raw
                          : [];
                    setDynamicOptions((prev) => ({
                        ...prev,
                        [field.key]: items.map((item) => ({
                            value: String(item[valueKey]),
                            label: String(item[labelKey]),
                        })),
                    }));
                })
                .catch(() => {
                    setDynamicOptions((prev) => ({ ...prev, [field.key]: [] }));
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formFields,
        ...formFields
            .filter((f) => f.dependsOnField)
            .map((f) => form[f.dependsOnField!]),
    ]);

    // Load options for static filter dropdowns (no dependsOnKey)
    useEffect(() => {
        filterFields.forEach((field) => {
            if (
                field.optionsEndpoint &&
                !field.options &&
                !field.dependsOnKey
            ) {
                const lKey = field.optionsLabelKey ?? 'title';
                const vKey = field.optionsValueKey ?? 'id';
                api.get<
                    ApiResponse<PaginatedResponse<Record<string, unknown>>>
                >(field.optionsEndpoint, {
                    params: { per_page: 200, ...(field.optionsParams ?? {}) },
                })
                    .then((res) => {
                        const items = res.data.data?.data ?? [];
                        setFilterOptions((prev) => ({
                            ...prev,
                            [field.key]: items.map((item) => ({
                                value: String(item[vKey]),
                                label: String(item[lKey]),
                            })),
                        }));
                    })
                    .catch(() => {});
            }
        });
    }, [filterFields]);

    // Load options for cascading filter dropdowns when parent value changes
    useEffect(() => {
        filterFields.forEach((field) => {
            if (
                !field.dependsOnKey ||
                !field.optionsEndpoint ||
                field.options
            ) {
                return;
            }

            const parentValue = filterValues[field.dependsOnKey];

            if (!parentValue) {
                setFilterOptions((prev) => ({ ...prev, [field.key]: [] }));

                return;
            }

            const lKey = field.optionsLabelKey ?? 'title';
            const vKey = field.optionsValueKey ?? 'id';
            const paramName = field.dependsOnParam ?? field.dependsOnKey;
            api.get<ApiResponse<PaginatedResponse<Record<string, unknown>>>>(
                field.optionsEndpoint,
                {
                    params: { per_page: 200, [paramName]: parentValue },
                },
            )
                .then((res) => {
                    const items = res.data.data?.data ?? [];
                    setFilterOptions((prev) => ({
                        ...prev,
                        [field.key]: items.map((item) => ({
                            value: String(item[vKey]),
                            label: String(item[lKey]),
                        })),
                    }));
                })
                .catch(() => {
                    setFilterOptions((prev) => ({ ...prev, [field.key]: [] }));
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filterFields,
        ...filterFields
            .filter((f) => f.dependsOnKey)
            .map((f) => filterValues[f.dependsOnKey!]),
    ]);

    const handleFilterChange = (key: string, value: string) => {
        const next = { ...filterValues, [key]: value };
        // Clear any child filters that depend on this key
        filterFields.forEach((f) => {
            if (f.dependsOnKey === key) {
                next[f.key] = '';
            }
        });
        setFilterValues(next);
        const params: Record<string, unknown> = {};

        if (searchField && searchValue) {
            params[searchField] = searchValue;
        }

        Object.entries(next).forEach(([k, v]) => {
            if (v) {
                params[k] = v;
            }
        });
        search(params);
    };

    const initForm = useCallback(() => {
        const f: Record<string, unknown> = {};
        formFields.forEach((field) => {
            if (field.type === 'sub-table') {
                f[field.key] = [];
            } else if (field.type === 'switch') {
                f[field.key] = 0;
            } else {
                f[field.key] = '';
            }
        });

        return f;
    }, [formFields]);

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !importEndpoint || !companyId) {
            return;
        }

        e.target.value = '';
        setImportLoading(true);
        setImportError([]);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('company_id', String(companyId));
            await api.post(importEndpoint, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            reload();
        } catch (err: unknown) {
            const rowErrors = getApiPayload<{
                row_errors?: Array<{ row: number; errors: string[] }>;
            }>(err)?.row_errors;

            if (rowErrors) {
                setImportError(rowErrors);
            } else {
                setImportError([
                    { row: 0, errors: [getErrorMessage(err, '导入失败')] },
                ]);
            }
        } finally {
            setImportLoading(false);
        }
    };

    const handleExport = async () => {
        if (!exportEndpoint || !companyId) {
            return;
        }

        setExportLoading(true);

        try {
            const res = await api.get(exportEndpoint, {
                params: { company_id: companyId },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}导出.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // silent — browser will show nothing
        } finally {
            setExportLoading(false);
        }
    };

    const handleTemplate = async () => {
        if (!templateEndpoint || !companyId) {
            return;
        }

        try {
            const res = await api.get(templateEndpoint, {
                params: { company_id: companyId },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}导入模板.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // silent
        }
    };

    const handleCopy = async () => {
        if (!copyEndpoint || !selectedIds.size) {
            return;
        }

        setCopyLoading(true);

        try {
            await api.post(copyEndpoint, { ids: Array.from(selectedIds) });
            setSelectedIds(new Set());
            reload();
            setCopyMsg(`已复制 ${selectedIds.size} 条记录`);
            setTimeout(() => setCopyMsg(''), 3000);
        } catch (err: unknown) {
            setCopyMsg(getErrorMessage(err, '复制失败'));
            setTimeout(() => setCopyMsg(''), 3000);
        } finally {
            setCopyLoading(false);
        }
    };

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
        data.length > 0 &&
        data.every((r) => selectedIds.has(r[idKey] as number));
    const somePageSelected = data.some((r) =>
        selectedIds.has(r[idKey] as number),
    );

    const toggleAll = () => {
        if (allPageSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                data.forEach((r) => next.delete(r[idKey] as number));

                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                data.forEach((r) => next.add(r[idKey] as number));

                return next;
            });
        }
    };

    const handleSearch = useCallback(
        (val: string) => {
            setSearchValue(val);
            const params: Record<string, unknown> = {};

            if (searchField) {
                params[searchField] = val || undefined;
            }

            Object.entries(filterValues).forEach(([k, v]) => {
                if (v) {
                    params[k] = v;
                }
            });
            search(params);
        },

        [search, searchField, filterValues],
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
            if (field.type === 'sub-table') {
                f[field.key] = Array.isArray(row[field.key])
                    ? row[field.key]
                    : [];

                return;
            }

            let val = row[field.key] ?? (field.type === 'switch' ? 0 : '');

            if (
                field.type === 'date' &&
                typeof val === 'string' &&
                val.length > 10
            ) {
                val = val.slice(0, 10);
            }

            f[field.key] = val;
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
                if (field.visibleWhen && !field.visibleWhen(form)) {
                    payload[field.key] = null;

                    return;
                }

                if (field.type === 'sub-table') {
                    return;
                }

                if (field.type === 'number' && payload[field.key] !== '') {
                    payload[field.key] = Number(payload[field.key]);
                }

                if (field.type === 'switch') {
                    payload[field.key] = Number(payload[field.key]);
                }

                if (payload[field.key] === '') {
                    payload[field.key] = null;
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
        setDeleteLabel('');
        reload();
    };

    const updateForm = (key: string, value: unknown) =>
        setForm((f) => {
            const next = { ...f, [key]: value };
            // Clear any child field that depends on this key
            formFields.forEach((field) => {
                if (field.dependsOnField === key) {
                    next[field.key] = '';
                }
            });

            return next;
        });

    // Build table columns
    const checkboxColumn: ColumnDef<Record<string, unknown>> = {
        id: 'select',
        size: 40,
        header: () => (
            <input
                type="checkbox"
                checked={allPageSelected}
                ref={(el) => {
                    if (el) {
                        el.indeterminate = somePageSelected && !allPageSelected;
                    }
                }}
                onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border-blue-900/60 bg-[#070d1f] accent-blue-500"
            />
        ),
        cell: ({ row }: { row: { original: Record<string, unknown> } }) => (
            <input
                type="checkbox"
                checked={selectedIds.has(row.original[idKey] as number)}
                onChange={() => toggleRow(row.original[idKey] as number)}
                className="h-3.5 w-3.5 rounded border-blue-900/60 bg-[#070d1f] accent-blue-500"
            />
        ),
    };

    const tableColumns: ColumnDef<Record<string, unknown>>[] = [
        ...(copyEndpoint && canCreate ? [checkboxColumn] : []),
        ...colDefs.map((col) => ({
            accessorKey: col.key,
            header: col.header,
            size: col.width,
            cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
                if (col.render) {
                    return col.render(row.original[col.key], row.original);
                }

                const val = row.original[col.key];

                if (val === null || val === undefined) {
                    return <span className="text-slate-700">—</span>;
                }

                return String(val);
            },
        })),
    ];

    const showActionsColumn = enableDetail || canUpdate || canDelete;

    if (showActionsColumn) {
        const actionCount =
            (enableDetail ? 1 : 0) + (canUpdate ? 1 : 0) + (canDelete ? 1 : 0);
        tableColumns.push({
            id: 'actions',
            header: '操作',
            size: actionCount >= 3 ? 160 : actionCount === 2 ? 120 : 96,
            cell: ({ row }) => {
                const rowCompanyId = row.original.company_id as
                    | number
                    | undefined;
                // Row may still be locked even if the page is editable — when the row belongs
                // to a different company (only possible in bloc drill-downs; isSubordinate is
                // already folded into globalReadOnly above).
                const rowBelongsToUs =
                    rowCompanyId === undefined ||
                    rowCompanyId === rootCompany?.id;

                return (
                    <div className="flex items-center gap-0.5">
                        {enableDetail && (
                            <DetailButton
                                row={row.original}
                                onOpen={detail.openDetail}
                            />
                        )}
                        {canUpdate && rowBelongsToUs && (
                            <ActionButton
                                onClick={() => openEdit(row.original)}
                                variant="edit"
                                title="编辑"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </ActionButton>
                        )}
                        {canDelete && rowBelongsToUs && (
                            <ActionButton
                                onClick={() => {
                                    setDeleteId(row.original[idKey] as number);
                                    setDeleteLabel(
                                        String(
                                            row.original[labelKey] ??
                                                row.original[idKey] ??
                                                '',
                                        ),
                                    );
                                }}
                                variant="delete"
                                title="删除"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </ActionButton>
                        )}
                    </div>
                );
            },
        });
    }

    return (
        <>
            <Head title={title} />

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        {title}
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
                        新增{title}
                    </button>
                )}
            </div>

            {/* Import row errors */}
            {importError.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-600/8 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium text-red-400">
                            导入失败，请修正以下行后重新导入：
                        </p>
                        <button
                            onClick={() => setImportError([])}
                            className="text-red-600 hover:text-red-400"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <ul className="space-y-0.5 text-xs text-red-400/80">
                        {importError.map((e, i) => (
                            <li key={i}>
                                {e.row > 0 ? `第 ${e.row} 行：` : ''}
                                {e.errors.join('；')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <DataTable
                columns={tableColumns}
                data={data}
                isLoading={loading}
                searchPlaceholder={searchPlaceholder ?? `搜索${title}...`}
                searchValue={searchValue}
                onSearchChange={searchField ? handleSearch : undefined}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
                toolbar={
                    filterFields.length > 0 ||
                    copyEndpoint ||
                    templateEndpoint ||
                    importEndpoint ||
                    exportEndpoint ? (
                        <div className="flex items-center gap-2">
                            {filterFields.map((ff) => {
                                if (
                                    ff.dependsOnKey &&
                                    !filterValues[ff.dependsOnKey]
                                ) {
                                    return null;
                                }

                                const opts =
                                    ff.options ?? filterOptions[ff.key] ?? [];

                                return (
                                    <select
                                        key={ff.key}
                                        value={filterValues[ff.key] ?? ''}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                ff.key,
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 cursor-pointer appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 text-sm text-slate-300 transition-colors outline-none focus:border-blue-500/60"
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0d1530]"
                                        >
                                            {ff.placeholder}
                                        </option>
                                        {opts.map((o) => (
                                            <option
                                                key={o.value}
                                                value={o.value}
                                                className="bg-[#0d1530]"
                                            >
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                );
                            })}
                            {copyMsg && (
                                <span className="text-xs text-blue-400">
                                    {copyMsg}
                                </span>
                            )}
                            {copyEndpoint &&
                                canCreate &&
                                selectedIds.size > 0 && (
                                    <button
                                        onClick={handleCopy}
                                        disabled={copyLoading}
                                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/20 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {copyLoading ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                        复制已选 ({selectedIds.size})
                                    </button>
                                )}
                            {templateEndpoint && (
                                <button
                                    onClick={handleTemplate}
                                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                                >
                                    <FileDown className="h-3.5 w-3.5" />
                                    下载模板
                                </button>
                            )}
                            {importEndpoint && canCreate && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={handleImportFile}
                                    />
                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={importLoading}
                                        className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {importLoading ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Upload className="h-3.5 w-3.5" />
                                        )}
                                        导入
                                    </button>
                                </>
                            )}
                            {exportEndpoint && (
                                <button
                                    onClick={handleExport}
                                    disabled={exportLoading}
                                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {exportLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5" />
                                    )}
                                    导出
                                </button>
                            )}
                        </div>
                    ) : undefined
                }
            />

            {/* Create / Edit modal */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {editingId ? '编辑' : '新增'}
                            {title}
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

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4 p-6">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}
                        <div
                            className={cn(
                                'grid gap-4',
                                formFields.some((f) => f.colSpan === 2)
                                    ? 'md:grid-cols-2'
                                    : 'grid-cols-1',
                            )}
                        >
                            {formFields.map((field) => {
                                if (
                                    field.visibleWhen &&
                                    !field.visibleWhen(form)
                                ) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={field.key}
                                        className={
                                            field.colSpan === 2
                                                ? 'md:col-span-2'
                                                : ''
                                        }
                                    >
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            {field.label}
                                            {field.required && (
                                                <span className="ml-1 text-blue-500">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        {renderFormField(
                                            field,
                                            form,
                                            updateForm,
                                            dynamicOptions,
                                        )}
                                        {field.hint && (
                                            <p className="mt-1.5 text-xs text-slate-500">
                                                {field.hint}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
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
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {formLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {formLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </Modal>

            {detail.open && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="flex-1 bg-black/50"
                        onClick={detail.close}
                    />
                    <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-100">
                                    {detailTitle ?? `${title}详情`}
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-600">
                                    仅展示记录信息
                                </p>
                            </div>
                            <button
                                onClick={detail.close}
                                className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {detail.loading && (
                                <div className="flex h-40 items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                                </div>
                            )}

                            {!detail.loading && detail.error && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    {detail.error}
                                </div>
                            )}

                            {!detail.loading &&
                                !detail.error &&
                                detail.data &&
                                (() => {
                                    const detailData = detail.data;

                                    return (
                                        <div
                                            className={cn(
                                                'grid gap-4',
                                                formFields.some(
                                                    (f) => f.colSpan === 2,
                                                )
                                                    ? 'md:grid-cols-2'
                                                    : 'grid-cols-1',
                                            )}
                                        >
                                            {formFields.map((field) => (
                                                <div
                                                    key={field.key}
                                                    className={
                                                        field.colSpan === 2
                                                            ? 'md:col-span-2'
                                                            : ''
                                                    }
                                                >
                                                    <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                        {field.label}
                                                    </p>
                                                    {renderDetailField(
                                                        field,
                                                        detailData,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
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
                        删除{title}
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
                <DatePicker
                    value={(value as string) ?? ''}
                    onChange={(v) => updateForm(field.key, v)}
                    placeholder={field.placeholder}
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
        case 'video':
            return (
                <OssVideoUploadField
                    value={(value as string) ?? ''}
                    onChange={(url) => updateForm(field.key, url)}
                />
            );
        case 'sub-table': {
            const rows = (value as Record<string, unknown>[]) ?? [];
            const cols = field.subFields ?? [];
            const addRow = () => {
                const empty: Record<string, unknown> = {};
                cols.forEach((c) => {
                    empty[c.key] = '';
                });
                updateForm(field.key, [...rows, empty]);
            };
            const removeRow = (idx: number) =>
                updateForm(
                    field.key,
                    rows.filter((_, i) => i !== idx),
                );
            const updateCell = (idx: number, colKey: string, val: string) =>
                updateForm(
                    field.key,
                    rows.map((r, i) =>
                        i === idx ? { ...r, [colKey]: val } : r,
                    ),
                );

            return (
                <div className="overflow-x-auto rounded-lg border border-blue-900/30">
                    {rows.length > 0 && (
                        <table className="w-full min-w-max text-xs">
                            <thead>
                                <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                                    {cols.map((c) => (
                                        <th
                                            key={c.key}
                                            className="px-3 py-2 text-left font-medium tracking-wide text-slate-500 uppercase"
                                        >
                                            {c.label}
                                        </th>
                                    ))}
                                    <th className="w-8 px-2 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-blue-900/20 last:border-0"
                                    >
                                        {cols.map((c) => (
                                            <td
                                                key={c.key}
                                                className="px-2 py-1.5"
                                            >
                                                <input
                                                    type="text"
                                                    value={String(
                                                        row[c.key] ?? '',
                                                    )}
                                                    onChange={(e) =>
                                                        updateCell(
                                                            idx,
                                                            c.key,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={c.placeholder}
                                                    className="w-full rounded border border-blue-900/30 bg-transparent px-2 py-1 text-slate-200 placeholder-slate-700 outline-none focus:border-blue-500/60"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(idx)}
                                                className="text-slate-600 hover:text-red-400"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <button
                        type="button"
                        onClick={addRow}
                        className="flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                    >
                        <Plus className="h-3 w-3" />
                        添加成员
                    </button>
                </div>
            );
        }
        default:
            return null;
    }
}

function renderDetailField(field: FormField, row: Record<string, unknown>) {
    const value = row[field.key];

    if (value === null || value === undefined || value === '') {
        return <p className="text-sm text-slate-600">—</p>;
    }

    if (field.type === 'textarea') {
        return (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                {String(value)}
            </p>
        );
    }

    if (field.type === 'switch') {
        return (
            <p className="text-sm text-slate-300">
                {Number(value) === 1 ? '是' : '否'}
            </p>
        );
    }

    if (field.type === 'file' || field.type === 'video') {
        return <AttachmentViewer url={String(value)} label="查看附件" />;
    }

    if (field.type === 'date') {
        return (
            <p className="text-sm text-slate-300">
                {String(value).slice(0, 10)}
            </p>
        );
    }

    if (field.type === 'select' && field.options) {
        const selectedOption = field.options.find(
            (option) => option.value === String(value),
        );

        return (
            <p className="text-sm text-slate-300">
                {selectedOption?.label ?? String(value)}
            </p>
        );
    }

    // 异步 select（optionsEndpoint / dependsOnField）— 后端预加载关联关系时，
    // 对 `foo_id` 字段读取 `row.foo[optionsLabelKey]` 展示可读名称，避免显示裸 ID。
    if (
        field.type === 'select' &&
        (field.optionsEndpoint || field.dependsOnField) &&
        field.key.endsWith('_id')
    ) {
        const relationKey = field.key.slice(0, -3);
        const relation = row[relationKey] as Record<string, unknown> | null;
        const labelKey = field.optionsLabelKey ?? 'name';
        const label = relation?.[labelKey];

        if (label !== undefined && label !== null && label !== '') {
            return <p className="text-sm text-slate-300">{String(label)}</p>;
        }
    }

    if (field.type === 'sub-table' && Array.isArray(value)) {
        if (value.length === 0) {
            return <p className="text-sm text-slate-600">—</p>;
        }

        return (
            <div className="space-y-2">
                {value.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-blue-900/30 bg-[#070d1f] p-3"
                    >
                        {field.subFields?.map((subField) => (
                            <div
                                key={subField.key}
                                className="flex gap-2 text-sm"
                            >
                                <span className="text-slate-500">
                                    {subField.label}:
                                </span>
                                <span className="text-slate-300">
                                    {item?.[subField.key]
                                        ? String(item[subField.key])
                                        : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return <p className="text-sm text-slate-300">{String(value)}</p>;
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
