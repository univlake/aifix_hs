import { Head } from '@inertiajs/react';
import { Eye, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker } from '@/components/shared/DatePicker';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

interface StuffResponse extends Record<string, unknown> {
    company_id: number;
    company_name?: string;
    govern_hidden_danger?: unknown[];
    accident_bulletin?: unknown[];
    no_rectify_info?: string | null;
}

// ── Types ─────────────────────────────────────────────────────────

export interface MonthStatisticControlRow {
    id?: number;
    govern_title: string | null;
    govern_supplies: string | null;
    govern_user: string | null;
    govern_date: string | null;
    govern_text: string | null;
    govern_money: string | null;
}

export interface MonthStatisticAccidentRow {
    id?: number;
    happen_time: string | null;
    department: string | null;
    name: string | null;
    sex: string | null;
    age: number | null;
    work_type: string | null;
    work_age: number | null;
    education_level: string | null;
    degree_injury: string | null;
    type: string | null;
    direct_cause: string | null;
    content: string | null;
    days_off: number | null;
    direct_loss_property: string | null;
}

export interface MonthStatistic {
    id: number;
    average_employee: number;
    safety_meeting_count: number;
    fire_meeting_count: number;
    safety_check_count: number;
    fire_check_count: number;
    safety_funding: number;
    fire_funding: number;
    hydrating_seedlings: number;
    retrofit_electrical: number;
    fire_extinguisher: number;
    smart_fire: number;
    safety_training_count: number;
    safety_training_number: number;
    new_people_training_number: number;
    fire_training_count: number;
    fire_training_number: number;
    safety_emergency_count: number;
    safety_emergency_number: number;
    fire_emergency_count: number;
    fire_emergency_number: number;
    some_hidden_danger: number;
    some_rectify_hidden_danger: number;
    no_rectify_info: string | null;
    big_hidden_danger: number;
    big_rectify_hidden_danger: number;
    govern_hidden_danger_count: number;
    fire_fighting_danger: number;
    fire_fighting_hidden_danger: number;
    fire_fighting_hidden_danger_rectify: number;
    accident_bulletin_count: number;
    company_id: number;
    company?: { id: number; title: string } | null;
    created_at: string;
    month_statistic_control?: MonthStatisticControlRow[];
    monthStatisticControl?: MonthStatisticControlRow[];
    month_statistic_accident?: MonthStatisticAccidentRow[];
    monthStatisticAccident?: MonthStatisticAccidentRow[];
}

export const monthFieldGroups: {
    title: string;
    fields: { key: keyof MonthStatistic; label: string }[];
}[] = [
    {
        title: '基础指标',
        fields: [{ key: 'average_employee', label: '平均职工数量' }],
    },
    {
        title: '例会 / 检查',
        fields: [
            { key: 'safety_meeting_count', label: '安全例会次数' },
            { key: 'fire_meeting_count', label: '消防例会次数' },
            { key: 'safety_check_count', label: '安全检查次数' },
            { key: 'fire_check_count', label: '消防检查次数' },
        ],
    },
    {
        title: '投入费用',
        fields: [
            { key: 'safety_funding', label: '当月安全投入费用' },
            { key: 'fire_funding', label: '当月消防投入费用' },
        ],
    },
    {
        title: '消防器材增添',
        fields: [
            { key: 'hydrating_seedlings', label: '水带苗子' },
            { key: 'retrofit_electrical', label: '改造电气线路' },
            { key: 'fire_extinguisher', label: '灭火器' },
            { key: 'smart_fire', label: '智慧消防系统' },
        ],
    },
    {
        title: '培训',
        fields: [
            { key: 'safety_training_count', label: '安全培训次数' },
            { key: 'safety_training_number', label: '安全培训人数' },
            { key: 'new_people_training_number', label: '新员工培训人数' },
            { key: 'fire_training_count', label: '消防培训次数' },
            { key: 'fire_training_number', label: '消防培训人数' },
        ],
    },
    {
        title: '演练',
        fields: [
            { key: 'safety_emergency_count', label: '应急救援演练次数' },
            { key: 'safety_emergency_number', label: '应急演练人数' },
            { key: 'fire_emergency_count', label: '消防演练次数' },
            { key: 'fire_emergency_number', label: '消防演练人数' },
        ],
    },
    {
        title: '隐患排查',
        fields: [
            { key: 'some_hidden_danger', label: '一般隐患排查数量' },
            { key: 'some_rectify_hidden_danger', label: '一般隐患整改数量' },
            { key: 'big_hidden_danger', label: '重大隐患排查数量' },
            { key: 'big_rectify_hidden_danger', label: '重大隐患整改数量' },
            {
                key: 'govern_hidden_danger_count',
                label: '列入治理计划重大隐患',
            },
            { key: 'fire_fighting_danger', label: '消防隐患排查数量' },
            {
                key: 'fire_fighting_hidden_danger',
                label: '消防执法部门检查隐患',
            },
            {
                key: 'fire_fighting_hidden_danger_rectify',
                label: '消防执法隐患整改',
            },
        ],
    },
    {
        title: '事故',
        fields: [{ key: 'accident_bulletin_count', label: '当月事故数量' }],
    },
];

// ── Helpers ───────────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function yearMonth(d: string | null | undefined): string {
    return d ? String(d).slice(0, 7) : '—';
}

export function pickControls(m: MonthStatistic): MonthStatisticControlRow[] {
    return m.month_statistic_control ?? m.monthStatisticControl ?? [];
}

export function pickAccidents(m: MonthStatistic): MonthStatisticAccidentRow[] {
    return m.month_statistic_accident ?? m.monthStatisticAccident ?? [];
}

function blankMonthFormFrom(m?: MonthStatistic | null): Record<string, string> {
    const base: Record<string, string> = {};

    for (const group of monthFieldGroups) {
        for (const f of group.fields) {
            base[f.key as string] = m ? String(m[f.key] ?? 0) : '0';
        }
    }

    base.no_rectify_info = m?.no_rectify_info ?? '';

    return base;
}

// ── Page ──────────────────────────────────────────────────────────

interface PageProps {
    pidMode?: boolean;
}

export function MonthStatisticsPage({ pidMode = false }: PageProps = {}) {
    const { activeCompany, mode } = useScope();
    const companyId = activeCompany?.id;
    const isBloc = !pidMode && mode === 'bloc';
    const { canWrite } = usePermission();
    const canCreate = canWrite('month-statistics.create');
    const canUpdate = canWrite('month-statistics.update');

    const [rows, setRows] = useState<MonthStatistic[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<MonthStatistic | null>(null);
    const [viewing, setViewing] = useState<MonthStatistic | null>(null);

    const fetchRows = useCallback(
        async (p: number) => {
            if (!companyId) {
                return;
            }

            setLoading(true);

            try {
                const params: Record<string, string | number> = pidMode
                    ? { pid: companyId, page: p, per_page: 15 }
                    : { company_id: companyId, page: p, per_page: 15 };
                const res = await api.get<
                    ApiResponse<PaginatedData<MonthStatistic>>
                >('/month-statistics', { params });
                setRows(res.data.data.data);
                setLastPage(res.data.data.last_page);
                setPage(res.data.data.current_page);
            } finally {
                setLoading(false);
            }
        },
        [companyId, pidMode],
    );

    useEffect(() => {
        fetchRows(1);
    }, [companyId, fetchRows]);

    const submittedThisMonth = useMemo(() => {
        if (pidMode) {
            return false;
        }

        const ym = new Date().toISOString().slice(0, 7);

        return rows.some((r) => yearMonth(r.created_at) === ym);
    }, [rows, pidMode]);

    const title = pidMode ? '月度报表统计' : '月度数据上报';
    const subtitle = pidMode
        ? '查看下属企业上报的月度安全生产数据。'
        : isBloc
          ? '填报本月安全生产月度统计数据（按本企业及所辖下级汇总，每月限一份，可修改）。'
          : '填报本月安全生产月度统计数据（每月限一份，可修改）。';

    return (
        <>
            <Head title={title} />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">
                            {title}
                        </h1>
                        <p className="text-sm text-slate-400">{subtitle}</p>
                    </div>
                    {!pidMode && canCreate && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                            disabled={!companyId || submittedThisMonth}
                            title={
                                submittedThisMonth
                                    ? '本月已填报，请前往编辑'
                                    : ''
                            }
                            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-6 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30 disabled:opacity-40"
                        >
                            <Plus className="h-4 w-4" />
                            填报当月月报
                        </button>
                    )}
                </header>

                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                            <tr>
                                <th className="w-28 px-4 py-3">年月</th>
                                {pidMode && (
                                    <th className="w-40 px-4 py-3">企业</th>
                                )}
                                <th className="w-28 px-4 py-3">平均职工</th>
                                <th className="w-28 px-4 py-3">安全检查</th>
                                <th className="w-28 px-4 py-3">安全投入</th>
                                <th className="w-28 px-4 py-3">事故数量</th>
                                <th className="w-48 px-4 py-3 text-right">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/30">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={pidMode ? 7 : 6}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                    </td>
                                </tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={pidMode ? 7 : 6}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        暂无月报数据
                                    </td>
                                </tr>
                            )}
                            {rows.map((r) => (
                                <tr
                                    key={r.id}
                                    className="text-slate-200 hover:bg-blue-950/30"
                                >
                                    <td className="px-4 py-3">
                                        {yearMonth(r.created_at)}
                                    </td>
                                    {pidMode && (
                                        <td className="px-4 py-3 text-slate-400">
                                            {r.company?.title ??
                                                `企业 #${r.company_id}`}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-slate-400">
                                        {r.average_employee}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {r.safety_check_count}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {r.safety_funding}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {r.accident_bulletin_count}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setViewing(r)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                详情
                                            </button>
                                            {!pidMode && canUpdate && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditing(r);
                                                        setFormOpen(true);
                                                    }}
                                                    title="编辑"
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                        <button
                            onClick={() => fetchRows(page - 1)}
                            disabled={page <= 1}
                            className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                        >
                            上一页
                        </button>
                        <span>
                            {page} / {lastPage}
                        </span>
                        <button
                            onClick={() => fetchRows(page + 1)}
                            disabled={page >= lastPage}
                            className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                        >
                            下一页
                        </button>
                    </div>
                )}
            </div>

            {formOpen && companyId && (
                <MonthFormModal
                    companyId={companyId}
                    initial={editing}
                    onClose={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                    onSaved={async () => {
                        setFormOpen(false);
                        setEditing(null);
                        await fetchRows(page);
                    }}
                />
            )}

            {viewing && (
                <MonthDetailsModal
                    draft={viewing}
                    onClose={() => setViewing(null)}
                />
            )}
        </>
    );
}

export default function MonthStatisticsIndex() {
    return <MonthStatisticsPage />;
}

// ── Form Modal ────────────────────────────────────────────────────

interface MonthFormModalProps {
    companyId: number;
    initial?: MonthStatistic | null;
    onClose: () => void;
    onSaved: () => void;
}

function MonthFormModal({
    companyId,
    initial,
    onClose,
    onSaved,
}: MonthFormModalProps) {
    const targetCompanyId = initial?.company_id ?? companyId;
    const [form, setForm] = useState<Record<string, string>>(
        blankMonthFormFrom(initial),
    );
    const [govern, setGovern] = useState<MonthStatisticControlRow[]>(
        initial ? pickControls(initial) : [],
    );
    const [accidents, setAccidents] = useState<MonthStatisticAccidentRow[]>(
        initial ? pickAccidents(initial) : [],
    );
    const [saving, setSaving] = useState(false);
    const [stuffing, setStuffing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = (key: string, value: string) =>
        setForm((p) => ({ ...p, [key]: value }));

    // Pre-fill via stuff endpoint when creating (not editing) and when target company changes.
    useEffect(() => {
        if (initial) {
            return;
        }

        let ignore = false;
        setStuffing(true);
        api.get<ApiResponse<StuffResponse>>('/month-statistics/stuff', {
            params: { company_id: targetCompanyId },
        })
            .then((res) => {
                if (ignore) {
                    return;
                }

                const d = res.data.data;
                const next: Record<string, string> = {};

                for (const group of monthFieldGroups) {
                    for (const f of group.fields) {
                        next[f.key as string] = String(
                            (d as Record<string, unknown>)[f.key as string] ??
                                0,
                        );
                    }
                }

                next.no_rectify_info =
                    (d.no_rectify_info as string | null) ?? '';
                setForm(next);
                setGovern(
                    (
                        (d.govern_hidden_danger as MonthStatisticControlRow[]) ??
                        []
                    ).map((g) => ({
                        govern_title: g.govern_title ?? null,
                        govern_supplies: g.govern_supplies ?? null,
                        govern_user: g.govern_user ?? null,
                        govern_date: g.govern_date ?? null,
                        govern_text: g.govern_text ?? null,
                        govern_money: g.govern_money ?? null,
                    })),
                );
                setAccidents(
                    (
                        (d.accident_bulletin as MonthStatisticAccidentRow[]) ??
                        []
                    ).map((a) => ({
                        happen_time: a.happen_time ?? null,
                        department: a.department ?? null,
                        name: a.name ?? null,
                        sex: a.sex ?? null,
                        age: a.age ?? null,
                        work_type: a.work_type ?? null,
                        work_age: a.work_age ?? null,
                        education_level: a.education_level ?? null,
                        degree_injury: a.degree_injury ?? null,
                        type: a.type ?? null,
                        direct_cause: a.direct_cause ?? null,
                        content: a.content ?? null,
                        days_off: a.days_off ?? null,
                        direct_loss_property: a.direct_loss_property ?? null,
                    })),
                );
            })
            .catch(() => {
                /* keep blank defaults */
            })
            .finally(() => {
                if (!ignore) {
                    setStuffing(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [targetCompanyId, initial]);

    const save = async () => {
        setSaving(true);
        setError(null);

        try {
            const numericPayload: Record<string, number | string> = {};

            for (const group of monthFieldGroups) {
                for (const f of group.fields) {
                    numericPayload[f.key as string] = Number(
                        form[f.key as string] || 0,
                    );
                }
            }

            const payload = {
                ...numericPayload,
                no_rectify_info: form.no_rectify_info || null,
                company_id: targetCompanyId,
                govern_hidden_danger: govern,
                accident_bulletin: accidents,
            };

            if (initial) {
                await api.put(`/month-statistics/${initial.id}`, payload);
            } else {
                await api.post('/month-statistics', payload);
            }

            onSaved();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '保存失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-blue-900/40 bg-[#050915] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-blue-900/30 px-5 py-3">
                    <h3 className="text-sm font-semibold text-slate-100">
                        {initial ? '编辑月报' : '填报当月月报'}
                        {stuffing && (
                            <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-slate-500" />
                        )}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                    {monthFieldGroups.map((group) => (
                        <section key={group.title}>
                            <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                {group.title}
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {group.fields.map((f) => (
                                    <label
                                        key={f.key as string}
                                        className="block text-xs text-slate-400"
                                    >
                                        <span className="mb-1 block">
                                            {f.label}
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            className={inputCls}
                                            value={form[f.key as string]}
                                            onChange={(e) =>
                                                update(
                                                    f.key as string,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>
                    ))}

                    <section>
                        <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            未整改隐患说明
                        </h4>
                        <textarea
                            className={cn(inputCls, 'min-h-[80px]')}
                            value={form.no_rectify_info}
                            onChange={(e) =>
                                update('no_rectify_info', e.target.value)
                            }
                        />
                    </section>

                    <GovernSection items={govern} setItems={setGovern} />
                    <AccidentSection
                        items={accidents}
                        setItems={setAccidents}
                    />
                </div>

                {error && (
                    <p className="px-5 pb-2 text-xs text-red-400">{error}</p>
                )}

                <footer className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-5 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
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

// ── Dynamic sections ──────────────────────────────────────────────

function GovernSection({
    items,
    setItems,
}: {
    items: MonthStatisticControlRow[];
    setItems: (items: MonthStatisticControlRow[]) => void;
}) {
    const addRow = () =>
        setItems([
            ...items,
            {
                govern_title: '',
                govern_supplies: '',
                govern_user: '',
                govern_date: '',
                govern_text: '',
                govern_money: '',
            },
        ]);
    const removeRow = (i: number) =>
        setItems(items.filter((_, idx) => idx !== i));
    const updateField = (
        i: number,
        k: keyof MonthStatisticControlRow,
        v: string,
    ) => {
        const next = items.slice();
        next[i] = { ...next[i], [k]: v };
        setItems(next);
    };

    return (
        <section>
            <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    列入治理计划的重大隐患
                </h4>
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-600/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-600/20"
                >
                    <Plus className="h-3 w-3" />
                    新增
                </button>
            </div>
            {items.length === 0 && (
                <p className="text-xs text-slate-600">暂无记录</p>
            )}
            <div className="space-y-2">
                {items.map((row, i) => (
                    <div
                        key={i}
                        className="rounded-lg border border-blue-900/40 bg-[#070d1f] p-3"
                    >
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                            <span>条目 #{i + 1}</span>
                            <button
                                type="button"
                                onClick={() => removeRow(i)}
                                className="rounded p-1 text-red-400 hover:bg-red-600/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <input
                                className={inputCls}
                                placeholder="治理目标任务"
                                value={row.govern_title ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'govern_title',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="治理经费物资"
                                value={row.govern_supplies ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'govern_supplies',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="治理机构人员"
                                value={row.govern_user ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'govern_user',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="治理时间要求"
                                value={row.govern_date ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'govern_date',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="安全措施/应急预案"
                                value={row.govern_text ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'govern_text',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="治理资金"
                                value={row.govern_money ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'govern_money',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AccidentSection({
    items,
    setItems,
}: {
    items: MonthStatisticAccidentRow[];
    setItems: (items: MonthStatisticAccidentRow[]) => void;
}) {
    const addRow = () =>
        setItems([
            ...items,
            {
                happen_time: '',
                department: '',
                name: '',
                sex: '',
                age: null,
                work_type: '',
                work_age: null,
                education_level: '',
                degree_injury: '',
                type: '',
                direct_cause: '',
                content: '',
                days_off: null,
                direct_loss_property: '',
            },
        ]);
    const removeRow = (i: number) =>
        setItems(items.filter((_, idx) => idx !== i));
    const updateField = (
        i: number,
        k: keyof MonthStatisticAccidentRow,
        v: string | number | null,
    ) => {
        const next = items.slice();
        next[i] = { ...next[i], [k]: v } as MonthStatisticAccidentRow;
        setItems(next);
    };

    return (
        <section>
            <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    事故快报
                </h4>
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-600/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-600/20"
                >
                    <Plus className="h-3 w-3" />
                    新增
                </button>
            </div>
            {items.length === 0 && (
                <p className="text-xs text-slate-600">暂无记录</p>
            )}
            <div className="space-y-2">
                {items.map((row, i) => (
                    <div
                        key={i}
                        className="rounded-lg border border-blue-900/40 bg-[#070d1f] p-3"
                    >
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                            <span>条目 #{i + 1}</span>
                            <button
                                type="button"
                                onClick={() => removeRow(i)}
                                className="rounded p-1 text-red-400 hover:bg-red-600/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <DatePicker
                                value={row.happen_time ?? ''}
                                onChange={(v) =>
                                    updateField(i, 'happen_time', v)
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="部门"
                                value={row.department ?? ''}
                                onChange={(e) =>
                                    updateField(i, 'department', e.target.value)
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="姓名"
                                value={row.name ?? ''}
                                onChange={(e) =>
                                    updateField(i, 'name', e.target.value)
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="性别"
                                value={row.sex ?? ''}
                                onChange={(e) =>
                                    updateField(i, 'sex', e.target.value)
                                }
                            />
                            <input
                                type="number"
                                className={inputCls}
                                placeholder="年龄"
                                value={row.age ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'age',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="工种"
                                value={row.work_type ?? ''}
                                onChange={(e) =>
                                    updateField(i, 'work_type', e.target.value)
                                }
                            />
                            <input
                                type="number"
                                className={inputCls}
                                placeholder="工龄"
                                value={row.work_age ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'work_age',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="教育程度"
                                value={row.education_level ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'education_level',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="受伤程度"
                                value={row.degree_injury ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'degree_injury',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="事故类型"
                                value={row.type ?? ''}
                                onChange={(e) =>
                                    updateField(i, 'type', e.target.value)
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="直接原因"
                                value={row.direct_cause ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'direct_cause',
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                type="number"
                                className={inputCls}
                                placeholder="歇工天数"
                                value={row.days_off ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'days_off',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            />
                            <input
                                className={inputCls}
                                placeholder="直接经济损失"
                                value={row.direct_loss_property ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        i,
                                        'direct_loss_property',
                                        e.target.value,
                                    )
                                }
                            />
                            <textarea
                                className={cn(
                                    inputCls,
                                    'min-h-[60px] sm:col-span-3',
                                )}
                                placeholder="事故简况"
                                value={row.content ?? ''}
                                onChange={(e) =>
                                    updateField(i, 'content', e.target.value)
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ── Details Modal ─────────────────────────────────────────────────

interface DetailsModalProps {
    draft: MonthStatistic;
    onClose: () => void;
}

export function MonthDetailsModal({ draft, onClose }: DetailsModalProps) {
    const controls = pickControls(draft);
    const accidents = pickAccidents(draft);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            月报详情 · {yearMonth(draft.created_at)}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            {draft.company?.title ?? '仅展示记录信息'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {monthFieldGroups.map((group) => (
                        <section key={group.title}>
                            <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                {group.title}
                            </p>
                            <dl className="grid gap-3 sm:grid-cols-2">
                                {group.fields.map((f) => (
                                    <div
                                        key={f.key as string}
                                        className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3"
                                    >
                                        <dt className="text-xs text-slate-500">
                                            {f.label}
                                        </dt>
                                        <dd className="text-sm text-slate-300">
                                            {String(draft[f.key] ?? 0)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}

                    {draft.no_rectify_info && (
                        <section>
                            <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                未整改隐患说明
                            </p>
                            <p className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                                {draft.no_rectify_info}
                            </p>
                        </section>
                    )}

                    <section>
                        <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                            列入治理计划的重大隐患 ({controls.length})
                        </p>
                        {controls.length === 0 ? (
                            <p className="text-sm text-slate-600">—</p>
                        ) : (
                            <div className="space-y-2">
                                {controls.map((c, i) => (
                                    <div
                                        key={c.id ?? i}
                                        className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3 text-xs text-slate-300"
                                    >
                                        <div>
                                            <span className="text-slate-500">
                                                目标：
                                            </span>
                                            {c.govern_title ?? '—'}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">
                                                经费：
                                            </span>
                                            {c.govern_supplies ?? '—'}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">
                                                人员：
                                            </span>
                                            {c.govern_user ?? '—'}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">
                                                时间：
                                            </span>
                                            {c.govern_date ?? '—'}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">
                                                措施：
                                            </span>
                                            {c.govern_text ?? '—'}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">
                                                资金：
                                            </span>
                                            {c.govern_money ?? '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                            事故快报 ({accidents.length})
                        </p>
                        {accidents.length === 0 ? (
                            <p className="text-sm text-slate-600">—</p>
                        ) : (
                            <div className="space-y-2">
                                {accidents.map((a, i) => (
                                    <div
                                        key={a.id ?? i}
                                        className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3 text-xs text-slate-300"
                                    >
                                        <div className="font-medium text-slate-200">
                                            {a.name ?? '—'} ·{' '}
                                            {a.happen_time ?? '—'} ·{' '}
                                            {a.type ?? '—'}
                                        </div>
                                        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                                            <div>
                                                <span className="text-slate-500">
                                                    部门：
                                                </span>
                                                {a.department ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    性别：
                                                </span>
                                                {a.sex ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    年龄：
                                                </span>
                                                {a.age ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    工种：
                                                </span>
                                                {a.work_type ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    工龄：
                                                </span>
                                                {a.work_age ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    教育：
                                                </span>
                                                {a.education_level ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    受伤：
                                                </span>
                                                {a.degree_injury ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    直接原因：
                                                </span>
                                                {a.direct_cause ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    歇工：
                                                </span>
                                                {a.days_off ?? '—'}天
                                            </div>
                                            <div>
                                                <span className="text-slate-500">
                                                    损失：
                                                </span>
                                                {a.direct_loss_property ?? '—'}
                                            </div>
                                        </div>
                                        {a.content && (
                                            <div className="mt-1 text-slate-400">
                                                事故简况：{a.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
