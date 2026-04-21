import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Bell,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock,
    FileText,
    GraduationCap,
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

interface CompanyNotifyItem {
    id: number;
    expert_inspection_id: number;
    notify_company_time: string | null;
    check_company_time: string | null;
    expert_inspection?: InspectionRef | null;
    expertInspection?: InspectionRef | null;
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

export default function Dashboard() {
    const { user, company } = useAuth();
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [companyNotifs, setCompanyNotifs] = useState<CompanyNotifyItem[]>([]);
    const [expertNotifs, setExpertNotifs] = useState<ExpertNotifyItem[]>([]);
    const [confirming, setConfirming] = useState<{ kind: 'company' | 'expert'; id: number } | null>(null);

    const refresh = useCallback(async () => {
        const tasks: Promise<unknown>[] = [];

        if (companyId) {
            tasks.push(
                api.get<ApiResponse<CompanyNotifyItem[]>>('/expert-inspection-notifications/company', {
                    params: { company_id: companyId },
                }).then((res) => setCompanyNotifs(res.data.data ?? [])).catch(() => setCompanyNotifs([])),
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

    const totalPending = companyNotifs.length + expertNotifs.length;

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
                            <p className="mt-1 text-xs text-slate-700">所有专家检查通知均已确认</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {companyNotifs.map((item) => {
                                const ins = pickInspection(item);

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
        </>
    );
}
