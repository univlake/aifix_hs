import { Head } from '@inertiajs/react';
import { BellRing, CheckCircle2, Clock, Eye, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface CompanyRef {
    id: number;
    title: string;
}

interface MeetingNoticeRow {
    id: number;
    meeting_id: number;
    company_id: number;
    company_name: string | null;
    company_group_id: number | null;
    company_group_name: string | null;
    notify_time: string | null;
    confirm_time: string | null;
    company?: CompanyRef | null;
}

interface MeetingSignUpRow {
    id: number;
    meeting_id: number;
    company_id: number;
    company_name: string | null;
    name: string | null;
    sex: string | null;
    job_title: string | null;
    tel: string | null;
    card_number: string | null;
    is_driving: string | null;
    created_at: string;
}

interface Meeting {
    id: number;
    name: string | null;
    theme: string | null;
    place: string | null;
    meeting_date: string | null;
    sign_up_date: string | null;
    sign_end_date: string | null;
    company_id: number;
    meeting_notices?: MeetingNoticeRow[];
    meetingNotices?: MeetingNoticeRow[];
}

// ── Helpers ───────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function fmt(d: string | null | undefined): string {
    return d ? String(d).slice(0, 16) : '—';
}

function pickNotices(m: Meeting): MeetingNoticeRow[] {
    return m.meeting_notices ?? m.meetingNotices ?? [];
}

// ── Page ──────────────────────────────────────────────────────────

export default function ManagementMeetingNoticesIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Meeting | null>(null);
    const [drawerTab, setDrawerTab] = useState<'notices' | 'signups'>('notices');
    const [notices, setNotices] = useState<MeetingNoticeRow[]>([]);
    const [signUps, setSignUps] = useState<MeetingSignUpRow[]>([]);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const fetchMeetings = useCallback(async (p: number, q: string) => {
        if (!companyId) return;
        setLoading(true);
        try {
            const res = await api.get<ApiResponse<PaginatedData<Meeting>>>('/meetings', {
                params: {
                    company_id: companyId,
                    page: p,
                    per_page: 15,
                    ...(q ? { name: q } : {}),
                },
            });
            setMeetings(res.data.data.data);
            setLastPage(res.data.data.last_page);
            setPage(res.data.data.current_page);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchMeetings(1, search);
    }, [companyId, search, fetchMeetings]);

    const openDrawer = useCallback(async (m: Meeting) => {
        setSelected(m);
        setDrawerTab('notices');
        setDrawerLoading(true);
        try {
            const [detailRes, signupRes] = await Promise.all([
                api.get<ApiResponse<Meeting>>(`/meetings/${m.id}`),
                api.get<ApiResponse<PaginatedData<MeetingSignUpRow>>>('/meeting-sign-ups', {
                    params: { meeting_id: m.id, per_page: 100 },
                }),
            ]);
            setNotices(pickNotices(detailRes.data.data));
            setSignUps(signupRes.data.data.data);
        } finally {
            setDrawerLoading(false);
        }
    }, []);

    const closeDrawer = useCallback(() => {
        setSelected(null);
        setNotices([]);
        setSignUps([]);
    }, []);

    const reloadNotices = useCallback(async () => {
        if (!selected) return;
        const res = await api.get<ApiResponse<Meeting>>(`/meetings/${selected.id}`);
        setNotices(pickNotices(res.data.data));
    }, [selected]);

    const handleNotify = useCallback(async (n: MeetingNoticeRow) => {
        await api.post(`/meeting-notices/${n.id}/notify`);
        await reloadNotices();
    }, [reloadNotices]);

    const handleRemove = useCallback(async (n: MeetingNoticeRow) => {
        if (!confirm(`移除企业 "${n.company_name ?? n.company?.title ?? n.company_id}" 的通知？`)) return;
        // Fall back to meeting update: replace kids via PUT with current list minus this one
        if (!selected) return;
        const kids = notices
            .filter((x) => x.id !== n.id)
            .map((x) => ({
                company_id: x.company_id,
                company_name: x.company_name ?? x.company?.title ?? null,
                company_group_id: x.company_group_id,
                company_group_name: x.company_group_name,
            }));
        await api.put(`/meetings/${selected.id}`, { kids });
        await reloadNotices();
    }, [selected, notices, reloadNotices]);

    const pendingCount = useMemo(
        () => notices.filter((n) => !n.confirm_time).length,
        [notices],
    );
    const confirmedCount = notices.length - pendingCount;

    return (
        <>
            <Head title="会议通知" />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">会议通知</h1>
                        <p className="text-sm text-slate-400">向所辖企业发布会议通知，跟踪签收与报名情况。</p>
                    </div>
                    <input
                        type="search"
                        placeholder="搜索会议名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn(inputCls, 'max-w-xs')}
                    />
                </header>

                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-4 py-3">会议</th>
                                <th className="px-4 py-3 w-40">会议时间</th>
                                <th className="px-4 py-3 w-40">报名截止</th>
                                <th className="px-4 py-3 w-24">通知数</th>
                                <th className="px-4 py-3 w-24">已确认</th>
                                <th className="px-4 py-3 w-28 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/30">
                            {loading && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
                            )}
                            {!loading && meetings.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">暂无会议</td></tr>
                            )}
                            {meetings.map((m) => {
                                const ns = pickNotices(m);
                                const confirmed = ns.filter((n) => n.confirm_time).length;
                                return (
                                    <tr key={m.id} className="text-slate-200 hover:bg-blue-950/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{m.name ?? '—'}</div>
                                            {m.theme && <div className="text-xs text-slate-500">{m.theme}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">{fmt(m.meeting_date)}</td>
                                        <td className="px-4 py-3 text-slate-400">{fmt(m.sign_end_date)}</td>
                                        <td className="px-4 py-3 text-slate-400">{ns.length}</td>
                                        <td className="px-4 py-3 text-slate-400">{confirmed}/{ns.length}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openDrawer(m)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                            >
                                                <Eye className="h-3.5 w-3.5" />管理
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                        <button onClick={() => fetchMeetings(page - 1, search)} disabled={page <= 1} className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40">上一页</button>
                        <span>{page} / {lastPage}</span>
                        <button onClick={() => fetchMeetings(page + 1, search)} disabled={page >= lastPage} className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40">下一页</button>
                    </div>
                )}
            </div>

            {selected && (
                <Drawer
                    meeting={selected}
                    tab={drawerTab}
                    setTab={setDrawerTab}
                    notices={notices}
                    signUps={signUps}
                    loading={drawerLoading}
                    pendingCount={pendingCount}
                    confirmedCount={confirmedCount}
                    onClose={closeDrawer}
                    onAdd={() => setAddOpen(true)}
                    onNotify={handleNotify}
                    onRemove={handleRemove}
                />
            )}

            {addOpen && selected && (
                <AddCompanyModal
                    meeting={selected}
                    existing={notices}
                    onClose={() => setAddOpen(false)}
                    onSaved={async () => {
                        setAddOpen(false);
                        await reloadNotices();
                        await fetchMeetings(page, search);
                    }}
                />
            )}
        </>
    );
}

// ── Drawer ────────────────────────────────────────────────────────

interface DrawerProps {
    meeting: Meeting;
    tab: 'notices' | 'signups';
    setTab: (t: 'notices' | 'signups') => void;
    notices: MeetingNoticeRow[];
    signUps: MeetingSignUpRow[];
    loading: boolean;
    pendingCount: number;
    confirmedCount: number;
    onClose: () => void;
    onAdd: () => void;
    onNotify: (n: MeetingNoticeRow) => void | Promise<void>;
    onRemove: (n: MeetingNoticeRow) => void | Promise<void>;
}

function Drawer({ meeting, tab, setTab, notices, signUps, loading, pendingCount, confirmedCount, onClose, onAdd, onNotify, onRemove }: DrawerProps) {
    return (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
            <aside className="h-full w-full max-w-3xl overflow-y-auto border-l border-blue-900/40 bg-[#050915] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">{meeting.name ?? '会议详情'}</h2>
                        <p className="text-xs text-slate-400">{meeting.theme}</p>
                        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                            <div><dt className="inline text-slate-500">会议时间：</dt><dd className="inline">{fmt(meeting.meeting_date)}</dd></div>
                            <div><dt className="inline text-slate-500">地点：</dt><dd className="inline">{meeting.place ?? '—'}</dd></div>
                            <div><dt className="inline text-slate-500">报名开始：</dt><dd className="inline">{fmt(meeting.sign_up_date)}</dd></div>
                            <div><dt className="inline text-slate-500">报名截止：</dt><dd className="inline">{fmt(meeting.sign_end_date)}</dd></div>
                        </dl>
                    </div>
                    <button onClick={onClose} className="rounded-lg border border-blue-900/40 p-1 text-slate-400 hover:text-slate-200"><X className="h-4 w-4" /></button>
                </header>

                <nav className="mb-3 flex gap-2 border-b border-blue-900/40">
                    <TabButton active={tab === 'notices'} onClick={() => setTab('notices')} count={notices.length}>通知企业</TabButton>
                    <TabButton active={tab === 'signups'} onClick={() => setTab('signups')} count={signUps.length}>报名人员</TabButton>
                </nav>

                {loading && <div className="py-10 text-center text-slate-500"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>}

                {!loading && tab === 'notices' && (
                    <section>
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-400" />待确认 {pendingCount}</span>
                                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />已确认 {confirmedCount}</span>
                            </div>
                            <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:bg-blue-600/20">
                                <Plus className="h-3.5 w-3.5" />添加企业
                            </button>
                        </div>
                        {notices.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">尚未添加通知企业</div>
                        ) : (
                            <ul className="space-y-2">
                                {notices.map((n) => (
                                    <li key={n.id} className="flex items-center gap-3 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2">
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-200">{n.company_name ?? n.company?.title ?? `企业 #${n.company_id}`}</div>
                                            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                                {n.notify_time ? (
                                                    <span className="inline-flex items-center gap-1"><BellRing className="h-3 w-3 text-blue-400" />已发送 {fmt(n.notify_time)}</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-amber-400" />未发送</span>
                                                )}
                                                {n.confirm_time ? (
                                                    <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" />已确认 {fmt(n.confirm_time)}</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-slate-500" />待确认</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onNotify(n)}
                                            disabled={!!n.confirm_time}
                                            className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20 disabled:opacity-40"
                                            title={n.notify_time ? '重新通知' : '发送通知'}
                                        >
                                            <BellRing className="h-3.5 w-3.5" />{n.notify_time ? '重发' : '通知'}
                                        </button>
                                        <button
                                            onClick={() => onRemove(n)}
                                            className="rounded border border-red-500/30 bg-red-600/10 p-1 text-red-400 transition-colors hover:bg-red-600/20"
                                            title="移除"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                {!loading && tab === 'signups' && (
                    <section>
                        {signUps.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">尚无报名</div>
                        ) : (
                            <table className="min-w-full text-xs">
                                <thead className="text-left text-slate-500">
                                    <tr>
                                        <th className="px-2 py-1">姓名</th>
                                        <th className="px-2 py-1">性别</th>
                                        <th className="px-2 py-1">职务</th>
                                        <th className="px-2 py-1">电话</th>
                                        <th className="px-2 py-1">企业</th>
                                        <th className="px-2 py-1">自驾</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {signUps.map((s) => (
                                        <tr key={s.id} className="text-slate-300">
                                            <td className="px-2 py-1.5">{s.name ?? '—'}</td>
                                            <td className="px-2 py-1.5">{s.sex ?? '—'}</td>
                                            <td className="px-2 py-1.5">{s.job_title ?? '—'}</td>
                                            <td className="px-2 py-1.5">{s.tel ?? '—'}</td>
                                            <td className="px-2 py-1.5">{s.company_name ?? '—'}</td>
                                            <td className="px-2 py-1.5">{s.is_driving ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}
            </aside>
        </div>
    );
}

function TabButton({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative -mb-px px-3 py-2 text-sm transition-colors',
                active ? 'border-b-2 border-blue-400 text-slate-100' : 'text-slate-500 hover:text-slate-300',
            )}
            type="button"
        >
            {children}
            {typeof count === 'number' && (
                <span className="ml-1.5 rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">{count}</span>
            )}
        </button>
    );
}

// ── AddCompanyModal ───────────────────────────────────────────────

interface AddCompanyModalProps {
    meeting: Meeting;
    existing: MeetingNoticeRow[];
    onClose: () => void;
    onSaved: () => void;
}

function AddCompanyModal({ meeting, existing, onClose, onSaved }: AddCompanyModalProps) {
    const { subordinates } = useScope();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    const existingIds = useMemo(() => new Set(existing.map((n) => n.company_id)), [existing]);
    const available = useMemo(
        () => subordinates.filter((c) => !existingIds.has(c.id)),
        [subordinates, existingIds],
    );

    const toggle = (id: number) => {
        setSelectedIds((prev) => {
            const n = new Set(prev);
            if (n.has(id)) { n.delete(id); } else { n.add(id); }
            return n;
        });
    };

    const save = async () => {
        if (selectedIds.size === 0) return;
        setSaving(true);
        try {
            const kids = [
                ...existing.map((x) => ({
                    company_id: x.company_id,
                    company_name: x.company_name ?? x.company?.title ?? null,
                    company_group_id: x.company_group_id,
                    company_group_name: x.company_group_name,
                })),
                ...subordinates
                    .filter((c) => selectedIds.has(c.id))
                    .map((c) => ({ company_id: c.id, company_name: c.title })),
            ];
            await api.put(`/meetings/${meeting.id}`, { kids });
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">添加通知企业</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
                </header>
                {available.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">所有下属企业已添加</p>
                ) : (
                    <ul className="max-h-80 space-y-1 overflow-y-auto">
                        {available.map((c) => (
                            <li key={c.id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-900/30 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 hover:border-blue-500/40">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(c.id)}
                                        onChange={() => toggle(c.id)}
                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                    />
                                    {c.title}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <footer className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20">取消</button>
                    <button
                        onClick={save}
                        disabled={selectedIds.size === 0 || saving}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}保存 ({selectedIds.size})
                    </button>
                </footer>
            </div>
        </div>
    );
}
