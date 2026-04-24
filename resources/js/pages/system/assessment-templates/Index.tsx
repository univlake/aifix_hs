import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Copy,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ──────────────────────────────────────────────────────────

type TemplateKind = 'daily' | 'accident' | 'add_points';

interface TemplateNode {
    id: number;
    title: string;
    level: number;
    sort: number;
    pid: number;
    year: number;
    score_range: string | null;
    child?: TemplateNode[];
}

interface CopySummary {
    from_year: number;
    to_year: number;
    summary: Record<TemplateKind, { copied: number }>;
}

const KIND_META: Record<
    TemplateKind,
    { label: string; endpoint: string; permBase: string }
> = {
    daily: {
        label: '日常考核模板',
        endpoint: '/daily-check-templates',
        permBase: 'daily-check-templates',
    },
    accident: {
        label: '事故考核模板',
        endpoint: '/accident-check-templates',
        permBase: 'accident-check-templates',
    },
    add_points: {
        label: '加分项模板',
        endpoint: '/add-points-templates',
        permBase: 'add-points-templates',
    },
};

const KIND_ORDER: TemplateKind[] = ['daily', 'accident', 'add_points'];

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

// ── Helpers ────────────────────────────────────────────────────────

function currentYear() {
    return new Date().getFullYear();
}

function nodeChildren(node: TemplateNode): TemplateNode[] {
    return node.child ?? [];
}

// ── Page ──────────────────────────────────────────────────────────

export default function AssessmentTemplatesIndex() {
    const [year, setYear] = useState<number>(currentYear());
    const [knownYears, setKnownYears] = useState<number[]>([]);
    const [kind, setKind] = useState<TemplateKind>('daily');
    const [tree, setTree] = useState<TemplateNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copyOpen, setCopyOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<{
        node: TemplateNode | null;
        parent: TemplateNode | null;
    } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TemplateNode | null>(null);

    const { canWrite } = usePermission();
    const permBase = KIND_META[kind].permBase;
    const canCreate = canWrite(`${permBase}.create`);
    const canUpdate = canWrite(`${permBase}.update`);
    const canDelete = canWrite(`${permBase}.delete`);
    const canCopyAny =
        canWrite('daily-check-templates.create') ||
        canWrite('accident-check-templates.create') ||
        canWrite('add-points-templates.create');

    const loadYears = useCallback(async () => {
        try {
            const res = await api.get<ApiResponse<number[]>>(
                '/assessment-templates/years',
            );
            setKnownYears(res.data.data ?? []);
        } catch {
            setKnownYears([]);
        }
    }, []);

    const loadTree = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const res = await api.get<ApiResponse<TemplateNode[]>>(
                KIND_META[kind].endpoint,
                { params: { year } },
            );
            setTree(res.data.data ?? []);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '加载失败');
            setTree([]);
        } finally {
            setLoading(false);
        }
    }, [kind, year]);

    useEffect(() => {
        loadYears();
    }, [loadYears]);

    useEffect(() => {
        loadTree();
    }, [loadTree]);

    const yearOptions = useMemo(() => {
        const set = new Set<number>([
            ...knownYears,
            currentYear(),
            currentYear() + 1,
            year,
        ]);

        return Array.from(set).sort((a, b) => b - a);
    }, [knownYears, year]);

    const totals = useMemo(() => {
        let roots = 0;
        let all = 0;

        const walk = (nodes: TemplateNode[]) => {
            for (const n of nodes) {
                all++;
                walk(nodeChildren(n));
            }
        };

        roots = tree.length;
        walk(tree);

        return { roots, all };
    }, [tree]);

    const onCopied = async (result: CopySummary) => {
        await loadYears();
        setYear(result.to_year);
        setCopyOpen(false);
    };

    const onCrudSaved = () => {
        setEditTarget(null);
        loadTree();
    };

    const deleteNode = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await api.delete(`${KIND_META[kind].endpoint}/${deleteTarget.id}`);
            setDeleteTarget(null);
            loadTree();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            window.alert(e?.response?.data?.message ?? '删除失败');
        }
    };

    return (
        <>
            <Head title="考核模板管理" />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-600/15">
                            <ClipboardList className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-100">
                                考核模板管理
                            </h1>
                            <p className="text-sm text-slate-500">
                                按年度维护日常考核、事故考核与加分项的评分模板
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <select
                            className={cn(selectCls, 'w-32')}
                            value={String(year)}
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {yearOptions.map((y) => (
                                <option
                                    key={y}
                                    value={y}
                                    className="bg-[#0d1530]"
                                >
                                    {y}
                                </option>
                            ))}
                        </select>
                        {canCopyAny && (
                            <button
                                type="button"
                                onClick={() => setCopyOpen(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-600/15 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/25"
                            >
                                <Copy className="h-4 w-4" />
                                从上一年度复制
                            </button>
                        )}
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() =>
                                    setEditTarget({ node: null, parent: null })
                                }
                                className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-600/25"
                            >
                                <Plus className="h-4 w-4" />
                                新增条目
                            </button>
                        )}
                    </div>
                </header>

                {/* Kind tabs */}
                <div className="flex items-center gap-0.5 border-b border-blue-900/30">
                    {KIND_ORDER.map((k) => {
                        const active = kind === k;

                        return (
                            <button
                                key={k}
                                onClick={() => setKind(k)}
                                className={cn(
                                    'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'border-blue-500 text-blue-300'
                                        : 'border-transparent text-slate-500 hover:text-slate-300',
                                )}
                            >
                                {KIND_META[k].label}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Body */}
                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <div className="flex items-center justify-between border-b border-blue-900/30 px-4 py-2.5">
                        <p className="text-xs text-slate-500">
                            {year} 年 · {KIND_META[kind].label} ·{' '}
                            <span className="text-slate-400">
                                一级 {totals.roots} 项 / 共 {totals.all} 项
                            </span>
                        </p>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        </div>
                    ) : tree.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-600">
                            {year} 年度 {KIND_META[kind].label} 暂无数据
                            <p className="mt-2 text-xs text-slate-700">
                                可点击右上角 &ldquo;从上一年度复制&rdquo; 或
                                &ldquo;新增条目&rdquo; 开始创建
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-blue-900/20">
                            {tree.map((node) => (
                                <TreeRow
                                    key={node.id}
                                    node={node}
                                    onEdit={(n, parent) =>
                                        setEditTarget({ node: n, parent })
                                    }
                                    onDelete={(n) => setDeleteTarget(n)}
                                    onAddChild={(parent) =>
                                        setEditTarget({ node: null, parent })
                                    }
                                    canCreate={canCreate}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CopyModal
                open={copyOpen}
                onClose={() => setCopyOpen(false)}
                onCopied={onCopied}
                knownYears={knownYears}
                defaultTarget={year}
            />

            <EditModal
                target={editTarget}
                year={year}
                kind={kind}
                onClose={() => setEditTarget(null)}
                onSaved={onCrudSaved}
            />

            {deleteTarget && (
                <ConfirmModal
                    title="删除考核项"
                    message={`确定要删除「${deleteTarget.title}」吗？删除后其所有子项也将一并删除。`}
                    confirmLabel="删除"
                    onConfirm={deleteNode}
                    onCancel={() => setDeleteTarget(null)}
                    danger
                />
            )}
        </>
    );
}

// ── Tree row ──────────────────────────────────────────────────────

function TreeRow({
    node,
    parent = null,
    depth = 0,
    onEdit,
    onDelete,
    onAddChild,
    canCreate,
    canUpdate,
    canDelete,
}: {
    node: TemplateNode;
    parent?: TemplateNode | null;
    depth?: number;
    onEdit: (n: TemplateNode, parent: TemplateNode | null) => void;
    onDelete: (n: TemplateNode) => void;
    onAddChild: (parent: TemplateNode) => void;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}) {
    const children = nodeChildren(node);
    const hasChildren = children.length > 0;
    const [expanded, setExpanded] = useState(depth < 1);

    return (
        <div>
            <div
                className="flex items-start gap-2 px-4 py-2.5 transition-colors hover:bg-blue-950/20"
                style={{ paddingLeft: `${16 + depth * 20}px` }}
            >
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    disabled={!hasChildren}
                    className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 transition-colors',
                        hasChildren
                            ? 'hover:bg-blue-600/10 hover:text-blue-300'
                            : 'invisible',
                    )}
                >
                    {expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-sm whitespace-pre-wrap text-slate-200">
                        {node.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                        层级 L{node.level} · 排序 {node.sort}
                        {node.score_range && (
                            <>
                                {' '}
                                · 分值{' '}
                                <span className="text-emerald-400/80">
                                    {node.score_range}
                                </span>
                            </>
                        )}
                        {hasChildren && <> · 子项 {children.length}</>}
                    </p>
                </div>

                <div className="flex items-center gap-0.5">
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => onAddChild(node)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                            title="新增子项"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {canUpdate && (
                        <button
                            type="button"
                            onClick={() => onEdit(node, parent)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                            title="编辑"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(node)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-600/10 hover:text-red-400"
                            title="删除"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="border-t border-blue-900/15 bg-[#0a1124]">
                    {children.map((c) => (
                        <TreeRow
                            key={c.id}
                            node={c}
                            parent={node}
                            depth={depth + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            canCreate={canCreate}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Edit modal (add / edit node) ──────────────────────────────────

function EditModal({
    target,
    year,
    kind,
    onClose,
    onSaved,
}: {
    target: { node: TemplateNode | null; parent: TemplateNode | null } | null;
    year: number;
    kind: TemplateKind;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [title, setTitle] = useState('');
    const [sort, setSort] = useState('0');
    const [score, setScore] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const isEdit = Boolean(target?.node);
    const parent = target?.parent ?? null;
    const level = target?.node?.level ?? (parent ? parent.level + 1 : 1);

    useEffect(() => {
        if (target) {
            setTitle(target.node?.title ?? '');
            setSort(String(target.node?.sort ?? 0));
            setScore(target.node?.score_range ?? '');
            setError('');
        }
    }, [target]);

    if (!target) {
        return null;
    }

    const submit = async () => {
        if (!title.trim()) {
            setError('请输入条目标题');

            return;
        }

        setSaving(true);
        setError('');

        const payload = {
            title: title.trim(),
            level,
            sort: Number(sort) || 0,
            pid: parent?.id ?? 0,
            year,
            score_range: score.trim() || null,
        };

        try {
            if (isEdit && target.node) {
                await api.put(
                    `${KIND_META[kind].endpoint}/${target.node.id}`,
                    payload,
                );
            } else {
                await api.post(KIND_META[kind].endpoint, payload);
            }

            onSaved();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '保存失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog onClose={onClose}>
            <DialogHeader
                title={
                    isEdit
                        ? '编辑考核项'
                        : parent
                          ? `在 ${parent.title.slice(0, 18)}${parent.title.length > 18 ? '…' : ''} 下新增子项`
                          : '新增一级考核项'
                }
                subtitle={`${KIND_META[kind].label} · ${year} 年 · 层级 L${level}`}
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}
                    <Field label="条目标题" required>
                        <textarea
                            className={cn(inputCls, 'min-h-[96px] resize-y')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例如：1.强化工作组织领导，贯彻落实相关法律法规。"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="排序">
                            <input
                                type="number"
                                className={inputCls}
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            />
                        </Field>
                        <Field label="分值范围">
                            <input
                                className={inputCls}
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder="例如 3 或 0-5"
                            />
                        </Field>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={submit}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50"
                >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    保存
                </button>
            </div>
        </Dialog>
    );
}

// ── Copy modal ────────────────────────────────────────────────────

function CopyModal({
    open,
    onClose,
    onCopied,
    knownYears,
    defaultTarget,
}: {
    open: boolean;
    onClose: () => void;
    onCopied: (result: CopySummary) => void;
    knownYears: number[];
    defaultTarget: number;
}) {
    const [fromYear, setFromYear] = useState<number>(defaultTarget - 1);
    const [toYear, setToYear] = useState<number>(defaultTarget);
    const [kinds, setKinds] = useState<Record<TemplateKind, boolean>>({
        daily: true,
        accident: true,
        add_points: true,
    });
    const [overwrite, setOverwrite] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            const fallbackFrom =
                knownYears.find((y) => y < defaultTarget) ?? defaultTarget - 1;
            setFromYear(fallbackFrom);
            setToYear(defaultTarget);
            setKinds({ daily: true, accident: true, add_points: true });
            setOverwrite(false);
            setError('');
        }
    }, [open, defaultTarget, knownYears]);

    if (!open) {
        return null;
    }

    const sourceOptions = Array.from(new Set([...knownYears])).sort(
        (a, b) => b - a,
    );
    const targetOptions = Array.from(
        new Set([defaultTarget, currentYear(), currentYear() + 1, toYear]),
    ).sort((a, b) => b - a);
    const selectedKinds = (Object.keys(kinds) as TemplateKind[]).filter(
        (k) => kinds[k],
    );

    const submit = async () => {
        if (fromYear === toYear) {
            setError('源年度与目标年度不能相同');

            return;
        }

        if (selectedKinds.length === 0) {
            setError('至少选择一种模板');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await api.post<ApiResponse<CopySummary>>(
                '/assessment-templates/copy',
                {
                    from_year: fromYear,
                    to_year: toYear,
                    kinds: selectedKinds,
                    overwrite,
                },
            );
            onCopied(res.data.data);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '复制失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog onClose={onClose}>
            <DialogHeader
                title="从上一年度复制考核模板"
                subtitle="一键拷贝三张模板表到目标年度"
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="源年度" required>
                            <select
                                className={selectCls}
                                value={String(fromYear)}
                                onChange={(e) =>
                                    setFromYear(Number(e.target.value))
                                }
                            >
                                {sourceOptions.length === 0 && (
                                    <option
                                        value={fromYear}
                                        className="bg-[#0d1530]"
                                    >
                                        {fromYear}
                                    </option>
                                )}
                                {sourceOptions.map((y) => (
                                    <option
                                        key={y}
                                        value={y}
                                        className="bg-[#0d1530]"
                                    >
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="目标年度" required>
                            <select
                                className={selectCls}
                                value={String(toYear)}
                                onChange={(e) =>
                                    setToYear(Number(e.target.value))
                                }
                            >
                                {targetOptions.map((y) => (
                                    <option
                                        key={y}
                                        value={y}
                                        className="bg-[#0d1530]"
                                    >
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                    <Field label="复制范围">
                        <div className="flex flex-wrap gap-2">
                            {KIND_ORDER.map((k) => (
                                <label
                                    key={k}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors',
                                        kinds[k]
                                            ? 'border-blue-500/40 bg-blue-600/10 text-blue-300'
                                            : 'border-blue-900/40 bg-[#070d1f] text-slate-500',
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={kinds[k]}
                                        onChange={(e) =>
                                            setKinds((prev) => ({
                                                ...prev,
                                                [k]: e.target.checked,
                                            }))
                                        }
                                        className="h-3.5 w-3.5 accent-blue-500"
                                    />
                                    {KIND_META[k].label}
                                </label>
                            ))}
                        </div>
                    </Field>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                        <input
                            type="checkbox"
                            checked={overwrite}
                            onChange={(e) => setOverwrite(e.target.checked)}
                            className="h-3.5 w-3.5 accent-red-500"
                        />
                        覆盖目标年度已有数据（将先清空目标年度对应表）
                    </label>
                    <p className="text-[11px] text-slate-600">
                        提示：复制操作会保留层级关系，不会影响源年度数据。若目标年度已有记录且未勾选覆盖，将返回错误。
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={submit}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-600/30 disabled:opacity-50"
                >
                    {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                    开始复制
                </button>
            </div>
        </Dialog>
    );
}

// ── Shared dialog primitives ──────────────────────────────────────

function Dialog({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl">
                {children}
            </div>
        </div>
    );
}

function DialogHeader({
    title,
    subtitle,
    onClose,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <div>
                <h2 className="text-base font-semibold text-slate-100">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
            >
                <X className="h-4 w-4" />
            </button>
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
        <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

function ConfirmModal({
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    danger,
}: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}) {
    const [submitting, setSubmitting] = useState(false);

    const handle = async () => {
        setSubmitting(true);

        try {
            await onConfirm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog onClose={onCancel}>
            <div className="p-6">
                <div
                    className={cn(
                        'mb-4 flex h-11 w-11 items-center justify-center rounded-xl border',
                        danger
                            ? 'border-red-500/30 bg-red-600/10'
                            : 'border-blue-500/30 bg-blue-600/10',
                    )}
                >
                    <AlertTriangle
                        className={cn(
                            'h-5 w-5',
                            danger ? 'text-red-400' : 'text-blue-400',
                        )}
                    />
                </div>
                <h2 className="mb-1 text-base font-semibold text-slate-100">
                    {title}
                </h2>
                <p className="text-sm text-slate-500">{message}</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={handle}
                    disabled={submitting}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50',
                        danger
                            ? 'border border-red-500/30 bg-red-600/15 text-red-400 hover:bg-red-600/25'
                            : 'border border-blue-500/30 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30',
                    )}
                >
                    {submitting && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {confirmLabel}
                </button>
            </div>
        </Dialog>
    );
}
