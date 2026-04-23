import { Head, Link } from '@inertiajs/react';
import {
    Shield,
    AlertTriangle,
    ClipboardCheck,
    BarChart3,
    GraduationCap,
    Flame,
    ArrowRight,
    Activity,
    Lock,
    Server,
} from 'lucide-react';

const features = [
    {
        icon: Shield,
        title: '安全台账',
        desc: '全面记录企业安全生产基础数据，建立完整的安全档案体系',
    },
    {
        icon: AlertTriangle,
        title: '风险管控',
        desc: '危险源辨识、风险评估与隐患排查全流程数字化闭环管理',
    },
    {
        icon: ClipboardCheck,
        title: '检查管理',
        desc: '日常、专项、系统检查多维度覆盖，智能生成整改追踪单',
    },
    {
        icon: GraduationCap,
        title: '培训管理',
        desc: '内外部培训档案统一管理，视频课程与考核记录一体化',
    },
    {
        icon: Flame,
        title: '应急管理',
        desc: '应急预案、演练记录与物资台账，快速响应突发事故',
    },
    {
        icon: BarChart3,
        title: '统计报表',
        desc: '月度/年度数据自动汇总，可视化报表一键导出上报',
    },
];

const stats = [
    { value: '12+', label: '管理模块' },
    { value: '50+', label: '功能页面' },
    { value: '99.9%', label: '系统可用率' },
    { value: '100%', label: '合规覆盖' },
];

export default function Welcome() {
    return (
        <>
            <Head title="安全生产管理系统" />

            <div className="min-h-screen overflow-x-hidden bg-[#070d1f] text-slate-200">
                {/* Background elements */}
                <div className="pointer-events-none fixed inset-0">
                    {/* Grid */}
                    <div className="bg-grid absolute inset-0 opacity-60" />
                    {/* Radial glow top-right */}
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
                    {/* Radial glow bottom-left */}
                    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
                    {/* Scan line */}
                    <div className="animate-scan absolute right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                </div>

                {/* Nav */}
                <nav className="relative z-10 flex items-center justify-between border-b border-blue-900/40 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-600/20">
                            <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-base font-bold tracking-wide">
                            安全生产管理系统
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-1.5 text-xs text-emerald-400 sm:flex">
                            <span className="animate-pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            系统在线
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-600/10 px-4 py-1.5 text-sm text-blue-300 transition-all hover:border-blue-400/60 hover:bg-blue-600/20 hover:text-blue-200"
                        >
                            <Lock className="h-3.5 w-3.5" />
                            登录系统
                        </Link>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative z-10 flex flex-col items-center px-6 pt-24 pb-20 text-center">
                    {/* Badge */}
                    <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-600/10 px-4 py-1.5 text-xs text-blue-300">
                        <Activity className="h-3.5 w-3.5" />
                        企业安全生产数字化解决方案
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fade-in-up-delay-1 max-w-3xl text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        智能安全生产
                        <br />
                        <span className="gradient-text">全链路管控平台</span>
                    </h1>

                    <p className="animate-fade-in-up-delay-2 mt-6 max-w-xl text-base leading-relaxed text-slate-400">
                        整合风险管理、隐患排查、检查管理、应急响应、培训管控等核心模块，
                        助力企业构建本质安全型管理体系，满足安全生产合规要求。
                    </p>

                    {/* CTA */}
                    <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row">
                        <Link
                            href="/login"
                            className="group flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40"
                        >
                            进入管理后台
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <a
                            href="#features"
                            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800"
                        >
                            了解功能模块
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="animate-fade-in-up-delay-4 mt-16 grid w-full max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className="flex flex-col items-center rounded-xl border border-blue-900/40 bg-blue-950/30 px-4 py-5"
                            >
                                <span className="glow-text text-3xl font-bold text-blue-400">
                                    {s.value}
                                </span>
                                <span className="mt-1 text-xs text-slate-500">
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section
                    id="features"
                    className="relative z-10 mx-auto max-w-6xl px-6 pb-24"
                >
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-800/50 bg-blue-950/40 px-4 py-1.5 text-xs text-blue-400">
                            <Server className="h-3.5 w-3.5" />
                            核心功能
                        </div>
                        <h2 className="text-3xl font-bold text-slate-100">
                            覆盖安全生产全业务场景
                        </h2>
                        <p className="mt-3 text-sm text-slate-400">
                            12 个专业管理模块，50+
                            功能页面，满足各类企业安全生产数字化需求
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f, i) => {
                            const Icon = f.icon;

                            return (
                                <div
                                    key={f.title}
                                    className="group relative rounded-xl border border-blue-900/40 bg-[#0d1530]/60 p-6 transition-all hover:border-blue-500/40 hover:bg-[#0d1530]/90"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    {/* Hover glow */}
                                    <div className="absolute inset-0 rounded-xl bg-blue-600/0 transition-all group-hover:bg-blue-600/5" />
                                    <div className="relative">
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-600/15">
                                            <Icon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <h3 className="mb-2 font-semibold text-slate-100">
                                            {f.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-500">
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA banner */}
                <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
                    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/60 to-indigo-950/60 p-10 text-center">
                        {/* Glow corner */}
                        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="relative">
                            <Shield className="animate-float mx-auto mb-4 h-12 w-12 text-blue-400" />
                            <h2 className="mb-3 text-2xl font-bold text-slate-100">
                                准备好开始了吗？
                            </h2>
                            <p className="mb-8 text-sm text-slate-400">
                                使用您的账号登录，立即开始管理企业安全生产事务
                            </p>
                            <Link
                                href="/login"
                                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                立即登录
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 border-t border-blue-900/40 px-6 py-6 text-center text-xs text-slate-600">
                    <div className="mb-1 flex items-center justify-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-blue-800" />
                        <span>安全生产管理系统</span>
                    </div>
                    <p>企业安全生产数字化管理平台</p>
                </footer>
            </div>
        </>
    );
}
