import { cn } from '@/lib/utils';

export interface AnnexItem {
    id?: number;
    annex_url: string;
}

export interface Investigation {
    id: number;
    company_id: number;
    type: string | null;
    level: string | null;
    is_fire_fighting: number | null;
    is_emergency: number | null;
    inv_time: string | null;
    inv_name: string | null;
    content: string | null;
    legalbasis: string | null;
    proposal: string | null;
    correct_date: string | null;
    correct_result: string | null;
    is_govern: number | null;
    govern_title: string | null;
    govern_user: string | null;
    govern_date: string | null;
    govern_money: string | null;
    govern_supplies: string | null;
    govern_text: string | null;
    review_user: string | null;
    review_date: string | null;
    review_discription: string | null;
    review_content: string | null;
    monthlyInvestigationReviews?: AnnexItem[];
    monthlyInvestigationViews?: AnnexItem[];
    monthly_investigation_reviews?: AnnexItem[];
    monthly_investigation_views?: AnnexItem[];
    company: { id: number; title: string } | null;
}

export const TYPE_OPTIONS = [
    '消防',
    '机械',
    '危化品',
    '职业健康',
    '电气',
    '基础管理',
    '三违',
];

export const LEVEL_OPTIONS = ['一般隐患', '重大隐患'];

export const CORRECT_RESULT_OPTIONS = [
    '已整改',
    '未整改',
    '整改不到位',
    '部分整改',
];

export const LEVEL_CLS: Record<string, string> = {
    一般隐患: 'border-blue-500/30 bg-blue-600/10 text-blue-400',
    重大隐患: 'border-red-500/30 bg-red-600/10 text-red-400',
};

export const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

export const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

export type FormState = {
    type: string;
    level: string;
    is_fire_fighting: string;
    is_emergency: string;
    inv_time: string;
    inv_name: string;
    content: string;
    legalbasis: string;
    proposal: string;
    correct_date: string;
    correct_result: string;
    is_govern: string;
    govern_title: string;
    govern_user: string;
    govern_date: string;
    govern_money: string;
    govern_supplies: string;
    govern_text: string;
    review_user: string;
    review_date: string;
    review_discription: string;
    review_content: string;
    monthlyInvestigationReviews: AnnexItem[];
    monthlyInvestigationViews: AnnexItem[];
};

export function emptyForm(): FormState {
    return {
        type: '',
        level: '',
        is_fire_fighting: '0',
        is_emergency: '0',
        inv_time: '',
        inv_name: '',
        content: '',
        legalbasis: '',
        proposal: '',
        correct_date: '',
        correct_result: '',
        is_govern: '0',
        govern_title: '',
        govern_user: '',
        govern_date: '',
        govern_money: '',
        govern_supplies: '',
        govern_text: '',
        review_user: '',
        review_date: '',
        review_discription: '',
        review_content: '',
        monthlyInvestigationReviews: [],
        monthlyInvestigationViews: [],
    };
}

export function rowToForm(row: Investigation): FormState {
    const monthlyInvestigationReviews =
        row.monthlyInvestigationReviews ??
        row.monthly_investigation_reviews ??
        [];
    const monthlyInvestigationViews =
        row.monthlyInvestigationViews ?? row.monthly_investigation_views ?? [];

    return {
        type: row.type ?? '',
        level: row.level ?? '',
        is_fire_fighting: String(row.is_fire_fighting ?? 0),
        is_emergency: String(row.is_emergency ?? 0),
        inv_time: row.inv_time ?? '',
        inv_name: row.inv_name ?? '',
        content: row.content ?? '',
        legalbasis: row.legalbasis ?? '',
        proposal: row.proposal ?? '',
        correct_date: row.correct_date ?? '',
        correct_result: row.correct_result ?? '',
        is_govern: String(row.is_govern ?? 0),
        govern_title: row.govern_title ?? '',
        govern_user: row.govern_user ?? '',
        govern_date: row.govern_date ?? '',
        govern_money: row.govern_money ?? '',
        govern_supplies: row.govern_supplies ?? '',
        govern_text: row.govern_text ?? '',
        review_user: row.review_user ?? '',
        review_date: row.review_date ?? '',
        review_discription: row.review_discription ?? '',
        review_content: row.review_content ?? '',
        monthlyInvestigationReviews,
        monthlyInvestigationViews,
    };
}
