import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Settings2,
    Database,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    toolbar?: React.ReactNode;
}

export function DataTable<TData>({
    columns,
    data,
    isLoading,
    searchPlaceholder = '搜索...',
    searchValue,
    onSearchChange,
    pagination,
    onPageChange,
    toolbar,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [colMenuOpen, setColMenuOpen] = useState(false);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: { sorting, columnFilters, columnVisibility },
        manualPagination: !!pagination,
        pageCount: pagination?.last_page ?? -1,
    });

    const hideable = table.getAllColumns().filter((c) => c.getCanHide());

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
                {onSearchChange && (
                    <div className="relative max-w-xs flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                        <input
                            value={searchValue ?? ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-9 w-full rounded-lg border border-blue-900/40 bg-[#070d1f] pr-3 pl-9 text-sm text-slate-300 placeholder-slate-700 transition-colors outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                        />
                    </div>
                )}
                {toolbar}
                <div className="flex-1" />

                {/* Column visibility */}
                {hideable.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setColMenuOpen((v) => !v)}
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 text-xs text-slate-500 transition-colors hover:border-blue-500/40 hover:text-slate-300"
                        >
                            <Settings2 className="h-3.5 w-3.5" />
                            显示列
                            <ChevronDown
                                className={cn(
                                    'h-3 w-3 transition-transform',
                                    colMenuOpen && 'rotate-180',
                                )}
                            />
                        </button>
                        {colMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setColMenuOpen(false)}
                                />
                                <div className="absolute top-full right-0 z-40 mt-1.5 min-w-36 rounded-xl border border-blue-900/50 bg-[#0d1530] py-1.5 shadow-2xl shadow-black/40">
                                    {hideable.map((col) => (
                                        <label
                                            key={col.id}
                                            className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={col.getIsVisible()}
                                                onChange={(e) =>
                                                    col.toggleVisibility(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-3.5 w-3.5 rounded border-blue-900/60 bg-[#070d1f] accent-blue-500"
                                            />
                                            {typeof col.columnDef.header ===
                                            'string'
                                                ? col.columnDef.header
                                                : col.id}
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#0d1530]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Header */}
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr
                                    key={headerGroup.id}
                                    className="border-b border-blue-900/40 bg-[#070d1f]/60"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            style={
                                                header.column.columnDef.size
                                                    ? {
                                                          width: header.column
                                                              .columnDef.size,
                                                      }
                                                    : undefined
                                            }
                                            className="h-10 px-4 text-left align-middle text-[10px] font-semibold tracking-widest text-slate-600 uppercase first:pl-5 last:pr-5"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        {/* Body */}
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-blue-900/15"
                                    >
                                        {columns.map((_, j) => (
                                            <td
                                                key={j}
                                                className="px-4 py-3 first:pl-5 last:pr-5"
                                            >
                                                <div
                                                    className="h-4 animate-pulse rounded-md bg-blue-900/20"
                                                    style={{
                                                        width: `${60 + Math.random() * 30}%`,
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            'group border-b border-blue-900/15 transition-colors last:border-0',
                                            'hover:bg-blue-600/5',
                                            idx % 2 === 1 && 'bg-white/[0.015]',
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 align-middle text-slate-300 first:pl-5 last:pr-5"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-900/30 bg-blue-600/8">
                                                <Database className="h-5 w-5 text-slate-700" />
                                            </div>
                                            <p className="text-sm text-slate-700">
                                                暂无数据
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="flex items-center justify-between border-t border-blue-900/30 px-5 py-3">
                        <p className="text-xs text-slate-600">
                            共{' '}
                            <span className="font-medium text-slate-400">
                                {pagination.total}
                            </span>{' '}
                            条 &nbsp;·&nbsp; 第{' '}
                            <span className="font-medium text-slate-400">
                                {pagination.current_page}
                            </span>{' '}
                            <span className="text-slate-700">/</span>{' '}
                            <span className="font-medium text-slate-400">
                                {pagination.last_page}
                            </span>{' '}
                            页
                        </p>

                        <div className="flex items-center gap-1">
                            <PageBtn
                                onClick={() => onPageChange?.(1)}
                                disabled={pagination.current_page <= 1}
                                title="第一页"
                            >
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </PageBtn>
                            <PageBtn
                                onClick={() =>
                                    onPageChange?.(pagination.current_page - 1)
                                }
                                disabled={pagination.current_page <= 1}
                                title="上一页"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </PageBtn>

                            {/* Page number pills */}
                            {buildPageNumbers(
                                pagination.current_page,
                                pagination.last_page,
                            ).map((p, i) =>
                                p === '…' ? (
                                    <span
                                        key={`ellipsis-${i}`}
                                        className="px-1 text-xs text-slate-700"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() =>
                                            onPageChange?.(p as number)
                                        }
                                        className={cn(
                                            'flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-medium transition-colors',
                                            p === pagination.current_page
                                                ? 'border border-blue-500/30 bg-blue-600/20 text-blue-300'
                                                : 'text-slate-600 hover:bg-white/5 hover:text-slate-300',
                                        )}
                                    >
                                        {p}
                                    </button>
                                ),
                            )}

                            <PageBtn
                                onClick={() =>
                                    onPageChange?.(pagination.current_page + 1)
                                }
                                disabled={
                                    pagination.current_page >=
                                    pagination.last_page
                                }
                                title="下一页"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </PageBtn>
                            <PageBtn
                                onClick={() =>
                                    onPageChange?.(pagination.last_page)
                                }
                                disabled={
                                    pagination.current_page >=
                                    pagination.last_page
                                }
                                title="最后一页"
                            >
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </PageBtn>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────

function PageBtn({
    children,
    onClick,
    disabled,
    title,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled: boolean;
    title?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-300 disabled:pointer-events-none disabled:opacity-30"
        >
            {children}
        </button>
    );
}

function buildPageNumbers(current: number, last: number): (number | '…')[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | '…')[] = [1];

    if (current > 3) {
        pages.push('…');
    }

    for (
        let p = Math.max(2, current - 1);
        p <= Math.min(last - 1, current + 1);
        p++
    ) {
        pages.push(p);
    }

    if (current < last - 2) {
        pages.push('…');
    }

    pages.push(last);

    return pages;
}
