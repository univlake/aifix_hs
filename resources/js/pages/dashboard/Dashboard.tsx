import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Bell,
    Building2,
    ClipboardCheck,
    FileText,
    GraduationCap,
    Shield,
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

interface ExpertNotifyItem {
    id: number;
    expert_user_id: number;
    expert_company_id: number;
    expert_company?: {
        check_company?: { id: number; title: string } | null;
        checkCompany?: { id: number; title: string } | null;
        expert_inspection?: InspectionRef | null;
        expertInspection?: InspectionRef | null;
    } | null;
    expertCompany?: {
        check_company?: { id: number; title: string } | null;
        checkCompany?: { id: number; title: string } | null;
        expert_inspection?: InspectionRef | null;
        expertInspection?: InspectionRef | null;
    } | null;
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

            {/* Expert inspection notifications */}
            {totalPending > 0 && (
                <section className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-400" />
                        <h2 className="text-sm font-semibold text-slate-200">专家检查待办通知</h2>
                        <span className="rounded-full border border-amber-500/30 bg-amber-600/15 px-2 py-0.5 text-[10px] text-amber-400">{totalPending}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {/* Company notifications */}
                        {companyNotifs.map((item) => {
                            const ins = pickInspection(item);

                            return (
                                <div key={`c-${item.id}`} className="rounded-xl border border-amber-500/25 bg-amber-600/5 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={ins?.title ?? ''}>{ins?.title ?? `检查#${item.expert_inspection_id}`}</p>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500">受检企业待确认 · 通知时间：{item.notify_company_time ?? '—'}</p>
                                        </div>
                                        <button
                                            onClick={() => confirmCompany(item.id)}
                                            disabled={confirming?.kind === 'company' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认</button>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Expert notifications */}
                        {expertNotifs.map((item) => {
                            const ins = pickExpertInspection(item);
                            const cc = pickCheckCompany(item);

                            return (
                                <div key={`e-${item.id}`} className="rounded-xl border border-blue-500/25 bg-blue-600/5 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={ins?.title ?? ''}>{ins?.title ?? `检查#${item.expert_company_id}`}</p>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                指派专家检查 · {cc?.title ? `受检：${cc.title}` : '受检企业未指定'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => confirmExpert(item.id)}
                                            disabled={confirming?.kind === 'expert' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

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
                    <div className="mb-5 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/15 border border-blue-600/20">
                            <Shield className="h-4 w-4 text-blue-400" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-200">账户信息</h2>
                    </div>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        {[
                            { label: '用户名', value: user?.username },
                            { label: '昵称', value: user?.nickname },
                            { label: '手机号', value: user?.phone ?? '未设置' },
                            { label: '邮箱', value: user?.email ?? '未设置' },
                        ].map((item) => (
                            <div key={item.label} className="rounded-lg bg-[#070d1f]/60 px-4 py-3">
                                <dt className="text-xs text-slate-600 mb-1">{item.label}</dt>
                                <dd className="text-sm font-medium text-slate-300">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
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
