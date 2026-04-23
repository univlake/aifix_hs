export interface CompanyRef {
    id: number;
    title: string;
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

export interface MeetingNoticeRow {
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

export interface MeetingSignUpRow {
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

export interface Meeting {
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

export interface CreateMeetingPayload {
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

export const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

export function fmt(d: string | null | undefined): string {
    return d ? String(d).slice(0, 16) : '—';
}

export function pickNotices(m: Meeting): MeetingNoticeRow[] {
    return m.meeting_notices ?? m.meetingNotices ?? [];
}

export function toLocalInput(v: string | null | undefined): string {
    return v ? String(v).slice(0, 16) : '';
}
