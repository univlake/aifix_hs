import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Clock,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { Drawer } from './drawers/Drawer';
import { AddCompanyModal } from './modals/AddCompanyModal';
import { CreateMeetingModal } from './modals/CreateMeetingModal';
import { DeleteMeetingModal } from './modals/DeleteMeetingModal';
import { EditMeetingModal } from './modals/EditMeetingModal';
import { OwnSignUpsModal } from './modals/OwnSignUpsModal';
import { SignUpModal } from './modals/SignUpModal';
import { fmt, inputCls, pickNotices } from './types';
import type { Meeting, MeetingNoticeRow, MeetingSignUpRow } from './types';

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

    const { canWrite } = usePermission();
    const canCreate = canWrite('meetings.create');
    const canUpdate = canWrite('meetings.update');
    const canDelete = canWrite('meetings.delete');

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
                        {!receiveOnly && canCreate && (
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
                                                                {canUpdate && (
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
                                                                )}
                                                                {canDelete && (
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
                                                                )}
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
