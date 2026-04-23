export type NoticeVariant = 'office' | 'new';

export interface VariantConfig {
    label: string;
    endpoint: string;
    scopesKey:
        | 'office_notify_scope'
        | 'new_notify_scope'
        | 'officeNotifyScope'
        | 'newNotifyScope';
    scopeAltKeys: string[];
    scopeReceiverPath: string;
    scopeReceiverLabel: string;
    hasFeedback: boolean;
    hasExcel: boolean;
    emptyLabel: string;
}

export const CONFIG: Record<NoticeVariant, VariantConfig> = {
    office: {
        label: '任务型',
        endpoint: '/office-notifies',
        scopesKey: 'office_notify_scope',
        scopeAltKeys: ['officeNotifyScope'],
        scopeReceiverPath: '/office-notify-scopes',
        scopeReceiverLabel: '提交反馈',
        hasFeedback: true,
        hasExcel: true,
        emptyLabel: '暂无任务型通知',
    },
    new: {
        label: '通知型',
        endpoint: '/new-notifies',
        scopesKey: 'new_notify_scope',
        scopeAltKeys: ['newNotifyScope'],
        scopeReceiverPath: '/new-notify-scopes',
        scopeReceiverLabel: '标记已读',
        hasFeedback: false,
        hasExcel: false,
        emptyLabel: '暂无通知型通知',
    },
};

export interface NoticeScopeRow {
    id: number;
    company_id: number;
    company_name: string | null;
    company_group_id: number | null;
    company_group_name: string | null;
    feedback_time?: string | null;
    feedback_status?: string | null;
    feedback_annex_url?: string | null;
    read_time?: string | null;
    read_status?: string | null;
}

export interface NoticeRow {
    id: number;
    name: string | null;
    alert_others: string | null;
    comment: string | null;
    annex_url: string | null;
    excel_url?: string | null;
    feedback_time?: string | null;
    company_id: number;
    office_notify_scope?: NoticeScopeRow[];
    officeNotifyScope?: NoticeScopeRow[];
    new_notify_scope?: NoticeScopeRow[];
    newNotifyScope?: NoticeScopeRow[];
}

export interface GroupCompany {
    id: number;
    title: string;
    status: number;
}

export interface EnterpriseGroup {
    id: number;
    name: string;
    company_id: number;
    kid_companies: GroupCompany[];
}

export const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

export function fmt(d: string | null | undefined): string {
    return d ? String(d).slice(0, 16) : '—';
}

export function pickScopes(n: NoticeRow): NoticeScopeRow[] {
    return (
        n.office_notify_scope ??
        n.officeNotifyScope ??
        n.new_notify_scope ??
        n.newNotifyScope ??
        []
    );
}

export function isDone(variant: NoticeVariant, s: NoticeScopeRow): boolean {
    return variant === 'office'
        ? s.feedback_status === '已反馈'
        : s.read_status === '已读';
}
