import type { DailyCheckTemplateNode } from '@/pages/assessment/filing/Index';

export const YEAR_START = 2022;

export const inputCls =
    'rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

export const NORM_TYPES = ['机械', '造纸', '危化', '其他'];

export type TabKey = 'daily' | 'norm' | 'system' | 'accident' | 'points';

export const TABS: { key: TabKey; label: string }[] = [
    { key: 'daily', label: '日常目标管理工作' },
    { key: 'norm', label: '大中型企业安全生产标准化管理体系构建' },
    { key: 'system', label: '活动参与及材料上报情况' },
    { key: 'accident', label: '安全生产事故考核指标' },
    { key: 'points', label: '加分项' },
];

export interface SubmissionDetail {
    company_id: number;
    year: number;
    status: number;
    total_number: number;
    templates: DailyCheckTemplateNode[];
}

export interface AccidentRow {
    company_id: number;
    company_name: string;
    year: number;
    raw_number: number;
    final_number: number;
    row_count: number;
    updated_at: string | null;
    title: string;
}

export interface PointsRow {
    company_id: number;
    company_name: string;
    year: number;
    total_number: number;
    row_count: number;
    updated_at: string | null;
    title: string;
}

export interface NormRow {
    id: number;
    company_id: number;
    company_name: string;
    year: number;
    type: string;
    raw_number: number;
    final_number: number;
    path: string | null;
    updated_at: string | null;
}

export interface SystemRow {
    id: number;
    company_id: number;
    company_name: string;
    year: number;
    number: number;
    number_v1: number;
    number_v2: number;
    number_v3: number;
    number_v4: number;
    number_v5: number;
    updated_at: string | null;
}

export interface TemplateCheck {
    id?: number;
    number: number | string;
    comment: string | null;
}

export interface SimpleTemplateNode {
    id: number;
    title: string;
    level: number;
    sort: number;
    score_range: string | null;
    child?: SimpleTemplateNode[];
    check?: TemplateCheck | null;
}

export function splitPaths(path: string | null | undefined): string[] {
    if (!path) {
        return [];
    }

    return path
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

export function fileNameOf(url: string): string {
    try {
        const n = url.split('/').pop() ?? url;

        return decodeURIComponent(n.split('?')[0]);
    } catch {
        return url;
    }
}

export function yearOptions(): number[] {
    const current = new Date().getFullYear();
    const out: number[] = [];

    for (let y = current; y >= YEAR_START; y--) {
        out.push(y);
    }

    return out;
}
