import { Head } from '@inertiajs/react';
import {
    BellRing,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Clock,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Create payload type ───────────────────────────────────────────

interface CreateMeetingPayload {
    company_id: number;
    name: string;
    theme?: string | null;
    place?: string | null;
    meeting_date?: string | null;
    sign_up_date?: string | null;
    sign_end_date?: string | null;
    alert_others?: string | null;
    summary?: string | null;
    summary_annex_url?: string | null;
    sign_annex_url?: string | null;
    material_annex_url?: string | null;
    photo_annex_url?: string | null;
    kids: Array<{
        company_id: number;
        company_name: string | null;
        company_group_id?: number | null;
        company_group_name?: string | null;
    }>;
}

interface GroupCompany {
    id: number;
    title: string;
    status: number;
}

interface EnterpriseGroup {
    id: number;
    name: string;
    company_id: number;
    kid_companies: GroupCompany[];
}

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
    alert_others?: string | null;
    summary?: string | null;
    summary_annex_url?: string | null;
    sign_annex_url?: string | null;
    material_annex_url?: string | null;
    photo_annex_url?: string | null;
    company_id: number;
    meeting_notices?: MeetingNoticeRow[];
    meetingNotices?: MeetingNoticeRow[];
}

// ── Helpers ───────────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function fmt(d: string | null | undefined): string {
    return d ? String(d).slice(0, 16) : '—';
}

function pickNotices(m: Meeting): MeetingNoticeRow[] {
    return m.meeting_notices ?? m.meetingNotices ?? [];
}

// ── Page ──────────────────────────────────────────────────────────

interface MeetingNoticesPageProps {
    receiveOnly?: boolean;
}

export function MeetingNoticesPage({
    receiveOnly = false,
}: MeetingNoticesPageProps = {}) {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Meeting | null>(null);
    const [drawerTab, setDrawerTab] = useState<'notices' | 'signups'>(
        'notices',
    );
    const [notices, setNotices] = useState<MeetingNoticeRow[]>([]);
    const [signUps, setSignUps] = useState<MeetingSignUpRow[]>([]);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Meeting | null>(null);
    const [deleting, setDeleting] = useState<Meeting | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [signUpFor, setSignUpFor] = useState<Meeting | null>(null);
    const [viewOwnSignUpsFor, setViewOwnSignUpsFor] = useState<Meeting | null>(
        null,
    );
    const [confirmingNoticeId, setConfirmingNoticeId] = useState<number | null>(
        null,
    );

    const fetchMeetings = useCallback(
        async (p: number, q: string) => {
            if (!companyId) {
                return;
            }

            setLoading(true);

            try {
                const res = await api.get<ApiResponse<PaginatedData<Meeting>>>(
                    '/meetings',
                    {
                        params: {
                            company_id: companyId,
                            page: p,
                            per_page: 15,
                            ...(q ? { name: q } : {}),
                        },
                    },
                );
                setMeetings(res.data.data.data);
                setLastPage(res.data.data.last_page);
                setPage(res.data.data.current_page);
            } finally {
                setLoading(false);
            }
        },
        [companyId],
    );

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
                api.get<ApiResponse<PaginatedData<MeetingSignUpRow>>>(
                    '/meeting-sign-ups',
                    {
                        params: { meeting_id: m.id, per_page: 100 },
                    },
                ),
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
        if (!selected) {
            return;
        }

        const res = await api.get<ApiResponse<Meeting>>(
            `/meetings/${selected.id}`,
        );
        setNotices(pickNotices(res.data.data));
    }, [selected]);

    const handleNotify = useCallback(
        async (n: MeetingNoticeRow) => {
            await api.post(`/meeting-notices/${n.id}/notify`);
            await reloadNotices();
        },
        [reloadNotices],
    );

    const handleRemove = useCallback(
        async (n: MeetingNoticeRow) => {
            if (
                !confirm(
                    `移除企业 "${n.company_name ?? n.company?.title ?? n.company_id}" 的通知？`,
                )
            ) {
                return;
            }

            // Fall back to meeting update: replace kids via PUT with current list minus this one
            if (!selected) {
                return;
            }

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
        },
        [selected, notices, reloadNotices],
    );

    const pendingCount = useMemo(
        () => notices.filter((n) => !n.confirm_time).length,
        [notices],
    );
    const confirmedCount = notices.length - pendingCount;

    const handleConfirmOwnNotice = useCallback(
        async (noticeId: number) => {
            setConfirmingNoticeId(noticeId);

            try {
                await api.post(`/meeting-notices/${noticeId}/confirm`);
                await fetchMeetings(page, search);
            } finally {
                setConfirmingNoticeId(null);
            }
        },
        [fetchMeetings, page, search],
    );

    const handleDeleteMeeting = useCallback(async () => {
        if (!deleting) {
            return;
        }

        setDeleteLoading(true);

        try {
            await api.delete(`/meetings/${deleting.id}`);
            setDeleting(null);
            await fetchMeetings(page, search);
        } finally {
            setDeleteLoading(false);
        }
    }, [deleting, fetchMeetings, page, search]);

    const pageTitle = receiveOnly ? '会议' : '会议通知';
    const pageSubtitle = receiveOnly
        ? '查看收到的会议通知，进行确认与报名。'
        : '向所辖企业发布会议通知，跟踪签收与报名情况。';

    return (
        <>
            <Head title={pageTitle} />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">
                            {pageTitle}
                        </h1>
                        <p className="text-sm text-slate-400">{pageSubtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="search"
                            placeholder="搜索会议名称..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn(inputCls, 'max-w-xs')}
                        />
                        {!receiveOnly && (
                            <button
                                type="button"
                                onClick={() => setCreateOpen(true)}
                                disabled={!companyId}
                                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-6 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30 disabled:opacity-40"
                            >
                                <Plus className="h-4 w-4" />
                                发起会议
                            </button>
                        )}
                    </div>
                </header>

                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                            <tr>
                                <th className="px-4 py-3">会议</th>
                                <th className="w-40 px-4 py-3">会议时间</th>
                                <th className="w-40 px-4 py-3">报名截止</th>
                                <th className="w-24 px-4 py-3">通知数</th>
                                <th className="w-24 px-4 py-3">已确认</th>
                                <th className="w-64 px-4 py-3 text-right">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/30">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                    </td>
                                </tr>
                            )}
                            {!loading && meetings.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        暂无会议
                                    </td>
                                </tr>
                            )}
                            {meetings.map((m) => {
                                const ns = pickNotices(m);
                                const confirmed = ns.filter(
                                    (n) => n.confirm_time,
                                ).length;
                                const isOrganizer =
                                    !!companyId && m.company_id === companyId;
                                const ownNotice =
                                    ns.find(
                                        (n) => n.company_id === companyId,
                                    ) ?? null;

                                return (
                                    <tr
                                        key={m.id}
                                        className="text-slate-200 hover:bg-blue-950/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {m.name ?? '—'}
                                                </span>
                                                {!isOrganizer && (
                                                    <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">
                                                        受邀
                                                    </span>
                                                )}
                                            </div>
                                            {m.theme && (
                                                <div className="text-xs text-slate-500">
                                                    {m.theme}
                                                </div>
                                            )}
                                            {!isOrganizer && ownNotice && (
                                                <div className="mt-1 text-[11px] text-slate-500">
                                                    {ownNotice.confirm_time ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-400">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            已确认{' '}
                                                            {fmt(
                                                                ownNotice.confirm_time,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-400">
                                                            <Clock className="h-3 w-3" />
                                                            待确认
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {fmt(m.meeting_date)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {fmt(m.sign_end_date)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {ns.length}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {confirmed}/{ns.length}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-0.5">
                                                {isOrganizer ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDrawer(m)
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            管理
                                                        </button>
                                                        {!receiveOnly && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setEditing(
                                                                            m,
                                                                        )
                                                                    }
                                                                    title="编辑"
                                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeleting(
                                                                            m,
                                                                        )
                                                                    }
                                                                    title="删除"
                                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {ownNotice &&
                                                            !ownNotice.confirm_time && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleConfirmOwnNotice(
                                                                            ownNotice.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        confirmingNoticeId ===
                                                                        ownNotice.id
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-600/20 disabled:opacity-40"
                                                                >
                                                                    {confirmingNoticeId ===
                                                                    ownNotice.id ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    )}
                                                                    确认通知
                                                                </button>
                                                            )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSignUpFor(m)
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                        >
                                                            <UserPlus className="h-3.5 w-3.5" />
                                                            报名
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewOwnSignUpsFor(
                                                                    m,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                        >
                                                            <ClipboardList className="h-3.5 w-3.5" />
                                                            报名名单
                                                        </button>
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
                            onClick={() => fetchMeetings(page - 1, search)}
                            disabled={page <= 1}
                            className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                        >
                            上一页
                        </button>
                        <span>
                            {page} / {lastPage}
                        </span>
                        <button
                            onClick={() => fetchMeetings(page + 1, search)}
                            disabled={page >= lastPage}
                            className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                        >
                            下一页
                        </button>
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

            {createOpen && companyId && (
                <CreateMeetingModal
                    companyId={companyId}
                    onClose={() => setCreateOpen(false)}
                    onSaved={async () => {
                        setCreateOpen(false);
                        await fetchMeetings(1, search);
                    }}
                />
            )}

            {signUpFor && companyId && (
                <SignUpModal
                    meeting={signUpFor}
                    companyId={companyId}
                    companyName={activeCompany?.title ?? null}
                    onClose={() => setSignUpFor(null)}
                    onSaved={() => setSignUpFor(null)}
                />
            )}

            {viewOwnSignUpsFor && companyId && (
                <OwnSignUpsModal
                    meeting={viewOwnSignUpsFor}
                    companyId={companyId}
                    onClose={() => setViewOwnSignUpsFor(null)}
                />
            )}

            {editing && (
                <EditMeetingModal
                    meeting={editing}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await fetchMeetings(page, search);
                    }}
                />
            )}

            {deleting && (
                <DeleteMeetingModal
                    meeting={deleting}
                    loading={deleteLoading}
                    onCancel={() => setDeleting(null)}
                    onConfirm={handleDeleteMeeting}
                />
            )}
        </>
    );
}

export default function ManagementMeetingNoticesIndex() {
    return <MeetingNoticesPage />;
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

function Drawer({
    meeting,
    tab,
    setTab,
    notices,
    signUps,
    loading,
    pendingCount,
    confirmedCount,
    onClose,
    onAdd,
    onNotify,
    onRemove,
}: DrawerProps) {
    return (
        <div
            className="fixed inset-0 z-40 flex justify-end bg-black/40"
            onClick={onClose}
        >
            <aside
                className="h-full w-full max-w-3xl overflow-y-auto border-l border-blue-900/40 bg-[#050915] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">
                            {meeting.name ?? '会议详情'}
                        </h2>
                        <p className="text-xs text-slate-400">
                            {meeting.theme}
                        </p>
                        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                            <div>
                                <dt className="inline text-slate-500">
                                    会议时间：
                                </dt>
                                <dd className="inline">
                                    {fmt(meeting.meeting_date)}
                                </dd>
                            </div>
                            <div>
                                <dt className="inline text-slate-500">
                                    地点：
                                </dt>
                                <dd className="inline">
                                    {meeting.place ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="inline text-slate-500">
                                    报名开始：
                                </dt>
                                <dd className="inline">
                                    {fmt(meeting.sign_up_date)}
                                </dd>
                            </div>
                            <div>
                                <dt className="inline text-slate-500">
                                    报名截止：
                                </dt>
                                <dd className="inline">
                                    {fmt(meeting.sign_end_date)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 p-1 text-slate-400 hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <nav className="mb-3 flex gap-2 border-b border-blue-900/40">
                    <TabButton
                        active={tab === 'notices'}
                        onClick={() => setTab('notices')}
                        count={notices.length}
                    >
                        通知企业
                    </TabButton>
                    <TabButton
                        active={tab === 'signups'}
                        onClick={() => setTab('signups')}
                        count={signUps.length}
                    >
                        报名人员
                    </TabButton>
                </nav>

                {loading && (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                )}

                {!loading && tab === 'notices' && (
                    <section>
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                                    待确认 {pendingCount}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    已确认 {confirmedCount}
                                </span>
                            </div>
                            <button
                                onClick={onAdd}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                添加企业
                            </button>
                        </div>
                        {notices.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">
                                尚未添加通知企业
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {notices.map((n) => (
                                    <li
                                        key={n.id}
                                        className="flex items-center gap-3 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-200">
                                                {n.company_name ??
                                                    n.company?.title ??
                                                    `企业 #${n.company_id}`}
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                                {n.notify_time ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <BellRing className="h-3 w-3 text-blue-400" />
                                                        已发送{' '}
                                                        {fmt(n.notify_time)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-amber-400" />
                                                        未发送
                                                    </span>
                                                )}
                                                {n.confirm_time ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                                        已确认{' '}
                                                        {fmt(n.confirm_time)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-slate-500" />
                                                        待确认
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onNotify(n)}
                                            disabled={!!n.confirm_time}
                                            className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20 disabled:opacity-40"
                                            title={
                                                n.notify_time
                                                    ? '重新通知'
                                                    : '发送通知'
                                            }
                                        >
                                            <BellRing className="h-3.5 w-3.5" />
                                            {n.notify_time ? '重发' : '通知'}
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
                            <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">
                                尚无报名
                            </div>
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
                                        <tr
                                            key={s.id}
                                            className="text-slate-300"
                                        >
                                            <td className="px-2 py-1.5">
                                                {s.name ?? '—'}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {s.sex ?? '—'}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {s.job_title ?? '—'}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {s.tel ?? '—'}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {s.company_name ?? '—'}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {s.is_driving ?? '—'}
                                            </td>
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

function TabButton({
    active,
    onClick,
    count,
    children,
}: {
    active: boolean;
    onClick: () => void;
    count?: number;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative -mb-px px-3 py-2 text-sm transition-colors',
                active
                    ? 'border-b-2 border-blue-400 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300',
            )}
            type="button"
        >
            {children}
            {typeof count === 'number' && (
                <span className="ml-1.5 rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">
                    {count}
                </span>
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

function AddCompanyModal({
    meeting,
    existing,
    onClose,
    onSaved,
}: AddCompanyModalProps) {
    const { subordinates } = useScope();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    const existingIds = useMemo(
        () => new Set(existing.map((n) => n.company_id)),
        [existing],
    );
    const available = useMemo(
        () => subordinates.filter((c) => !existingIds.has(c.id)),
        [subordinates, existingIds],
    );

    const toggle = (id: number) => {
        setSelectedIds((prev) => {
            const n = new Set(prev);

            if (n.has(id)) {
                n.delete(id);
            } else {
                n.add(id);
            }

            return n;
        });
    };

    const save = async () => {
        if (selectedIds.size === 0) {
            return;
        }

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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        添加通知企业
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>
                {available.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                        所有下属企业已添加
                    </p>
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
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={selectedIds.size === 0 || saving}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        保存 ({selectedIds.size})
                    </button>
                </footer>
            </div>
        </div>
    );
}

// ── CreateMeetingModal ────────────────────────────────────────────

interface CreateMeetingModalProps {
    companyId: number;
    onClose: () => void;
    onSaved: () => void;
}

interface GroupSelectionEntry {
    company_id: number;
    company_name: string;
    company_group_id: number;
    company_group_name: string;
}

function CreateMeetingModal({
    companyId,
    onClose,
    onSaved,
}: CreateMeetingModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        theme: '',
        place: '',
        alert_others: '',
        meeting_date: '',
        sign_up_date: '',
        sign_end_date: '',
        summary: '',
        summary_annex_url: '',
        sign_annex_url: '',
        material_annex_url: '',
        photo_annex_url: '',
    });

    const [groups, setGroups] = useState<EnterpriseGroup[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
        new Set(),
    );
    /** Keyed by `${groupId}:${companyId}` — a company can appear in multiple groups. */
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        setGroupsLoading(true);
        api.get<ApiResponse<EnterpriseGroup[]>>('/company-groups', {
            params: { company_id: companyId },
        })
            .then((res) => {
                const list = res.data.data ?? [];
                setGroups(list);
                setExpandedGroups(new Set(list.map((g) => g.id)));
            })
            .catch(() => setGroups([]))
            .finally(() => setGroupsLoading(false));
    }, [companyId]);

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const entryKey = (groupId: number, cid: number) => `${groupId}:${cid}`;

    const toggleCompany = (groupId: number, cid: number) => {
        setSelectedKeys((prev) => {
            const n = new Set(prev);
            const k = entryKey(groupId, cid);

            if (n.has(k)) {
                n.delete(k);
            } else {
                n.add(k);
            }

            return n;
        });
    };

    const toggleGroup = (g: EnterpriseGroup) => {
        setSelectedKeys((prev) => {
            const n = new Set(prev);
            const allSelected = g.kid_companies.every((c) =>
                n.has(entryKey(g.id, c.id)),
            );

            if (allSelected) {
                g.kid_companies.forEach((c) => n.delete(entryKey(g.id, c.id)));
            } else {
                g.kid_companies.forEach((c) => n.add(entryKey(g.id, c.id)));
            }

            return n;
        });
    };

    const toggleExpand = (groupId: number) => {
        setExpandedGroups((prev) => {
            const n = new Set(prev);

            if (n.has(groupId)) {
                n.delete(groupId);
            } else {
                n.add(groupId);
            }

            return n;
        });
    };

    const clearAll = () => setSelectedKeys(new Set());

    const selectedEntries = useMemo<GroupSelectionEntry[]>(() => {
        const rows: GroupSelectionEntry[] = [];

        for (const g of groups) {
            for (const c of g.kid_companies) {
                if (selectedKeys.has(entryKey(g.id, c.id))) {
                    rows.push({
                        company_id: c.id,
                        company_name: c.title,
                        company_group_id: g.id,
                        company_group_name: g.name,
                    });
                }
            }
        }

        return rows;
    }, [groups, selectedKeys]);

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入会议名称');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload: CreateMeetingPayload = {
                company_id: companyId,
                name: form.name.trim(),
                theme: form.theme.trim() || null,
                place: form.place.trim() || null,
                alert_others: form.alert_others.trim() || null,
                meeting_date: form.meeting_date || null,
                sign_up_date: form.sign_up_date || null,
                sign_end_date: form.sign_end_date || null,
                summary: form.summary.trim() || null,
                summary_annex_url: form.summary_annex_url || null,
                sign_annex_url: form.sign_annex_url || null,
                material_annex_url: form.material_annex_url || null,
                photo_annex_url: form.photo_annex_url || null,
                kids: selectedEntries,
            };
            await api.post('/meetings', payload);
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '保存失败';
            setError(msg);
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
                className="w-full max-w-3xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        新建会议通知
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
                        <Field label="会议名称" required>
                            <input
                                className={inputCls}
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                placeholder="请输入会议名称"
                            />
                        </Field>
                        <Field label="会议主题">
                            <input
                                className={inputCls}
                                value={form.theme}
                                onChange={(e) =>
                                    update('theme', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="会议地点">
                            <input
                                className={inputCls}
                                value={form.place}
                                onChange={(e) =>
                                    update('place', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="通知人">
                            <input
                                className={inputCls}
                                value={form.alert_others}
                                onChange={(e) =>
                                    update('alert_others', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="会议时间">
                            <input
                                type="datetime-local"
                                className={inputCls}
                                value={form.meeting_date}
                                onChange={(e) =>
                                    update('meeting_date', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="报名开始">
                            <input
                                type="datetime-local"
                                className={inputCls}
                                value={form.sign_up_date}
                                onChange={(e) =>
                                    update('sign_up_date', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="报名截止">
                            <input
                                type="datetime-local"
                                className={inputCls}
                                value={form.sign_end_date}
                                onChange={(e) =>
                                    update('sign_end_date', e.target.value)
                                }
                            />
                        </Field>
                    </div>
                    <Field label="会议内容">
                        <textarea
                            className={cn(inputCls, 'min-h-[80px]')}
                            value={form.summary}
                            onChange={(e) => update('summary', e.target.value)}
                        />
                    </Field>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="会议纪要附件">
                            <OssUploadField
                                value={form.summary_annex_url}
                                onChange={(url) =>
                                    update('summary_annex_url', url)
                                }
                            />
                        </Field>
                        <Field label="签到附件">
                            <OssUploadField
                                value={form.sign_annex_url}
                                onChange={(url) =>
                                    update('sign_annex_url', url)
                                }
                            />
                        </Field>
                        <Field label="会议资料附件">
                            <OssUploadField
                                value={form.material_annex_url}
                                onChange={(url) =>
                                    update('material_annex_url', url)
                                }
                            />
                        </Field>
                        <Field label="会议照片附件">
                            <OssUploadField
                                value={form.photo_annex_url}
                                onChange={(url) =>
                                    update('photo_annex_url', url)
                                }
                            />
                        </Field>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs text-slate-400">
                                从企业组选择通知对象（已选{' '}
                                {selectedEntries.length}）
                            </label>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                                清空
                            </button>
                        </div>
                        {groupsLoading ? (
                            <div className="rounded-lg border border-blue-900/40 bg-[#070d1f] py-6 text-center text-slate-500">
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            </div>
                        ) : groups.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] py-4 text-center text-xs text-slate-500">
                                尚未创建企业组，请先在「企业分组」中维护。
                            </p>
                        ) : (
                            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-blue-900/40 bg-[#070d1f] p-2">
                                {groups.map((g) => {
                                    const expanded = expandedGroups.has(g.id);
                                    const selectedInGroup =
                                        g.kid_companies.filter((c) =>
                                            selectedKeys.has(
                                                entryKey(g.id, c.id),
                                            ),
                                        ).length;
                                    const total = g.kid_companies.length;
                                    const allSelected =
                                        total > 0 && selectedInGroup === total;
                                    const partial =
                                        selectedInGroup > 0 &&
                                        selectedInGroup < total;

                                    return (
                                        <li
                                            key={g.id}
                                            className="rounded-md border border-blue-900/30 bg-[#050b1a]"
                                        >
                                            <div className="flex items-center gap-2 px-2 py-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleExpand(g.id)
                                                    }
                                                    className="text-slate-500 hover:text-slate-200"
                                                >
                                                    {expanded ? (
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={(el) => {
                                                            if (el) {
                                                                el.indeterminate =
                                                                    partial;
                                                            }
                                                        }}
                                                        onChange={() =>
                                                            toggleGroup(g)
                                                        }
                                                        disabled={total === 0}
                                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                                    />
                                                    <Users className="h-3.5 w-3.5 text-blue-400" />
                                                    <span className="font-medium">
                                                        {g.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        ({selectedInGroup}/
                                                        {total})
                                                    </span>
                                                </label>
                                            </div>
                                            {expanded && total > 0 && (
                                                <ul className="space-y-1 border-t border-blue-900/30 px-2 py-1.5 pl-8">
                                                    {g.kid_companies.map(
                                                        (c) => (
                                                            <li key={c.id}>
                                                                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-300 hover:bg-blue-900/20">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedKeys.has(
                                                                            entryKey(
                                                                                g.id,
                                                                                c.id,
                                                                            ),
                                                                        )}
                                                                        onChange={() =>
                                                                            toggleCompany(
                                                                                g.id,
                                                                                c.id,
                                                                            )
                                                                        }
                                                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                                                    />
                                                                    {c.title}
                                                                </label>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                            {expanded && total === 0 && (
                                                <p className="border-t border-blue-900/30 px-2 py-2 pl-8 text-xs text-slate-500">
                                                    该组暂无企业
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
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

// ── SignUpModal ───────────────────────────────────────────────────

interface SignUpModalProps {
    meeting: Meeting;
    companyId: number;
    companyName: string | null;
    onClose: () => void;
    onSaved: () => void;
}

function SignUpModal({
    meeting,
    companyId,
    companyName,
    onClose,
    onSaved,
}: SignUpModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        sex: '',
        job_title: '',
        tel: '',
        card_number: '',
        is_driving: '',
    });

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入姓名');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.post('/meeting-sign-ups', {
                meeting_id: meeting.id,
                company_id: companyId,
                company_name: companyName,
                name: form.name.trim(),
                sex: form.sex || null,
                job_title: form.job_title.trim() || null,
                tel: form.tel.trim() || null,
                card_number: form.card_number.trim() || null,
                is_driving: form.is_driving || null,
            });
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '报名失败';
            setError(msg);
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
                className="w-full max-w-lg rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                            会议报名
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {meeting.name ?? ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="姓名" required>
                        <input
                            className={inputCls}
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                        />
                    </Field>
                    <Field label="性别">
                        <select
                            className={inputCls}
                            value={form.sex}
                            onChange={(e) => update('sex', e.target.value)}
                        >
                            <option value="">请选择</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                        </select>
                    </Field>
                    <Field label="职务">
                        <input
                            className={inputCls}
                            value={form.job_title}
                            onChange={(e) =>
                                update('job_title', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="电话">
                        <input
                            className={inputCls}
                            value={form.tel}
                            onChange={(e) => update('tel', e.target.value)}
                        />
                    </Field>
                    <Field label="证件号">
                        <input
                            className={inputCls}
                            value={form.card_number}
                            onChange={(e) =>
                                update('card_number', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="是否自驾">
                        <select
                            className={inputCls}
                            value={form.is_driving}
                            onChange={(e) =>
                                update('is_driving', e.target.value)
                            }
                        >
                            <option value="">请选择</option>
                            <option value="是">是</option>
                            <option value="否">否</option>
                        </select>
                    </Field>
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
                        提交报名
                    </button>
                </footer>
            </div>
        </div>
    );
}

// ── EditMeetingModal ──────────────────────────────────────────────

interface EditMeetingModalProps {
    meeting: Meeting;
    onClose: () => void;
    onSaved: () => void;
}

function toLocalInput(v: string | null | undefined): string {
    return v ? String(v).slice(0, 16) : '';
}

function EditMeetingModal({
    meeting,
    onClose,
    onSaved,
}: EditMeetingModalProps) {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: meeting.name ?? '',
        theme: meeting.theme ?? '',
        place: meeting.place ?? '',
        alert_others: meeting.alert_others ?? '',
        meeting_date: toLocalInput(meeting.meeting_date),
        sign_up_date: toLocalInput(meeting.sign_up_date),
        sign_end_date: toLocalInput(meeting.sign_end_date),
        summary: meeting.summary ?? '',
        summary_annex_url: meeting.summary_annex_url ?? '',
        sign_annex_url: meeting.sign_annex_url ?? '',
        material_annex_url: meeting.material_annex_url ?? '',
        photo_annex_url: meeting.photo_annex_url ?? '',
    });

    useEffect(() => {
        let ignore = false;
        api.get<ApiResponse<Meeting>>(`/meetings/${meeting.id}`)
            .then((res) => {
                if (ignore) {
                    return;
                }

                const d = res.data.data;
                setForm({
                    name: d.name ?? '',
                    theme: d.theme ?? '',
                    place: d.place ?? '',
                    alert_others: d.alert_others ?? '',
                    meeting_date: toLocalInput(d.meeting_date),
                    sign_up_date: toLocalInput(d.sign_up_date),
                    sign_end_date: toLocalInput(d.sign_end_date),
                    summary: d.summary ?? '',
                    summary_annex_url: d.summary_annex_url ?? '',
                    sign_annex_url: d.sign_annex_url ?? '',
                    material_annex_url: d.material_annex_url ?? '',
                    photo_annex_url: d.photo_annex_url ?? '',
                });
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [meeting.id]);

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入会议名称');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.put(`/meetings/${meeting.id}`, {
                name: form.name.trim(),
                theme: form.theme.trim() || null,
                place: form.place.trim() || null,
                alert_others: form.alert_others.trim() || null,
                meeting_date: form.meeting_date || null,
                sign_up_date: form.sign_up_date || null,
                sign_end_date: form.sign_end_date || null,
                summary: form.summary.trim() || null,
                summary_annex_url: form.summary_annex_url || null,
                sign_annex_url: form.sign_annex_url || null,
                material_annex_url: form.material_annex_url || null,
                photo_annex_url: form.photo_annex_url || null,
            });
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '保存失败';
            setError(msg);
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
                className="w-full max-w-3xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        编辑会议
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {loading ? (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                ) : (
                    <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="会议名称" required>
                                <input
                                    className={inputCls}
                                    value={form.name}
                                    onChange={(e) =>
                                        update('name', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="会议主题">
                                <input
                                    className={inputCls}
                                    value={form.theme}
                                    onChange={(e) =>
                                        update('theme', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="会议地点">
                                <input
                                    className={inputCls}
                                    value={form.place}
                                    onChange={(e) =>
                                        update('place', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="通知人">
                                <input
                                    className={inputCls}
                                    value={form.alert_others}
                                    onChange={(e) =>
                                        update('alert_others', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="会议时间">
                                <input
                                    type="datetime-local"
                                    className={inputCls}
                                    value={form.meeting_date}
                                    onChange={(e) =>
                                        update('meeting_date', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="报名开始">
                                <input
                                    type="datetime-local"
                                    className={inputCls}
                                    value={form.sign_up_date}
                                    onChange={(e) =>
                                        update('sign_up_date', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="报名截止">
                                <input
                                    type="datetime-local"
                                    className={inputCls}
                                    value={form.sign_end_date}
                                    onChange={(e) =>
                                        update('sign_end_date', e.target.value)
                                    }
                                />
                            </Field>
                        </div>
                        <Field label="会议内容">
                            <textarea
                                className={cn(inputCls, 'min-h-[80px]')}
                                value={form.summary}
                                onChange={(e) =>
                                    update('summary', e.target.value)
                                }
                            />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="会议纪要附件">
                                <OssUploadField
                                    value={form.summary_annex_url}
                                    onChange={(url) =>
                                        update('summary_annex_url', url)
                                    }
                                />
                            </Field>
                            <Field label="签到附件">
                                <OssUploadField
                                    value={form.sign_annex_url}
                                    onChange={(url) =>
                                        update('sign_annex_url', url)
                                    }
                                />
                            </Field>
                            <Field label="会议资料附件">
                                <OssUploadField
                                    value={form.material_annex_url}
                                    onChange={(url) =>
                                        update('material_annex_url', url)
                                    }
                                />
                            </Field>
                            <Field label="会议照片附件">
                                <OssUploadField
                                    value={form.photo_annex_url}
                                    onChange={(url) =>
                                        update('photo_annex_url', url)
                                    }
                                />
                            </Field>
                        </div>
                    </div>
                )}

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
                        disabled={saving || loading || !form.name.trim()}
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

// ── DeleteMeetingModal ────────────────────────────────────────────

interface DeleteMeetingModalProps {
    meeting: Meeting;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

function DeleteMeetingModal({
    meeting,
    loading,
    onCancel,
    onConfirm,
}: DeleteMeetingModalProps) {
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
                        删除会议
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {meeting.name ?? `会议 #${meeting.id}`}
                        </span>
                        &rdquo;
                        吗？此操作不可撤销，将同时清除关联的通知与报名记录。
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

// ── OwnSignUpsModal ───────────────────────────────────────────────

interface OwnSignUpsModalProps {
    meeting: Meeting;
    companyId: number;
    onClose: () => void;
}

function OwnSignUpsModal({
    meeting,
    companyId,
    onClose,
}: OwnSignUpsModalProps) {
    const [rows, setRows] = useState<MeetingSignUpRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<PaginatedData<MeetingSignUpRow>>>(
            '/meeting-sign-ups',
            {
                params: {
                    meeting_id: meeting.id,
                    company_id: companyId,
                    per_page: 100,
                },
            },
        )
            .then((res) => {
                if (!ignore) {
                    setRows(res.data.data.data);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setRows([]);
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
    }, [meeting.id, companyId]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                            本企业报名名单
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {meeting.name ?? ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {loading ? (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">
                        尚未报名
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-blue-900/40 bg-[#070d1f]">
                        <table className="min-w-full text-xs">
                            <thead className="bg-blue-950/40 text-left text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">姓名</th>
                                    <th className="px-3 py-2">性别</th>
                                    <th className="px-3 py-2">职务</th>
                                    <th className="px-3 py-2">电话</th>
                                    <th className="px-3 py-2">证件号</th>
                                    <th className="px-3 py-2">自驾</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/30">
                                {rows.map((s) => (
                                    <tr key={s.id} className="text-slate-300">
                                        <td className="px-3 py-2">
                                            {s.name ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.sex ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.job_title ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.tel ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.card_number ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.is_driving ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <footer className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>共 {rows.length} 人</span>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-slate-300 hover:bg-blue-900/20"
                    >
                        关闭
                    </button>
                </footer>
            </div>
        </div>
    );
}
