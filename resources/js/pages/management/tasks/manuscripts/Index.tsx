import { Head } from '@inertiajs/react';
import { Eye, Loader2, Pencil, Pin, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useAuth } from '@/hooks/use-auth';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

export interface InformationDraft {
    id: number;
    name: string;
    company_name: string;
    draft_department: string | null;
    draft_others: string | null;
    comment: string | null;
    annex_url: string | null;
    next_reviewer: number | null;
    is_top: number;
    status: number;
    company_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

type ManuscriptScope = 'published' | 'received';

// ── Helpers ───────────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function fmtDate(d: string | null | undefined): string {
    return d ? String(d).slice(0, 10) : '—';
}

// ── Page ──────────────────────────────────────────────────────────

export function ManuscriptsPage() {
    const { user } = useAuth();
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [scope, setScope] = useState<ManuscriptScope>('published');
    const [rows, setRows] = useState<InformationDraft[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');

    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<InformationDraft | null>(null);
    const [deleting, setDeleting] = useState<InformationDraft | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [viewing, setViewing] = useState<InformationDraft | null>(null);

    const fetchRows = useCallback(
        async (p: number, q: string, currentScope: ManuscriptScope) => {
            if (!companyId) {
                return;
            }

            setLoading(true);

            try {
                const res = await api.get<
                    ApiResponse<PaginatedData<InformationDraft>>
                >('/information-drafts', {
                    params: {
                        company_id: companyId,
                        scope: currentScope,
                        page: p,
                        per_page: 15,
                        ...(q ? { name: q } : {}),
                    },
                });
                setRows(res.data.data.data);
                setLastPage(res.data.data.last_page);
                setPage(res.data.data.current_page);
            } finally {
                setLoading(false);
            }
        },
        [companyId],
    );

    useEffect(() => {
        fetchRows(1, search, scope);
    }, [companyId, search, scope, fetchRows]);

    const handleDelete = useCallback(async () => {
        if (!deleting) {
            return;
        }

        setDeleteLoading(true);

        try {
            await api.delete(`/information-drafts/${deleting.id}`);
            setDeleting(null);
            await fetchRows(page, search, scope);
        } finally {
            setDeleteLoading(false);
        }
    }, [deleting, fetchRows, page, search, scope]);

    const { canWrite } = usePermission();
    const canCreate = canWrite('information-drafts.create');
    const canUpdate = canWrite('information-drafts.update');
    const canDelete = canWrite('information-drafts.delete');

    const isPublishedScope = scope === 'published';

    return (
        <>
            <Head title="信息稿件管理" />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">
                            信息稿件管理
                        </h1>
                        <p className="text-sm text-slate-400">
                            编写信息稿件，可发布至本级及下属企业，或上报给上级企业。
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="search"
                            placeholder="搜索标题..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn(inputCls, 'max-w-xs')}
                        />
                        {isPublishedScope && canCreate && (
                            <button
                                type="button"
                                onClick={() => setCreateOpen(true)}
                                disabled={!companyId}
                                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-8 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30 disabled:opacity-40"
                            >
                                <Plus className="h-4 w-4" />
                                新建信息稿
                            </button>
                        )}
                    </div>
                </header>

                <nav className="flex gap-2 border-b border-blue-900/40">
                    <TabButton
                        active={scope === 'published'}
                        onClick={() => setScope('published')}
                    >
                        我发布的
                    </TabButton>
                    <TabButton
                        active={scope === 'received'}
                        onClick={() => setScope('received')}
                    >
                        我收到的
                    </TabButton>
                </nav>

                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                            <tr>
                                <th className="px-4 py-3">标题</th>
                                <th className="w-40 px-4 py-3">
                                    {scope === 'received'
                                        ? '上报企业'
                                        : '起草企业'}
                                </th>
                                <th className="w-32 px-4 py-3">起草人</th>
                                <th className="w-24 px-4 py-3">状态</th>
                                <th className="w-20 px-4 py-3">附件</th>
                                <th className="w-28 px-4 py-3">创建时间</th>
                                <th className="w-52 px-4 py-3 text-right">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/30">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                    </td>
                                </tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        {scope === 'published'
                                            ? '暂无发布的稿件'
                                            : '暂无下级企业上报的稿件'}
                                    </td>
                                </tr>
                            )}
                            {rows.map((d) => {
                                const canManage = d.next_reviewer === companyId;

                                return (
                                    <tr
                                        key={d.id}
                                        className="text-slate-200 hover:bg-blue-950/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {d.is_top === 1 && (
                                                    <Pin className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                                )}
                                                <span className="font-medium">
                                                    {d.name}
                                                </span>
                                                {!canManage &&
                                                    (scope === 'published' ? (
                                                        <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-[10px] text-amber-300">
                                                            已上报
                                                        </span>
                                                    ) : (
                                                        <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">
                                                            上级发布
                                                        </span>
                                                    ))}
                                            </div>
                                            {d.comment && (
                                                <div
                                                    className="mt-0.5 truncate text-xs text-slate-500"
                                                    title={d.comment}
                                                >
                                                    {d.comment}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {d.company_name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {d.draft_others ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.status === 1 ? (
                                                <span className="inline-flex items-center rounded border border-emerald-500/20 bg-emerald-600/10 px-1.5 py-0.5 text-[11px] text-emerald-400">
                                                    已发布
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded border border-slate-700/50 bg-slate-700/20 px-1.5 py-0.5 text-[11px] text-slate-500">
                                                    未发布
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {d.annex_url ? (
                                                <OssDownloadLink
                                                    url={d.annex_url}
                                                    label="查看"
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {fmtDate(d.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setViewing(d)
                                                    }
                                                    title="详情"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    详情
                                                </button>
                                                {canManage && (
                                                    <>
                                                        {canUpdate && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setEditing(
                                                                        d,
                                                                    )
                                                                }
                                                                title="编辑"
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleting(
                                                                        d,
                                                                    )
                                                                }
                                                                title="删除"
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                        <button
                            onClick={() => fetchRows(page - 1, search, scope)}
                            disabled={page <= 1}
                            className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                        >
                            上一页
                        </button>
                        <span>
                            {page} / {lastPage}
                        </span>
                        <button
                            onClick={() => fetchRows(page + 1, search, scope)}
                            disabled={page >= lastPage}
                            className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                        >
                            下一页
                        </button>
                    </div>
                )}
            </div>

            {createOpen && companyId && activeCompany && (
                <DraftFormModal
                    companyId={companyId}
                    companyName={activeCompany.title}
                    companyPid={activeCompany.pid}
                    authorName={user?.nickname ?? user?.username ?? null}
                    onClose={() => setCreateOpen(false)}
                    onSaved={async () => {
                        setCreateOpen(false);
                        await fetchRows(1, search, scope);
                    }}
                />
            )}

            {editing && companyId && activeCompany && (
                <DraftFormModal
                    companyId={companyId}
                    companyName={activeCompany.title}
                    companyPid={activeCompany.pid}
                    authorName={user?.nickname ?? user?.username ?? null}
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await fetchRows(page, search, scope);
                    }}
                />
            )}

            {deleting && (
                <DeleteDraftModal
                    draft={deleting}
                    loading={deleteLoading}
                    onCancel={() => setDeleting(null)}
                    onConfirm={handleDelete}
                />
            )}

            {viewing && (
                <DraftDetailsModal
                    draft={viewing}
                    onClose={() => setViewing(null)}
                />
            )}
        </>
    );
}

export default function ManagementManuscriptsIndex() {
    return <ManuscriptsPage />;
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative -mb-px px-4 py-2 text-sm transition-colors',
                active
                    ? 'border-b-2 border-blue-400 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300',
            )}
        >
            {children}
        </button>
    );
}

// ── DraftFormModal (create + edit) ────────────────────────────────

interface DraftFormModalProps {
    companyId: number;
    companyName: string;
    companyPid: number;
    authorName: string | null;
    initial?: InformationDraft;
    onClose: () => void;
    onSaved: () => void;
}

function DraftFormModal({
    companyId,
    companyName,
    companyPid,
    authorName,
    initial,
    onClose,
    onSaved,
}: DraftFormModalProps) {
    const isEdit = !!initial;
    const canReport = companyPid > 0;

    const initialReport =
        initial?.next_reviewer != null && initial.next_reviewer !== companyId;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        draft_department: initial?.draft_department ?? '',
        draft_others: initial?.draft_others ?? authorName ?? '',
        comment: initial?.comment ?? '',
        annex_url: initial?.annex_url ?? '',
        report: initialReport,
        status: initial?.status ?? 1,
        is_top: initial?.is_top ?? 0,
    });

    const update = <K extends keyof typeof form>(
        key: K,
        value: (typeof form)[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入标题');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            const reporting = canReport && form.report;
            const payload = {
                name: form.name.trim(),
                draft_department: form.draft_department.trim() || null,
                draft_others: form.draft_others.trim() || null,
                comment: form.comment.trim() || null,
                annex_url: form.annex_url || null,
                next_reviewer: reporting ? companyPid : companyId,
                // Reporting forces status and is_top to 0; superior decides later.
                status: reporting ? 0 : form.status,
                is_top: reporting ? 0 : form.is_top,
                ...(isEdit
                    ? {}
                    : { company_id: companyId, company_name: companyName }),
            };

            if (isEdit && initial) {
                await api.put(`/information-drafts/${initial.id}`, payload);
            } else {
                await api.post('/information-drafts', payload);
            }

            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '保存失败';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const publishDisabled = canReport && form.report;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        {isEdit ? '编辑' : '新建'}信息稿件
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="标题" required>
                            <input
                                className={inputCls}
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                placeholder="请输入稿件标题"
                            />
                        </Field>
                        <Field label="起草企业">
                            <input
                                className={cn(
                                    inputCls,
                                    'cursor-not-allowed opacity-60',
                                )}
                                value={initial?.company_name ?? companyName}
                                readOnly
                            />
                        </Field>
                        <Field label="起草部门">
                            <input
                                className={inputCls}
                                value={form.draft_department}
                                onChange={(e) =>
                                    update('draft_department', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="起草人">
                            <input
                                className={inputCls}
                                value={form.draft_others}
                                onChange={(e) =>
                                    update('draft_others', e.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <Field label="内容">
                        <textarea
                            className={cn(inputCls, 'min-h-[120px]')}
                            value={form.comment}
                            onChange={(e) => update('comment', e.target.value)}
                        />
                    </Field>

                    <Field label="附件">
                        <OssUploadField
                            value={form.annex_url}
                            onChange={(url) => update('annex_url', url)}
                        />
                    </Field>

                    <div className="grid gap-3 rounded-lg border border-blue-900/40 bg-[#070d1f] p-3 sm:grid-cols-3">
                        {canReport ? (
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.report}
                                    onChange={(e) =>
                                        update('report', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                />
                                上报至上级企业
                            </label>
                        ) : (
                            <div className="text-xs text-slate-500">
                                （当前为顶级企业，不可上报）
                            </div>
                        )}
                        <label
                            className={cn(
                                'flex items-center gap-2 text-sm',
                                publishDisabled
                                    ? 'text-slate-600'
                                    : 'text-slate-300',
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={!publishDisabled && form.status === 1}
                                onChange={(e) =>
                                    update('status', e.target.checked ? 1 : 0)
                                }
                                disabled={publishDisabled}
                                className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-emerald-500 disabled:cursor-not-allowed"
                            />
                            发布
                        </label>
                        <label
                            className={cn(
                                'flex items-center gap-2 text-sm',
                                publishDisabled
                                    ? 'text-slate-600'
                                    : 'text-slate-300',
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={!publishDisabled && form.is_top === 1}
                                onChange={(e) =>
                                    update('is_top', e.target.checked ? 1 : 0)
                                }
                                disabled={publishDisabled}
                                className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-amber-500 disabled:cursor-not-allowed"
                            />
                            置顶
                        </label>
                    </div>
                    <p className="text-[11px] text-slate-500">
                        {publishDisabled
                            ? '已选择上报：稿件将移交上级企业处理，不可直接发布或置顶，由上级决定是否发布。'
                            : '未上报：稿件可直接发布给本级及下属企业查看。'}
                    </p>
                </div>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || !form.name.trim()}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        保存
                    </button>
                </footer>
            </div>
        </div>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block text-xs text-slate-400">
            <span className="mb-1 block">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </span>
            {children}
        </label>
    );
}

// ── DraftDetailsModal ─────────────────────────────────────────────

interface DraftDetailsModalProps {
    draft: InformationDraft;
    onClose: () => void;
}

export function DraftDetailsModal({ draft, onClose }: DraftDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            {draft.is_top === 1 && (
                                <Pin className="h-4 w-4 text-amber-400" />
                            )}
                            <h2 className="text-base font-semibold text-slate-100">
                                {draft.name}
                            </h2>
                            {draft.status === 1 ? (
                                <span className="inline-flex items-center rounded border border-emerald-500/20 bg-emerald-600/10 px-1.5 py-0.5 text-[11px] text-emerald-400">
                                    已发布
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded border border-slate-700/50 bg-slate-700/20 px-1.5 py-0.5 text-[11px] text-slate-500">
                                    未发布
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">
                            仅展示记录信息
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <DetailRow
                            label="起草企业"
                            value={draft.company_name}
                        />
                        <DetailRow
                            label="起草部门"
                            value={draft.draft_department ?? '—'}
                        />
                        <DetailRow
                            label="起草人"
                            value={draft.draft_others ?? '—'}
                        />
                        <DetailRow
                            label="创建时间"
                            value={fmtDate(draft.created_at)}
                        />
                        <div>
                            <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                内容
                            </p>
                            <div className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                                {draft.comment ?? (
                                    <span className="text-slate-600">
                                        暂无内容
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                附件
                            </p>
                            {draft.annex_url ? (
                                <OssDownloadLink
                                    url={draft.annex_url}
                                    label="下载附件"
                                />
                            ) : (
                                <span className="text-sm text-slate-600">
                                    —
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{value}</p>
        </div>
    );
}

// ── DeleteDraftModal ──────────────────────────────────────────────

interface DeleteDraftModalProps {
    draft: InformationDraft;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

function DeleteDraftModal({
    draft,
    loading,
    onCancel,
    onConfirm,
}: DeleteDraftModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-xl border border-blue-900/40 bg-[#050915] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除稿件
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {draft.name}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-40"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => void onConfirm()}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </div>
        </div>
    );
}
