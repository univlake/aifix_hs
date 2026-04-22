import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useScope, type ScopeCompany, type ScopeMode } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import {
    ChevronRight,
    LayoutDashboard,
    Building2,
    Building,
    Users,
    Shield,
    Settings,
    AlertTriangle,
    ClipboardCheck,
    Heart,
    Flame,
    GraduationCap,
    CalendarDays,
    FileText,
    BarChart3,
    BookOpen,
    MapPin,
    Briefcase,
    GitBranch,
    Layers,
    BadgeCheck,
    Map,
    Radar,
    ScanLine,
    Activity,
    Search,
    UserCheck,
    ChevronsUpDown,
    Loader2,
    FolderOpen,
    Wrench,
    FlaskConical,
    GitMerge,
    ShieldAlert,
    Users2,
    AlertOctagon,
    ClipboardList,
    RefreshCw,
    Library,
    Award,
    UserCircle,
    ShieldCheck,
    Trophy,
    ArrowUpRight,
    Cog,
    Stethoscope,
    Siren,
    BookMarked,
    Database,
} from 'lucide-react';

// ── Nav interfaces ────────────────────────────────────────────────

interface NavItem {
    title: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    /** Interacts with / reports to a superior enterprise */
    upstream?: boolean;
    /** Any one of these permissions shows the item. Omit for always-visible items (e.g. Dashboard). */
    permission?: string | string[];
    children?: NavItem[];
}

interface NavSection {
    label?: string;
    mode?: ScopeMode;
    items: NavItem[];
}

// ── Nav data ─────────────────────────────────────────────────────

const navSections: NavSection[] = [
    // ── Always visible ──────────────────────────────────────────
    {
        items: [
            { title: '仪表板', href: '/dashboard', icon: LayoutDashboard },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    //  PRODUCE MODE
    // ══════════════════════════════════════════════════════════════

    {
        mode: 'produce',
        items: [
            { title: '企业信息', href: '/enterprise/current', icon: Building2, permission: 'companies.list' },
        ],
    },
    {
        label: '安全档案',
        mode: 'produce',
        items: [
            {
                title: '安全档案',
                icon: FolderOpen,
                children: [
                    { title: '安全生产组织架构', href: '/safety-archives/org-structure', permission: 'safety-architectures.list' },
                    { title: '人员管理', href: '/safety/personnels', permission: 'personnels.list' },
                    { title: '安全资质管理', href: '/safety-archives/qualifications', permission: 'filing-permissions.list' },
                    { title: '建筑物及构筑物', href: '/safety/buildings', permission: 'buildings.list' },
                    { title: '安全投入', href: '/safety-archives/safety-investment', permission: 'security-investments.list' },
                ],
            },
        ],
    },
    {
        label: '设备信息',
        mode: 'produce',
        items: [
            {
                title: '设备信息',
                icon: Cog,
                children: [
                    { title: '特种设备', href: '/safety/special-equipment', permission: 'special-equipment.list' },
                    { title: '重大危险设备', href: '/equipment/major-hazardous', permission: 'dangerous-equipment.list' },
                ],
            },
        ],
    },
    {
        label: '危险物质',
        mode: 'produce',
        items: [
            {
                title: '危险物质',
                icon: FlaskConical,
                children: [
                    { title: '危险化学品', href: '/safety/hazardous-chemicals', permission: 'hazardous-chemicals.list' },
                    { title: '重大危险源', href: '/safety/major-hazards', permission: 'major-hazards.list' },
                ],
            },
        ],
    },
    {
        label: '工艺信息',
        mode: 'produce',
        items: [
            {
                title: '工艺信息',
                icon: GitMerge,
                children: [
                    { title: '重点监管危险工艺', href: '/process/key-hazardous', permission: 'major-hazardous-processes.list' },
                    { title: '较大危险工艺', href: '/process/hazardous', permission: 'hazardous-processes.list' },
                    { title: '有限空间辨识', href: '/space-work/space-works', permission: 'space-works.list' },
                ],
            },
        ],
    },
    {
        label: '风险管理',
        mode: 'produce',
        items: [
            {
                title: '风险管理',
                icon: ShieldAlert,
                children: [
                    { title: '风险源管理', href: '/risk/hazards', permission: 'hazards.list' },
                    { title: '隐患管理', href: '/risk/monthly-investigation', permission: 'monthly-investigations.list' },
                    { title: '作业管理', href: '/safety/job-management', permission: 'job-management.list' },
                    { title: '三同时管理', href: '/space-work/three-togethers', permission: 'three-togethers.list' },
                    { title: '安全评价与检测', href: '/risk/safety-assessment', permission: 'assess-detects.list' },
                    { title: '风险监测预警', href: '/risk/risk-warning', permission: 'risk-logs.list' },
                    { title: '专家检查', href: '/risk/expert-inspection', upstream: true, permission: 'expert-inspections.list' },
                ],
            },
        ],
    },
    {
        label: '会议培训',
        mode: 'produce',
        items: [
            {
                title: '会议培训',
                icon: CalendarDays,
                children: [
                    { title: '内部会议', href: '/meeting/internal-meetings', permission: 'internal-meetings.list' },
                    { title: '教育培训', href: '/training/education', permission: ['internal-trainings.list', 'external-trainings.list', 'other-trainings.list'] },
                ],
            },
        ],
    },
    {
        label: '第三方管理',
        mode: 'produce',
        items: [
            {
                title: '第三方管理',
                icon: Users2,
                children: [
                    { title: '设计单位', href: '/third-party/design-units', permission: 'design-units.list' },
                    { title: '施工单位', href: '/third-party/construction-units', permission: 'construction-units.list' },
                    { title: '技术服务单位', href: '/third-party/technical-services', permission: 'technical-service-units.list' },
                ],
            },
        ],
    },
    {
        label: '职业健康',
        mode: 'produce',
        items: [
            {
                title: '职业健康',
                icon: Stethoscope,
                children: [
                    { title: '健康档案', href: '/health/health-files', permission: 'health-files.list' },
                    { title: '职业危害因素清单', href: '/health/occupational-hazards', permission: 'occupational-hazards.list' },
                    { title: '健康检查', href: '/health/health-checkups', permission: 'health-checkups.list' },
                    { title: '职业健康评估检测', href: '/health/hygiene-evaluations', permission: 'hygiene-evaluations.list' },
                    { title: '职业病报告', href: '/health/disease-report', permission: 'health-reports.list' },
                ],
            },
        ],
    },
    {
        label: '消防安全',
        mode: 'produce',
        items: [
            {
                title: '消防安全',
                icon: Flame,
                children: [
                    { title: '消防安全管理', href: '/safety/fire-safeties', permission: 'fire-safeties.list' },
                    { title: '消防器材', href: '/fire/equipment', permission: 'fire-equipment.list' },
                    { title: '消防设施', href: '/fire/facilities', permission: 'fire-facilities.list' },
                ],
            },
        ],
    },
    {
        label: '事故应急',
        mode: 'produce',
        items: [
            {
                title: '事故应急',
                icon: AlertOctagon,
                children: [
                    { title: '事故上报', href: '/accident/report', upstream: true, permission: 'accident-bulletins.list' },
                    { title: '应急管理', href: '/accident/emergency', permission: ['emergency-teams.list', 'emergency-supplies.list', 'emergency-drills.list'] },
                ],
            },
        ],
    },
    {
        label: '任务管理',
        mode: 'produce',
        items: [
            {
                title: '任务管理',
                icon: ClipboardList,
                children: [
                    { title: '会议', href: '/meeting/meetings', upstream: true, permission: 'meetings.list' },
                    { title: '通知公告', href: '/tasks/notices', upstream: true, permission: ['office-notifies.list', 'new-notifies.list'] },
                    { title: '信息稿件管理', href: '/tasks/manuscripts', upstream: true, permission: 'information-drafts.list' },
                    { title: '月度数据上报', href: '/tasks/monthly-report', upstream: true, permission: 'month-statistics.list' },
                    { title: '年度数据上报', href: '/tasks/annual-report', upstream: true, permission: 'year-statistics.list' },
                ],
            },
        ],
    },
    {
        mode: 'produce',
        items: [
            { title: '变更管理', href: '/change-management', icon: RefreshCw, permission: 'change-manages.list' },
        ],
    },
    {
        label: '知识管理',
        mode: 'produce',
        items: [
            {
                title: '知识管理',
                icon: Library,
                children: [
                    { title: '法律法规库', href: '/regulation/libraries', permission: 'regulation-libraries.list' },
                    { title: '检查表库', href: '/knowledge/checklists', permission: 'checklist-libraries.list' },
                ],
            },
        ],
    },
    {
        label: '年度考核',
        mode: 'produce',
        items: [
            { title: '考核填报', href: '/assessment/filing', icon: Award, upstream: true, permission: 'add-points.list' },
        ],
    },
    {
        label: '培训中心',
        mode: 'produce',
        items: [
            { title: '培训资料', href: '/training/training-files', icon: BookOpen, permission: 'training-files.list' },
            { title: '培训视频', href: '/training/training-videos', icon: GraduationCap, permission: 'training-videos.list' },
        ],
    },
    {
        mode: 'produce',
        items: [
            { title: '账号管理', href: '/system/users', icon: UserCircle, permission: 'users.list' },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    //  BLOC MODE
    // ══════════════════════════════════════════════════════════════

    {
        label: '企业管理',
        mode: 'bloc',
        items: [
            {
                title: '企业管理',
                icon: Building2,
                children: [
                    { title: '当前企业', href: '/enterprise/current', icon: Building2, permission: 'companies.list' },
                    { title: '下级企业', href: '/enterprise/subsidiaries', icon: GitBranch, permission: 'companies.list' },
                    { title: '企业审批', href: '/enterprise/approval', icon: BadgeCheck, permission: 'companies.review' },
                    { title: '企业分组', href: '/enterprise/grouping', icon: Layers, permission: 'companies.update' },
                ],
            },
        ],
    },
    {
        label: '风险监测',
        mode: 'bloc',
        items: [
            { title: '企业分布图', href: '/risk-monitoring/enterprise-map', icon: Map, permission: 'risk-distribution-maps.list' },
            { title: '重大危险源分布图', href: '/risk-monitoring/hazard-map', icon: Radar, permission: 'major-hazards.list' },
            { title: '在线巡检', href: '/risk-monitoring/online-inspection', icon: ScanLine, permission: 'online-inspection.list' },
            { title: '风险监控', href: '/risk-monitoring/risk-monitor', icon: Activity, permission: 'bloc-risks.list' },
            { title: '特种设备数据统计', href: '/risk-monitoring/special-equipment', icon: Cog, permission: 'special-equipment.list' },
        ],
    },
    {
        label: '风险管控',
        mode: 'bloc',
        items: [
            { title: '隐患管理', href: '/risk-control/monthly-investigation', icon: AlertTriangle, permission: 'monthly-investigations.list' },
            { title: '专家检查', href: '/risk-control/expert-inspection', icon: UserCheck, permission: 'expert-inspections.list' },
        ],
    },
    {
        label: '内部会议',
        mode: 'bloc',
        items: [
            { title: '内部会议', href: '/meeting/internal-meetings', icon: CalendarDays, permission: 'internal-meetings.list' },
        ],
    },
    {
        label: '教育培训',
        mode: 'bloc',
        items: [
            { title: '内部培训', href: '/training/internal-trainings', icon: GraduationCap, permission: 'internal-trainings.list' },
            { title: '外部培训', href: '/training/external-trainings', icon: BookOpen, permission: 'external-trainings.list' },
            { title: '相关方培训', href: '/management/training/relevant-party', icon: Users2, permission: 'other-trainings.list' },
        ],
    },
    {
        label: '知识管理',
        mode: 'bloc',
        items: [
            { title: '法律法规库', href: '/regulation/libraries', icon: Library, permission: 'regulation-libraries.list' },
            { title: '检查表库', href: '/management/knowledge/checklists', icon: ClipboardCheck, permission: 'checklist-libraries.list' },
        ],
    },
    {
        label: '任务管理',
        mode: 'bloc',
        items: [
            {
                title: '任务管理',
                icon: ClipboardList,
                children: [
                    { title: '会议通知', href: '/management/tasks/meeting-notices', permission: 'meetings.list' },
                    { title: '通知公告', href: '/management/tasks/notices', permission: ['office-notifies.list', 'new-notifies.list'] },
                    { title: '信息稿件管理', href: '/management/tasks/manuscripts', permission: 'information-drafts.list' },
                ],
            },
        ],
    },
    {
        label: '事故应急管理',
        mode: 'bloc',
        items: [
            { title: '事故应急管理', href: '/management/accidents/management', icon: Siren, permission: ['emergency-teams.list', 'emergency-drills.list'] },
            { title: '事故上报', href: '/management/accidents/report', icon: AlertOctagon, permission: 'accident-bulletins.list' },
        ],
    },
    {
        mode: 'bloc',
        items: [
            { title: '专家库', href: '/management/experts', icon: Users, permission: 'bloc-experts.list' },
        ],
    },
    {
        label: '年度考核',
        mode: 'bloc',
        items: [
            {
                title: '年度考核',
                icon: Trophy,
                children: [
                    { title: '考核填报', href: '/management/assessment/filing', permission: 'add-points.list' },
                    { title: '考核评分', href: '/management/assessment/scoring', permission: 'add-points.update' },
                    { title: '考核汇总', href: '/management/assessment/summary', permission: 'add-points.list' },
                ],
            },
        ],
    },
    {
        label: '数据统计',
        mode: 'bloc',
        items: [
            {
                title: '数据统计',
                icon: BarChart3,
                children: [
                    { title: '月度数据上报', href: '/statistics/month-statistics', permission: 'month-statistics.list' },
                    { title: '年度数据上报', href: '/statistics/year-statistics', permission: 'year-statistics.list' },
                    { title: '月度报表统计', href: '/management/statistics/monthly-stats', permission: 'month-statistics.list' },
                    { title: '年度报表统计', href: '/management/statistics/annual-stats', permission: 'year-statistics.list' },
                    { title: '通知公告反馈统计', href: '/management/statistics/notice-stats', permission: ['office-notifies.list', 'new-notifies.list'] },
                ],
            },
        ],
    },
    {
        label: '培训中心',
        mode: 'bloc',
        items: [
            {
                title: '培训中心',
                icon: GraduationCap,
                children: [
                    { title: '上传资料', href: '/management/training-center/upload-materials', permission: 'training-files.create' },
                    { title: '培训资料', href: '/training/training-files', permission: 'training-files.list' },
                    { title: '上传视频', href: '/management/training-center/upload-videos', permission: 'training-videos.create' },
                    { title: '培训视频', href: '/training/training-videos', permission: 'training-videos.list' },
                ],
            },
        ],
    },
    {
        label: '系统管理',
        mode: 'bloc',
        items: [
            { title: '账号管理', href: '/system/users', icon: UserCircle, permission: 'users.list' },
            { title: '角色管理', href: '/system/roles', icon: Shield, permission: 'roles.list' },
            { title: '权限管理', href: '/system/permissions', icon: Settings, permission: 'permissions.list' },
            { title: '考核模板管理', href: '/system/assessment-templates', icon: ClipboardList, permission: 'add-points-templates.list' },
            {
                title: '基础数据',
                icon: Database,
                children: [
                    { title: '企业类型', href: '/system/enterprise-types', permission: 'base-data.view' },
                    { title: '经营类型', href: '/system/operational-types', permission: 'base-data.view' },
                    { title: '工艺类型', href: '/system/process-types', permission: 'base-data.view' },
                    { title: '备案/许可类型', href: '/system/record-types', permission: 'base-data.view' },
                    { title: '特种设备类型', href: '/system/special-types', permission: 'base-data.view' },
                    { title: '作业类型', href: '/system/space-work-types', permission: 'base-data.view' },
                    { title: '安全管理人员类型', href: '/system/safety-management-types', permission: 'base-data.view' },
                ],
            },
        ],
    },
];

// ── Route permission lookup ──────────────────────────────────────
// Flatten navSections into a `href → permission(s)` map so AppLayout can guard
// direct-URL access (user types /system/roles but lacks roles.list → redirect).
// Keeping this next to navSections so the two stay in sync.

function collectPermissions(items: NavItem[], into: Record<string, string | string[]>): void {
    for (const item of items) {
        if (item.href && item.permission) {
            into[item.href] = item.permission;
        }
        if (item.children) {
            collectPermissions(item.children, into);
        }
    }
}

const routePermissionMap: Record<string, string | string[]> = (() => {
    const map: Record<string, string | string[]> = {};
    for (const section of navSections) {
        collectPermissions(section.items, map);
    }

    return map;
})();

/**
 * Returns the permission(s) required to view `pathname`, or null if the path
 * is not guarded (e.g. dashboard, public pages, or unknown routes).
 */
export function getRoutePermission(pathname: string): string | string[] | null {
    const normalized = pathname.replace(/\/+$/, '') || '/';

    return routePermissionMap[normalized] ?? null;
}

// ── Nav components ────────────────────────────────────────────────

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
    const { url } = usePage();
    const isActive = item.href
        ? url === item.href || url.startsWith(item.href + '/')
        : false;
    const Icon = item.icon;
    const pl = depth === 0 ? 'pl-3' : 'pl-8';
    const linkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (isActive && linkRef.current) {
            linkRef.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        }
    }, []);

    return (
        <Link
            ref={linkRef}
            href={item.href!}
            className={cn(
                'group relative flex items-center gap-2.5 rounded-lg py-2 pr-3 text-sm transition-colors',
                pl,
                isActive
                    ? 'bg-blue-600/15 text-blue-300 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            )}
        >
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-blue-400" />
            )}
            {Icon && (
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400')} />
            )}
            <span className="flex-1 truncate">{item.title}</span>
            {item.upstream && (
                <ArrowUpRight className="h-2.5 w-2.5 shrink-0 text-blue-600" title="与上级企业交互" />
            )}
        </Link>
    );
}

function NavGroup({ item }: { item: NavItem }) {
    const { url } = usePage();
    const anyChildActive = (item.children ?? []).some(
        (c) => c.href && (url === c.href || url.startsWith(c.href + '/')),
    );
    const [expanded, setExpanded] = useState(anyChildActive);
    const Icon = item.icon;

    return (
        <div>
            <button
                onClick={() => setExpanded((v) => !v)}
                className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-3 text-sm transition-colors',
                    anyChildActive
                        ? 'text-blue-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                )}
            >
                {Icon && (
                    <Icon className={cn('h-4 w-4 shrink-0', anyChildActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400')} />
                )}
                <span className="flex-1 truncate text-left font-medium">{item.title}</span>
                <ChevronRight
                    className={cn(
                        'h-3.5 w-3.5 shrink-0 text-slate-700 transition-transform',
                        expanded && 'rotate-90',
                    )}
                />
            </button>

            {expanded && (
                <div className="mt-0.5 space-y-0.5">
                    {(item.children ?? []).map((child) => (
                        <NavLink key={child.href} item={child} depth={1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Scope Switcher ────────────────────────────────────────────────

function ScopeSwitcher() {
    const {
        activeCompany,
        rootCompany,
        mode,
        canBloc,
        canProduce,
        isSubordinate,
        subordinates,
        loadingSubordinates,
        setMode,
        enterCompany,
        exitToRoot,
    } = useScope();

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!activeCompany || !rootCompany) return null;

    const modeBadge = mode === 'bloc'
        ? <span className="rounded-md bg-blue-900/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-400">集团</span>
        : <span className="rounded-md bg-emerald-900/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">生产</span>;

    return (
        <div ref={ref} className="relative px-2 pb-1">
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'group flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all',
                    open
                        ? 'border-blue-500/40 bg-blue-600/10'
                        : 'border-blue-900/30 bg-[#0a1428] hover:border-blue-500/30 hover:bg-blue-600/8',
                )}
            >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/15">
                    {isSubordinate
                        ? <Building className="h-3.5 w-3.5 text-amber-400" />
                        : <Building2 className="h-3.5 w-3.5 text-blue-400" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">{activeCompany.title}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                        {modeBadge}
                        {isSubordinate && (
                            <span className="text-[9px] text-slate-600 truncate">← {rootCompany.title}</span>
                        )}
                    </div>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-700 group-hover:text-slate-500" />
            </button>

            {open && (
                <div className="absolute left-2 right-2 top-full z-50 mt-1 rounded-xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="border-b border-blue-900/30 p-3">
                        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
                            {isSubordinate ? '返回' : '当前企业'}
                        </p>
                        <button
                            onClick={() => { exitToRoot(); setOpen(false); }}
                            className={cn(
                                'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                                !isSubordinate ? 'bg-blue-600/12 text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                            )}
                        >
                            <Building2 className="h-4 w-4 shrink-0 text-blue-400" />
                            <span className="flex-1 truncate text-xs font-medium">{rootCompany.title}</span>
                            {!isSubordinate && modeBadge}
                        </button>

                        {!isSubordinate && canBloc && canProduce && (
                            <div className="mt-2 flex gap-1 px-1">
                                <ModeButton active={mode === 'bloc'} onClick={() => { setMode('bloc'); setOpen(false); }} label="集团视图" />
                                <ModeButton active={mode === 'produce'} onClick={() => { setMode('produce'); setOpen(false); }} label="生产视图" />
                            </div>
                        )}
                    </div>

                    {canBloc && (
                        <div className="p-3">
                            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-700">下级企业</p>
                            {loadingSubordinates ? (
                                <div className="flex items-center gap-2 px-2 py-3 text-xs text-slate-600">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />加载中...
                                </div>
                            ) : subordinates.length === 0 ? (
                                <p className="px-2 py-2 text-xs text-slate-700">暂无下级企业</p>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-0.5">
                                    {subordinates.map((sub) => (
                                        <SubordinateRow
                                            key={sub.id}
                                            company={sub}
                                            isActive={isSubordinate && activeCompany.id === sub.id}
                                            onClick={() => { enterCompany(sub); setOpen(false); }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex-1 rounded-md border py-1.5 text-[10px] font-medium transition-all',
                active
                    ? 'border-blue-500/40 bg-blue-600/20 text-blue-300'
                    : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-500/30 hover:text-slate-400',
            )}
        >
            {label}
        </button>
    );
}

function SubordinateRow({ company, isActive, onClick }: { company: ScopeCompany; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                isActive ? 'bg-amber-600/10 text-amber-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            )}
        >
            <Building className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400')} />
            <span className="flex-1 truncate text-xs">{company.title}</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-700 group-hover:text-slate-500" />
        </button>
    );
}

// ── Sidebar ───────────────────────────────────────────────────────

interface SidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open }: SidebarProps) {
    const { mode, isReady } = useScope();
    const { hasAny } = usePermission();

    if (!open) return null;

    const isItemAllowed = (item: NavItem): boolean => {
        if (!item.permission) return true;
        const perms = Array.isArray(item.permission) ? item.permission : [item.permission];

        return hasAny(perms);
    };

    const filterItems = (items: NavItem[]): NavItem[] =>
        items
            .map((item) => {
                if (item.children) {
                    const kids = filterItems(item.children);
                    if (kids.length === 0) return null;

                    return { ...item, children: kids };
                }

                return isItemAllowed(item) ? item : null;
            })
            .filter((i): i is NavItem => i !== null);

    const visibleSections = navSections
        .filter((s) => !s.mode || s.mode === mode)
        .map((s) => ({ ...s, items: filterItems(s.items) }))
        .filter((s) => s.items.length > 0);

    return (
        <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-blue-900/30 bg-[#060c1a] md:flex">
            {/* Logo */}
            <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-blue-900/30 px-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-600/20">
                    <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <Link href="/dashboard" className="text-sm font-bold tracking-wide text-slate-200">
                    安全生产管理
                </Link>
            </div>

            {/* Scope switcher */}
            <div className="shrink-0 border-b border-blue-900/20 py-2">
                {isReady ? (
                    <ScopeSwitcher />
                ) : (
                    <div className="mx-2 flex items-center gap-2 rounded-lg border border-blue-900/30 bg-[#0a1428] px-3 py-2.5 animate-pulse">
                        <div className="h-7 w-7 rounded-lg bg-slate-800" />
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-28 rounded bg-slate-800" />
                            <div className="h-2 w-14 rounded bg-slate-800/60" />
                        </div>
                    </div>
                )}
            </div>

            {/* Scrollable nav */}
            <div className="flex-1 overflow-y-auto py-3">
                {visibleSections.map((section, si) => (
                    <div key={si} className={cn('px-2', si > 0 && 'mt-1 border-t border-blue-900/20 pt-3')}>
                        {section.label && (
                            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
                                {section.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) =>
                                item.children ? (
                                    <NavGroup key={item.title} item={item} />
                                ) : (
                                    <NavLink key={item.href} item={item} depth={0} />
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
