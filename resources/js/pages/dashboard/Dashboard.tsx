import { Head, Link } from '@inertiajs/react';
import { DraftDetailsModal, type InformationDraft } from '@/pages/management/tasks/manuscripts/Index';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Bell,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock,
    FileText,
    GraduationCap,
    Inbox,
    MapPin,
    Pin,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

interface InspectionRef {
    id: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
}

interface ExpertBrief {
    id: number;
    nickname: string | null;
    phone?: string | null;
}

interface ExpertInspectionUserBrief {
    id: number;
    expert_user?: ExpertBrief | null;
    expertUser?: ExpertBrief | null;
}

interface CompanyNotifyItem {
    id: number;
    expert_inspection_id: number;
    notify_company_time: string | null;
    check_company_time: string | null;
    expert_inspection?: InspectionRef | null;
    expertInspection?: InspectionRef | null;
    expert_inspection_users?: ExpertInspectionUserBrief[];
    expertInspectionUsers?: ExpertInspectionUserBrief[];
}

interface ExpertCompanyRef {
    check_company?: { id: number; title: string } | null;
    checkCompany?: { id: number; title: string } | null;
    expert_inspection?: InspectionRef | null;
    expertInspection?: InspectionRef | null;
    notify_company_time?: string | null;
    check_company_time?: string | null;
}

interface ExpertNotifyItem {
    id: number;
    expert_user_id: number;
    expert_company_id: number;
    expert_company?: ExpertCompanyRef | null;
    expertCompany?: ExpertCompanyRef | null;
}

interface MeetingRef {
    id: number;
    name: string | null;
    meeting_date: string | null;
    sign_end_date: string | null;
    place: string | null;
    theme: string | null;
}

interface MeetingNotifyItem {
    id: number;
    meeting_id: number;
    company_id: number;
    notify_time: string | null;
    confirm_time: string | null;
    meeting?: MeetingRef | null;
}

interface OfficeNotifyRef {
    id: number;
    name: string | null;
    comment: string | null;
    feedback_time: string | null;
    alert_others: string | null;
}

interface OfficeNotifyPendingItem {
    id: number;
    office_notify_id: number;
    company_id: number;
    feedback_status: string | null;
    feedback_time: string | null;
    office_notify?: OfficeNotifyRef | null;
    officeNotify?: OfficeNotifyRef | null;
}

interface NewNotifyRef {
    id: number;
    name: string | null;
    comment: string | null;
    alert_others: string | null;
}

interface NewNotifyPendingItem {
    id: number;
    new_notify_id: number;
    company_id: number;
    read_status: string | null;
    read_time: string | null;
    new_notify?: NewNotifyRef | null;
    newNotify?: NewNotifyRef | null;
}


const stats = [
    { title: '企业管理', icon: Building2, href: '/system/companies', color: 'text-blue-400', bg: 'bg-blue-600/15', border: 'border-blue-600/20' },
    { title: '用户管理', icon: Users, href: '/system/users', color: 'text-violet-400', bg: 'bg-violet-600/15', border: 'border-violet-600/20' },
    { title: '风险记录', icon: AlertTriangle, href: '/risk/risk-logs', color: 'text-amber-400', bg: 'bg-amber-600/15', border: 'border-amber-600/20' },
    { title: '隐患排查', icon: ClipboardCheck, href: '/risk/monthly-investigation', color: 'text-emerald-400', bg: 'bg-emerald-600/15', border: 'border-emerald-600/20' },
    { title: '检查管理', icon: FileText, href: '/inspection/daily-checks', color: 'text-cyan-400', bg: 'bg-cyan-600/15', border: 'border-cyan-600/20' },
    { title: '培训管理', icon: GraduationCap, href: '/training/training-classes', color: 'text-rose-400', bg: 'bg-rose-600/15', border: 'border-rose-600/20' },
];

const quickLinks = [
    { title: '风险记录', href: '/risk/risk-logs' },
    { title: '隐患排查', href: '/risk/monthly-investigation' },
    { title: '日常检查', href: '/inspection/daily-checks' },
    { title: '应急演练', href: '/emergency/emergency-drills' },
    { title: '月度统计', href: '/statistics/month-statistics' },
    { title: '法律法规库', href: '/regulation/libraries' },
];

function pickInspection<T extends { expert_inspection?: InspectionRef | null; expertInspection?: InspectionRef | null }>(row: T): InspectionRef | null {
    return row.expert_inspection ?? row.expertInspection ?? null;
}

function pickCheckCompany(row: ExpertNotifyItem): { id: number; title: string } | null {
    const ec = row.expert_company ?? row.expertCompany ?? null;

    return ec?.check_company ?? ec?.checkCompany ?? null;
}

function pickExpertInspection(row: ExpertNotifyItem): InspectionRef | null {
    const ec = row.expert_company ?? row.expertCompany ?? null;

    return ec?.expert_inspection ?? ec?.expertInspection ?? null;
}

function pickOfficeNotify(row: OfficeNotifyPendingItem): OfficeNotifyRef | null {
    return row.office_notify ?? row.officeNotify ?? null;
}

function pickNewNotify(row: NewNotifyPendingItem): NewNotifyRef | null {
    return row.new_notify ?? row.newNotify ?? null;
}

export default function Dashboard() {
    const { user, company } = useAuth();
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [companyNotifs, setCompanyNotifs] = useState<CompanyNotifyItem[]>([]);
    const [expertNotifs, setExpertNotifs] = useState<ExpertNotifyItem[]>([]);
    const [meetingNotifs, setMeetingNotifs] = useState<MeetingNotifyItem[]>([]);
    const [officeNotifs, setOfficeNotifs] = useState<OfficeNotifyPendingItem[]>([]);
    const [newNotifs, setNewNotifs] = useState<NewNotifyPendingItem[]>([]);
    const [manuscripts, setManuscripts] = useState<InformationDraft[]>([]);
    const [manuscriptPending, setManuscriptPending] = useState<InformationDraft[]>([]);
    const [viewingDraft, setViewingDraft] = useState<InformationDraft | null>(null);
    const [confirming, setConfirming] = useState<{ kind: 'company' | 'expert' | 'meeting' | 'new'; id: number } | null>(null);

    const refresh = useCallback(async () => {
        const tasks: Promise<unknown>[] = [];

        if (companyId) {
            tasks.push(
                api.get<ApiResponse<CompanyNotifyItem[]>>('/expert-inspection-notifications/company', {
                    params: { company_id: companyId },
                }).then((res) => setCompanyNotifs(res.data.data ?? [])).catch(() => setCompanyNotifs([])),
                api.get<ApiResponse<MeetingNotifyItem[]>>('/meeting-notifications/pending', {
                    params: { company_id: companyId },
                }).then((res) => setMeetingNotifs(res.data.data ?? [])).catch(() => setMeetingNotifs([])),
                api.get<ApiResponse<OfficeNotifyPendingItem[]>>('/office-notify-notifications/pending', {
                    params: { company_id: companyId },
                }).then((res) => setOfficeNotifs(res.data.data ?? [])).catch(() => setOfficeNotifs([])),
                api.get<ApiResponse<NewNotifyPendingItem[]>>('/new-notify-notifications/pending', {
                    params: { company_id: companyId },
                }).then((res) => setNewNotifs(res.data.data ?? [])).catch(() => setNewNotifs([])),
                api.get<ApiResponse<InformationDraft[]>>('/information-drafts/dashboard/readings', {
                    params: { company_id: companyId, limit: 8 },
                }).then((res) => setManuscripts(res.data.data ?? [])).catch(() => setManuscripts([])),
                api.get<ApiResponse<InformationDraft[]>>('/information-drafts/dashboard/pending', {
                    params: { company_id: companyId, limit: 10 },
                }).then((res) => setManuscriptPending(res.data.data ?? [])).catch(() => setManuscriptPending([])),
            );
        }

        if (user?.id) {
            tasks.push(
                api.get<ApiResponse<ExpertNotifyItem[]>>('/expert-inspection-notifications/expert', {
                    params: { expert_user_id: user.id },
                }).then((res) => setExpertNotifs(res.data.data ?? [])).catch(() => setExpertNotifs([])),
            );
        }

        await Promise.all(tasks);
    }, [companyId, user?.id]);

    useEffect(() => {
 refresh(); 
}, [refresh]);

    const confirmCompany = async (id: number) => {
        setConfirming({ kind: 'company', id });

        try {
            await api.post(`/expert-inspection-companies/${id}/confirm`);
            refresh();
        } finally {
            setConfirming(null);
        }
    };

    const confirmExpert = async (id: number) => {
        setConfirming({ kind: 'expert', id });

        try {
            await api.post(`/expert-inspection-users/${id}/confirm`);
            refresh();
        } finally {
            setConfirming(null);
        }
    };

    const confirmMeeting = async (id: number) => {
        setConfirming({ kind: 'meeting', id });

        try {
            await api.post(`/meeting-notices/${id}/confirm`);
            refresh();
        } finally {
            setConfirming(null);
        }
    };

    const markNewRead = async (id: number) => {
        setConfirming({ kind: 'new', id });

        try {
            await api.post(`/new-notify-scopes/${id}/read`);
            refresh();
        } finally {
            setConfirming(null);
        }
    };

    const totalPending = companyNotifs.length + expertNotifs.length + meetingNotifs.length + officeNotifs.length + newNotifs.length + manuscriptPending.length;

    return (
        <>
            <Head title="仪表板" />

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        欢迎回来，
                        <span className="text-blue-400">{user?.nickname ?? user?.username}</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {company?.title ? `当前企业：${company.title}` : '安全生产管理系统 · 数字化管控平台'}
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400">
                    <Activity className="h-3.5 w-3.5 animate-pulse-glow" />
                    系统运行正常
                </div>
            </div>

            {/* Quick stats grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((s) => {
                    const Icon = s.icon;

                    return (
                        <Link
                            key={s.title}
                            href={s.href}
                            className={`group relative overflow-hidden rounded-xl border ${s.border} bg-[#0d1530] p-5 transition-all hover:border-opacity-60 hover:bg-[#0d1530]/90`}
                        >
                            <div className="absolute inset-0 rounded-xl bg-blue-600/0 transition-all group-hover:bg-blue-600/3" />
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{s.title}</p>
                                    <p className="text-2xl font-bold text-slate-300">—</p>
                                    <p className="mt-1 text-xs text-slate-600 flex items-center gap-1">
                                        点击查看详细
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                    </p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} border ${s.border}`}>
                                    <Icon className={`h-5 w-5 ${s.color}`} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Information drafts */}
            <div className="mb-8 rounded-xl border border-blue-900/40 bg-[#0d1530] p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600/15 border border-sky-600/20">
                            <FileText className="h-4 w-4 text-sky-400" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-200">最新动态</h2>
                        {manuscripts.length > 0 && (
                            <span className="rounded-full border border-sky-500/30 bg-sky-600/15 px-2 py-0.5 text-[10px] text-sky-400">{manuscripts.length}</span>
                        )}
                    </div>
                    <Link href="/tasks/manuscripts" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                        查看全部<ArrowRight className="ml-1 inline h-3 w-3" />
                    </Link>
                </div>
                {manuscripts.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-600">暂无最新动态</p>
                ) : (
                    <ul className="space-y-1.5">
                        {manuscripts.map((m) => {
                            const isMine = m.company_id === companyId;

                            return (
                                <li key={m.id}>
                                    <button
                                        type="button"
                                        onClick={() => setViewingDraft(m)}
                                        className="flex w-full items-center gap-3 rounded-lg border border-blue-900/40 bg-[#070d1f] px-4 py-2.5 text-left transition-colors hover:border-sky-500/40 hover:bg-[#0a1329]"
                                    >
                                        {m.is_top === 1 && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                                        <span className="truncate text-sm font-medium text-slate-100">{m.name}</span>
                                        <span className={`shrink-0 rounded px-1.5 py-0 text-[10px] ${isMine ? 'border border-emerald-500/30 bg-emerald-600/10 text-emerald-400' : 'border border-blue-500/30 bg-blue-600/10 text-blue-300'}`}>
                                            {isMine ? '本企业' : '上级发布'}
                                        </span>
                                        <span className="ml-auto hidden shrink-0 items-center gap-1 text-[11px] text-slate-500 sm:inline-flex">
                                            <Building2 className="h-3 w-3" />
                                            <span className="max-w-[160px] truncate">{m.company_name}</span>
                                        </span>
                                        <span className="shrink-0 text-[11px] text-slate-500">{String(m.created_at).slice(0, 10)}</span>
                                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-blue-900/40 bg-[#0d1530] p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600/15 border border-amber-600/20">
                                <ClipboardList className="h-4 w-4 text-amber-400" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-200">待办事项</h2>
                            {totalPending > 0 && (
                                <span className="rounded-full border border-amber-500/30 bg-amber-600/15 px-2 py-0.5 text-[10px] text-amber-400">{totalPending}</span>
                            )}
                        </div>
                    </div>
                    {totalPending === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle2 className="mb-2 h-8 w-8 text-slate-700" />
                            <p className="text-sm text-slate-500">暂无待办事项</p>
                            <p className="mt-1 text-xs text-slate-700">所有通知均已确认</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {companyNotifs.map((item) => {
                                const ins = pickInspection(item);
                                const users = item.expert_inspection_users ?? item.expertInspectionUsers ?? [];
                                const expertNames = users
                                    .map((u) => (u.expert_user ?? u.expertUser)?.nickname)
                                    .filter((n): n is string => !!n);

                                return (
                                    <div key={`c-${item.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/25 bg-amber-600/5 p-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={ins?.title ?? ''}>{ins?.title ?? `检查#${item.expert_inspection_id}`}</p>
                                                <span className="shrink-0 rounded border border-amber-500/30 bg-amber-600/10 px-1.5 py-0 text-[10px] text-amber-400">企业待确认</span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Bell className="h-3 w-3" />通知：{item.notify_company_time ?? '—'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />检查：{item.check_company_time ?? '—'}
                                                </span>
                                            </div>
                                            {expertNames.length > 0 && (
                                                <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                                    <UserCheck className="h-3 w-3 text-slate-500" />
                                                    <span>专家：</span>
                                                    {expertNames.map((n, i) => (
                                                        <span key={`${item.id}-exp-${i}`} className="rounded bg-blue-900/30 px-1.5 py-0 text-[10px] text-blue-200">{n}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => confirmCompany(item.id)}
                                            disabled={confirming?.kind === 'company' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认收到</button>
                                    </div>
                                );
                            })}
                            {expertNotifs.map((item) => {
                                const ins = pickExpertInspection(item);
                                const cc = pickCheckCompany(item);
                                const ec = item.expert_company ?? item.expertCompany ?? null;
                                const checkTime = ec?.check_company_time ?? null;
                                const notifyTime = ec?.notify_company_time ?? null;

                                return (
                                    <div key={`e-${item.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-blue-500/25 bg-blue-600/5 p-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={ins?.title ?? ''}>{ins?.title ?? `检查#${item.expert_company_id}`}</p>
                                                <span className="shrink-0 rounded border border-blue-500/30 bg-blue-600/10 px-1.5 py-0 text-[10px] text-blue-400">专家任务</span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />受检：{cc?.title ?? '未指定'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />检查：{checkTime ?? '—'}
                                                </span>
                                                {notifyTime && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Bell className="h-3 w-3" />通知：{notifyTime}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => confirmExpert(item.id)}
                                            disabled={confirming?.kind === 'expert' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认收到</button>
                                    </div>
                                );
                            })}
                            {meetingNotifs.map((item) => {
                                const m = item.meeting ?? null;

                                return (
                                    <div key={`m-${item.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-violet-500/25 bg-violet-600/5 p-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={m?.name ?? ''}>{m?.name ?? `会议#${item.meeting_id}`}</p>
                                                <span className="shrink-0 rounded border border-violet-500/30 bg-violet-600/10 px-1.5 py-0 text-[10px] text-violet-400">会议通知</span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />时间：{m?.meeting_date ?? '—'}
                                                </span>
                                                {m?.place && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />{m.place}
                                                    </span>
                                                )}
                                                {m?.sign_end_date && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Bell className="h-3 w-3" />报名截止：{m.sign_end_date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => confirmMeeting(item.id)}
                                            disabled={confirming?.kind === 'meeting' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认收到</button>
                                    </div>
                                );
                            })}
                            {officeNotifs.map((item) => {
                                const n = pickOfficeNotify(item);

                                return (
                                    <div key={`on-${item.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-rose-500/25 bg-rose-600/5 p-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <ClipboardList className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={n?.name ?? ''}>{n?.name ?? `任务#${item.office_notify_id}`}</p>
                                                <span className="shrink-0 rounded border border-rose-500/30 bg-rose-600/10 px-1.5 py-0 text-[10px] text-rose-400">任务型通知</span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                {n?.feedback_time && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />反馈截止：{n.feedback_time}
                                                    </span>
                                                )}
                                                {n?.alert_others && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Bell className="h-3 w-3" />通知人：{n.alert_others}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href="/tasks/notices"
                                            className="shrink-0 rounded-md border border-rose-500/30 bg-rose-600/15 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-600/25"
                                        >去反馈</Link>
                                    </div>
                                );
                            })}
                            {newNotifs.map((item) => {
                                const n = pickNewNotify(item);

                                return (
                                    <div key={`nn-${item.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-cyan-500/25 bg-cyan-600/5 p-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Inbox className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={n?.name ?? ''}>{n?.name ?? `通知#${item.new_notify_id}`}</p>
                                                <span className="shrink-0 rounded border border-cyan-500/30 bg-cyan-600/10 px-1.5 py-0 text-[10px] text-cyan-400">通知型通知</span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                {n?.alert_others && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Bell className="h-3 w-3" />通知人：{n.alert_others}
                                                    </span>
                                                )}
                                                {n?.comment && (
                                                    <span className="inline-flex items-center gap-1 truncate" title={n.comment}>
                                                        <FileText className="h-3 w-3" />{n.comment.slice(0, 40)}{n.comment.length > 40 ? '…' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => markNewRead(item.id)}
                                            disabled={confirming?.kind === 'new' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >标记已读</button>
                                    </div>
                                );
                            })}
                            {manuscriptPending.map((d) => (
                                <div key={`md-${d.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-sky-500/25 bg-sky-600/5 p-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                                            <p className="truncate text-sm font-semibold text-slate-100" title={d.name}>{d.name}</p>
                                            <span className="shrink-0 rounded border border-sky-500/30 bg-sky-600/10 px-1.5 py-0 text-[10px] text-sky-400">下级上报</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                            <span className="inline-flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />{d.company_name}
                                            </span>
                                            {d.draft_others && (
                                                <span className="inline-flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" />{d.draft_others}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" />{String(d.created_at).slice(0, 10)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setViewingDraft(d)}
                                        className="shrink-0 rounded-md border border-sky-500/30 bg-sky-600/15 px-2.5 py-1 text-xs text-sky-300 hover:bg-sky-600/25"
                                    >详情</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-6">
                    <div className="mb-5 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/15 border border-violet-600/20">
                            <TrendingUp className="h-4 w-4 text-violet-400" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-200">快捷入口</h2>
                    </div>
                    <div className="space-y-1.5">
                        {quickLinks.map((l) => (
                            <Link
                                key={l.title}
                                href={l.href}
                                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-blue-600/10 hover:text-slate-200 group"
                            >
                                <span>{l.title}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-slate-700 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {viewingDraft && (
                <DraftDetailsModal
                    draft={viewingDraft}
                    onClose={() => setViewingDraft(null)}
                />
            )}
        </>
    );
}
