import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ClipboardList,
    Eye,
    FileText,
    Loader2,
    Pencil,
    Plus,
    Save,
    Send,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { uploadToOss } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

export interface DailyCheckRow {
    id: number;
    daily_check_template_id: number;
    path: string | null;
    number: number;
    comment: string | null;
    status: number;
    company_id: number;
    year: number;
}

export interface DailyCheckTemplateNode {
    id: number;
    title: string;
    level: number;
    sort: number;
    pid: number;
    year: number;
    score_range: string | null;
    child?: DailyCheckTemplateNode[];
    check?: DailyCheckRow | null;
}

export interface SubmissionRow {
    company_id: number;
    company_name: string;
    year: number;
    status: number;
    total_number: number;
    row_count: number;
    updated_at: string | null;
    title: string;
}

export const STATUS_DRAFT = 0;
export const STATUS_COMPLETED = 1;
export const STATUS_SCORED = 2;

export function statusLabel(s: number): string {
    if (s === STATUS_DRAFT) {
        return '填报中';
    }

    if (s === STATUS_COMPLETED) {
        return '已提交';
    }

    return '已评分';
}

export function statusStyle(s: number): string {
    if (s === STATUS_DRAFT) {
        return 'border-amber-500/30 bg-amber-600/10 text-amber-300';
    }

    if (s === STATUS_COMPLETED) {
        return 'border-cyan-500/30 bg-cyan-600/10 text-cyan-300';
    }

    return 'border-emerald-500/30 bg-emerald-600/10 text-emerald-300';
}

function splitPaths(path: string | null | undefined): string[] {
    if (!path) {
        return [];
    }

    return path
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function joinPaths(paths: string[]): string | null {
    const cleaned = paths.filter(Boolean);

    return cleaned.length ? cleaned.join(',') : null;
}

function fileNameOf(url: string): string {
    try {
        const n = url.split('/').pop() ?? url;

        return decodeURIComponent(n.split('?')[0]);
    } catch {
        return url;
    }
}

const YEAR_START = 2022;

// ── Page ──────────────────────────────────────────────────────────

export default function AssessmentFilingIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;
    const isTopLevel = !activeCompany || activeCompany.pid === 0;
    const { canWrite } = usePermission();
    const canCreate = canWrite('daily-checks.create');
    const canUpdate = canWrite('daily-checks.update');
    const canDelete = canWrite('daily-checks.delete');

    const [rows, setRows] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [yearPickerOpen, setYearPickerOpen] = useState(false);
    const [formState, setFormState] = useState<{
        year: number;
        isNew: boolean;
    } | null>(null);
    const [viewing, setViewing] = useState<SubmissionRow | null>(null);
    const [deleting, setDeleting] = useState<SubmissionRow | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchRows = useCallback(async () => {
        if (!companyId || isTopLevel) {
            setRows([]);

            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get<ApiResponse<SubmissionRow[]>>(
                '/daily-checks/submissions',
                {
                    params: { company_id: companyId },
                },
            );
            setRows(res.data.data ?? []);
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '加载失败');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [companyId, isTopLevel]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const handleDelete = useCallback(async () => {
        if (!deleting || !companyId) {
            return;
        }

        setDeleteLoading(true);

        try {
            await api.delete('/daily-checks/destroy-form', {
                data: { company_id: companyId, year: deleting.year },
            });
            setDeleting(null);
            await fetchRows();
        } finally {
            setDeleteLoading(false);
        }
    }, [deleting, companyId, fetchRows]);

    return (
        <>
            <Head title="考核填报" />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">
                            考核填报
                        </h1>
                        <p className="text-sm text-slate-400">
                            按年度填报日常目标管理工作考核材料，提交后由上级企业评分。
                        </p>
                    </div>
                    {!isTopLevel && canCreate && (
                        <button
                            type="button"
                            onClick={() => setYearPickerOpen(true)}
                            disabled={!companyId}
                            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-6 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30 disabled:opacity-40"
                        >
                            <Plus className="h-4 w-4" />
                            开始填报
                        </button>
                    )}
                </header>

                {isTopLevel && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-600/5 p-4 text-sm text-amber-300">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>当前为集团总部，无需填报考核材料。</span>
                    </div>
                )}

                {!isTopLevel && (
                    <>
                        <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                                    <tr>
                                        <th className="w-20 px-4 py-3">年度</th>
                                        <th className="px-4 py-3">考核</th>
                                        <th className="w-28 px-4 py-3">状态</th>
                                        <th className="w-32 px-4 py-3">
                                            更新时间
                                        </th>
                                        <th className="w-48 px-4 py-3 text-right">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {loading && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-6 text-center text-slate-500"
                                            >
                                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-6 text-center text-slate-500"
                                            >
                                                暂无考核记录，点击右上角按钮开始填报。
                                            </td>
                                        </tr>
                                    )}
                                    {rows.map((r) => (
                                        <tr
                                            key={`${r.company_id}-${r.year}`}
                                            className="text-slate-200 hover:bg-blue-950/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {r.year}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <ClipboardList className="h-3.5 w-3.5" />
                                                    {r.title}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded border px-1.5 py-0.5 text-[11px]',
                                                        statusStyle(r.status),
                                                    )}
                                                >
                                                    {statusLabel(r.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {r.updated_at
                                                    ? String(
                                                          r.updated_at,
                                                      ).slice(0, 10)
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {r.status ===
                                                    STATUS_DRAFT ? (
                                                        <>
                                                            {canUpdate && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setFormState(
                                                                            {
                                                                                year: r.year,
                                                                                isNew: false,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    继续填报
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeleting(
                                                                            r,
                                                                        )
                                                                    }
                                                                    title="删除"
                                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewing(r)
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            详情
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {error && (
                            <p className="text-xs text-red-400">{error}</p>
                        )}
                    </>
                )}
            </div>

            {yearPickerOpen && companyId && (
                <YearPickerModal
                    onClose={() => setYearPickerOpen(false)}
                    onPick={(year) => {
                        setYearPickerOpen(false);
                        setFormState({ year, isNew: true });
                    }}
                />
            )}

            {formState && companyId && (
                <FilingFormDrawer
                    companyId={companyId}
                    year={formState.year}
                    isNew={formState.isNew}
                    onClose={() => setFormState(null)}
                    onSaved={async () => {
                        setFormState(null);
                        await fetchRows();
                    }}
                />
            )}

            {deleting && (
                <DeleteModal
                    label={`${deleting.year} 年度填报`}
                    loading={deleteLoading}
                    onCancel={() => setDeleting(null)}
                    onConfirm={handleDelete}
                />
            )}

            {viewing && (
                <FilingDetailsDrawer
                    submission={viewing}
                    onClose={() => setViewing(null)}
                />
            )}
        </>
    );
}

// ── Year Picker ───────────────────────────────────────────────────

function YearPickerModal({
    onClose,
    onPick,
}: {
    onClose: () => void;
    onPick: (y: number) => void;
}) {
    const years = useMemo(() => {
        const current = new Date().getFullYear();
        const out: number[] = [];

        for (let y = current; y >= YEAR_START; y--) {
            out.push(y);
        }

        return out;
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        选择填报年度
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>
                <p className="mb-3 text-xs text-slate-500">
                    可选年度：{YEAR_START} - {new Date().getFullYear()}
                    。每个年度仅可填报一次。
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {years.map((y) => (
                        <button
                            key={y}
                            type="button"
                            onClick={() => onPick(y)}
                            className="rounded-lg border border-blue-900/40 bg-[#070d1f] py-3 text-sm text-slate-200 transition-colors hover:border-blue-500/40 hover:bg-blue-900/20"
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Filing Form Drawer ────────────────────────────────────────────

interface FilingFormDrawerProps {
    companyId: number;
    year: number;
    isNew: boolean;
    onClose: () => void;
    onSaved: () => void;
}

function FilingFormDrawer({
    companyId,
    year,
    isNew,
    onClose,
    onSaved,
}: FilingFormDrawerProps) {
    const [templates, setTemplates] = useState<DailyCheckTemplateNode[]>([]);
    const [pathsByTemplate, setPathsByTemplate] = useState<
        Record<number, string[]>
    >({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<null | 'draft' | 'complete'>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        api.get<ApiResponse<DailyCheckTemplateNode[]>>(
            '/daily-checks/start-form',
            {
                params: { company_id: companyId, year, is_new: isNew ? 1 : 0 },
            },
        )
            .then((res) => {
                if (ignore) {
                    return;
                }

                const tree = res.data.data ?? [];
                setTemplates(tree);
                const map: Record<number, string[]> = {};

                for (const top of tree) {
                    for (const child of top.child ?? []) {
                        map[child.id] = splitPaths(child.check?.path);
                    }
                }

                setPathsByTemplate(map);
            })
            .catch((e) => {
                const err = e as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                setError(
                    err.response?.data?.message ?? err.message ?? '加载失败',
                );
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [companyId, year, isNew]);

    const setPaths = (
        templateId: number,
        updater: (prev: string[]) => string[],
    ) => {
        setPathsByTemplate((prev) => ({
            ...prev,
            [templateId]: updater(prev[templateId] ?? []),
        }));
    };

    const buildItems = () => {
        const items: {
            daily_check_template_id: number;
            path: string | null;
        }[] = [];

        for (const top of templates) {
            for (const child of top.child ?? []) {
                const paths = pathsByTemplate[child.id] ?? [];
                items.push({
                    daily_check_template_id: child.id,
                    path: joinPaths(paths),
                });
            }
        }

        return items;
    };

    const saveDraft = async () => {
        setSaving('draft');
        setError(null);

        try {
            await api.post('/daily-checks/save-draft', {
                company_id: companyId,
                year,
                items: buildItems(),
            });
            onSaved();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '暂存失败');
        } finally {
            setSaving(null);
        }
    };

    const completeFiling = async () => {
        if (!confirm('提交后将无法再修改或删除，确定已完成填报？')) {
            return;
        }

        setSaving('complete');
        setError(null);

        try {
            await api.post('/daily-checks/save-draft', {
                company_id: companyId,
                year,
                items: buildItems(),
            });
            await api.post('/daily-checks/complete', {
                company_id: companyId,
                year,
            });
            onSaved();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '提交失败');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            日常目标管理工作考核 · {year} 年度
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            按一级指标 /
                            二级指标分项上传填报材料。可多次暂存；完成后点击右下方「我已完成填报」。
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
                    {loading && (
                        <div className="py-10 text-center">
                            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {!loading && !error && templates.length === 0 && (
                        <div className="rounded-lg border border-blue-900/40 bg-[#0b1226] p-6 text-center text-sm text-slate-500">
                            {year} 年度暂无考核模板，请联系管理员配置。
                        </div>
                    )}

                    {!loading && !error && templates.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-blue-900/40">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                                    <tr>
                                        <th className="w-48 border-r border-blue-900/30 px-4 py-3">
                                            一级指标
                                        </th>
                                        <th className="w-64 border-r border-blue-900/30 px-4 py-3">
                                            二级指标
                                        </th>
                                        <th className="w-32 border-r border-blue-900/30 px-4 py-3">
                                            评分参考
                                        </th>
                                        <th className="px-4 py-3">填报文件</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {templates.map((top) => {
                                        const children = top.child ?? [];

                                        if (children.length === 0) {
                                            return (
                                                <tr key={top.id}>
                                                    <td
                                                        colSpan={4}
                                                        className="px-4 py-3 text-xs text-slate-500"
                                                    >
                                                        {top.title}
                                                        （该一级指标下暂无二级指标）
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return children.map((child, idx) => (
                                            <tr key={child.id}>
                                                {idx === 0 && (
                                                    <td
                                                        rowSpan={
                                                            children.length
                                                        }
                                                        className="border-r border-blue-900/30 bg-[#0b1226] px-4 py-3 align-top font-medium text-slate-100"
                                                    >
                                                        {top.title}
                                                    </td>
                                                )}
                                                <td className="border-r border-blue-900/30 px-4 py-3 align-top text-slate-200">
                                                    {child.title}
                                                </td>
                                                <td className="border-r border-blue-900/30 px-4 py-3 align-top text-xs text-slate-400">
                                                    {child.score_range ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <MultiFileUpload
                                                        paths={
                                                            pathsByTemplate[
                                                                child.id
                                                            ] ?? []
                                                        }
                                                        onChange={(updater) =>
                                                            setPaths(
                                                                child.id,
                                                                updater,
                                                            )
                                                        }
                                                        templateKey={`daily-check/${companyId}/${year}/${child.id}`}
                                                    />
                                                </td>
                                            </tr>
                                        ));
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-300 hover:bg-blue-900/20"
                    >
                        关闭
                    </button>
                    <button
                        type="button"
                        onClick={saveDraft}
                        disabled={!!saving || loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/10 px-4 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-600/20 disabled:opacity-40"
                    >
                        {saving === 'draft' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        暂存
                    </button>
                    <button
                        type="button"
                        onClick={completeFiling}
                        disabled={!!saving || loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-600/25 disabled:opacity-40"
                    >
                        {saving === 'complete' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        我已完成填报
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Multi-file uploader ───────────────────────────────────────────

interface MultiFileUploadProps {
    paths: string[];
    onChange: (updater: (prev: string[]) => string[]) => void;
    templateKey?: string;
}

export function MultiFileUpload({
    paths,
    onChange,
    templateKey,
}: MultiFileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const dir = templateKey ? `uploads/${templateKey}/` : undefined;
            const uploaded: string[] = [];

            for (const file of Array.from(files)) {
                const url = await uploadToOss(file, dir);
                uploaded.push(url);
            }

            onChange((prev) => [...prev, ...uploaded]);
        } catch (e) {
            const err = e as { message?: string };
            setError(err.message ?? '上传失败');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200">
                {uploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <Upload className="h-3 w-3" />
                )}
                {uploading ? '上传中...' : '上传文件'}
                <input
                    type="file"
                    multiple
                    onChange={(e) => {
                        handleFiles(e.target.files);
                        e.currentTarget.value = '';
                    }}
                    disabled={uploading}
                    className="hidden"
                />
            </label>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            {paths.length > 0 && (
                <ul className="space-y-1">
                    {paths.map((p, i) => (
                        <li
                            key={`${p}-${i}`}
                            className="flex items-center gap-2 text-xs"
                        >
                            <FileText className="h-3 w-3 shrink-0 text-blue-400" />
                            <span className="truncate text-slate-300">
                                {fileNameOf(p)}
                            </span>
                            <AttachmentViewer
                                url={p}
                                filename={fileNameOf(p)}
                                label="查看"
                                className="shrink-0 text-xs text-blue-400 hover:text-blue-300"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    onChange((prev) =>
                                        prev.filter((_, idx) => idx !== i),
                                    )
                                }
                                className="ml-auto shrink-0 text-slate-600 hover:text-red-400"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ── Delete modal ─────────────────────────────────────────────────

function DeleteModal({
    label,
    loading,
    onCancel,
    onConfirm,
}: {
    label: string;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}) {
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
                        删除填报
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {label}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-40"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => void onConfirm()}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
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

// ── Read-only details drawer (for submitted/scored records) ─────

interface FilingDetailsDrawerProps {
    submission: SubmissionRow;
    onClose: () => void;
}

interface FilingDetail {
    company_id: number;
    year: number;
    status: number;
    total_number: number;
    templates: DailyCheckTemplateNode[];
}

export function FilingDetailsDrawer({
    submission,
    onClose,
}: FilingDetailsDrawerProps) {
    const [detail, setDetail] = useState<FilingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<FilingDetail>>('/daily-checks/submission', {
            params: {
                company_id: submission.company_id,
                year: submission.year,
            },
        })
            .then((res) => {
                if (!ignore) {
                    setDetail(res.data.data);
                }
            })
            .catch((e) => {
                const err = e as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };

                if (!ignore) {
                    setError(
                        err.response?.data?.message ??
                            err.message ??
                            '加载失败',
                    );
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [submission.company_id, submission.year]);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {submission.year} 年度考核填报 · 详情
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            状态：
                            <span
                                className={cn(
                                    'mx-1 inline-flex items-center rounded border px-1.5 py-0.5 text-[11px]',
                                    statusStyle(submission.status),
                                )}
                            >
                                {statusLabel(submission.status)}
                            </span>
                            {detail && (
                                <span>· 总分 {detail.total_number}</span>
                            )}
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
                    {loading && (
                        <div className="py-10 text-center">
                            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
                        </div>
                    )}
                    {!loading && error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}
                    {!loading && !error && detail && (
                        <div className="overflow-hidden rounded-lg border border-blue-900/40">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                                    <tr>
                                        <th className="w-40 border-r border-blue-900/30 px-4 py-3">
                                            一级指标
                                        </th>
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">
                                            二级指标
                                        </th>
                                        <th className="w-28 border-r border-blue-900/30 px-4 py-3">
                                            评分依据
                                        </th>
                                        <th className="border-r border-blue-900/30 px-4 py-3">
                                            填报文件
                                        </th>
                                        <th className="w-20 border-r border-blue-900/30 px-4 py-3">
                                            得分
                                        </th>
                                        <th className="px-4 py-3">评分意见</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {detail.templates.map((top) => {
                                        const children = top.child ?? [];

                                        if (children.length === 0) {
                                            return null;
                                        }

                                        return children.map((child, idx) => {
                                            const paths = splitPaths(
                                                child.check?.path,
                                            );

                                            return (
                                                <tr key={child.id}>
                                                    {idx === 0 && (
                                                        <td
                                                            rowSpan={
                                                                children.length
                                                            }
                                                            className="border-r border-blue-900/30 bg-[#0b1226] px-4 py-3 align-top font-medium text-slate-100"
                                                        >
                                                            {top.title}
                                                        </td>
                                                    )}
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-slate-200">
                                                        {child.title}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-xs text-slate-400">
                                                        {child.score_range ??
                                                            '—'}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                        {paths.length === 0 ? (
                                                            <span className="text-xs text-slate-600">
                                                                未上传
                                                            </span>
                                                        ) : (
                                                            <ul className="space-y-1">
                                                                {paths.map(
                                                                    (p, i) => (
                                                                        <li
                                                                            key={`${p}-${i}`}
                                                                            className="flex items-center gap-1.5 text-xs"
                                                                        >
                                                                            <FileText className="h-3 w-3 shrink-0 text-blue-400" />
                                                                            <span className="truncate text-slate-300">
                                                                                {fileNameOf(
                                                                                    p,
                                                                                )}
                                                                            </span>
                                                                            <AttachmentViewer
                                                                                url={
                                                                                    p
                                                                                }
                                                                                filename={fileNameOf(
                                                                                    p,
                                                                                )}
                                                                                label="查看"
                                                                                className="ml-auto shrink-0 text-blue-400 hover:text-blue-300"
                                                                            />
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        )}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-sm text-slate-200">
                                                        {child.check?.number ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-xs text-slate-300">
                                                        {child.check
                                                            ?.comment ? (
                                                            child.check.comment
                                                        ) : (
                                                            <span className="text-slate-600">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
