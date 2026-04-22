export interface ExpertUser {
    id: number;
    nickname: string;
    phone?: string | null;
}

export interface CheckCompany {
    id: number;
    title: string;
}

export interface AnnexItem {
    id?: number;
    annex_url: string;
    geolocation?: string | null;
}

export interface HiddenDanger {
    id: number;
    area: string;
    session: string;
    description: string;
    hidden_type: string;
    hidden_level: string;
    legalises?: string | null;
    proposal?: string | null;
    correct_deadline?: string | null;
    correct_status: number;
    check_company_id?: number | null;
    zg_user_id?: number | null;
    /** 整改日期（复用 correct_date） */
    correct_date?: string | null;
    /** 整改描述（复用 review_description） */
    review_description?: string | null;
    /** 确认人 */
    review_user_id?: number | null;
    /** 确认时间 */
    review_time?: string | null;
    /** 归档人（复用 archive_user_id） */
    archive_user_id?: number | null;
    invest_status?: number;
    hidden_examine_annex?: AnnexItem[];
    hiddenExamineAnnex?: AnnexItem[];
    hidden_review_annex?: AnnexItem[];
    hiddenReviewAnnex?: AnnexItem[];
    hidden_rectify_annex?: AnnexItem[];
    hiddenRectifyAnnex?: AnnexItem[];
}

export interface ExpertInspectionUserRow {
    id: number;
    expert_user_id: number;
    expert_company_id: number;
    status: number;
    confirm_time: string | null;
    comment?: string | null;
    expert_user?: ExpertUser | null;
    expertUser?: ExpertUser | null;
}

export interface ExpertCompanyRow {
    id: number;
    expert_inspection_id: number;
    check_company_id: number;
    notify_company_time: string | null;
    check_company_time: string | null;
    confirm_time: string | null;
    inspection_notice_url: string | null;
    rectification_sheet_url: string | null;
    status: number;
    check_company?: CheckCompany | null;
    checkCompany?: CheckCompany | null;
    expert_inspection_users?: ExpertInspectionUserRow[];
    expertInspectionUsers?: ExpertInspectionUserRow[];
}

export interface Inspection {
    id: number;
    title: string;
    description: string | null;
    comment: string | null;
    start_date: string | null;
    end_date: string | null;
    company_id: number;
    created_at: string;
    expert_companies?: ExpertCompanyRow[];
    expertCompanies?: ExpertCompanyRow[];
}

export interface CompanyOption {
    id: number;
    title: string;
}

export interface BlocExpertRow {
    id: number;
    expert_user_id: number;
    user: ExpertUser;
}

export interface PlanForm {
    title: string;
    description: string;
    comment: string;
    start_date: string;
    end_date: string;
}

export interface DangerForm {
    area: string;
    session: string;
    description: string;
    hidden_type: string;
    hidden_level: string;
    legalises: string;
    proposal: string;
    correct_deadline: string;
}

export const HIDDEN_TYPE_OPTIONS = [
    '危化品',
    '电气',
    '机械',
    '安全设施',
    '消防',
    '职业卫生',
    '其他',
];
export const HIDDEN_LEVEL_OPTIONS = ['一般隐患', '重大隐患'];
export const HAZARD_STATS_TYPES = [
    '危化品',
    '电气',
    '机械',
    '安全设施',
    '消防',
    '职业健康',
    '其他',
];

export const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

export const emptyPlan = (): PlanForm => ({
    title: '',
    description: '',
    comment: '',
    start_date: '',
    end_date: '',
});

export const emptyDanger = (): DangerForm => ({
    area: '',
    session: '第一轮',
    description: '',
    hidden_type: '',
    hidden_level: '',
    legalises: '',
    proposal: '',
    correct_deadline: '',
});

export function planFromRow(row: Inspection): PlanForm {
    return {
        title: row.title ?? '',
        description: row.description ?? '',
        comment: row.comment ?? '',
        start_date: row.start_date ?? '',
        end_date: row.end_date ?? '',
    };
}
