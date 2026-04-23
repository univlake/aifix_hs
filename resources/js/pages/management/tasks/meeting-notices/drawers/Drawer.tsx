import {
    BellRing,
    CheckCircle2,
    Clock,
    Loader2,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { TabButton } from '../components';
import { fmt } from '../types';
import type { Meeting, MeetingNoticeRow, MeetingSignUpRow } from '../types';

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

export function Drawer({
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
