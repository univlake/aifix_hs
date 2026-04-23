import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputCls } from './types';
import type {
    AnnexItem,
    CheckCompany,
    ExpertCompanyRow,
    ExpertInspectionUserRow,
    ExpertUser,
    HiddenDanger,
    Inspection,
} from './types';

export const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

export function pickCheckCompany(row: ExpertCompanyRow): CheckCompany | null {
    return row.check_company ?? row.checkCompany ?? null;
}

export function pickExpertUser(
    row: ExpertInspectionUserRow,
): ExpertUser | null {
    return row.expert_user ?? row.expertUser ?? null;
}

export function pickCompanies(ins: Inspection): ExpertCompanyRow[] {
    return ins.expert_companies ?? ins.expertCompanies ?? [];
}

export function pickUsers(row: ExpertCompanyRow): ExpertInspectionUserRow[] {
    return row.expert_inspection_users ?? row.expertInspectionUsers ?? [];
}

export function pickExamineAnnex(d: HiddenDanger): AnnexItem[] {
    return d.hidden_examine_annex ?? d.hiddenExamineAnnex ?? [];
}

export function pickRectifyAnnex(d: HiddenDanger): AnnexItem[] {
    return d.hidden_rectify_annex ?? d.hiddenRectifyAnnex ?? [];
}

export function pickReviewAnnex(d: HiddenDanger): AnnexItem[] {
    return d.hidden_review_annex ?? d.hiddenReviewAnnex ?? [];
}

export function dangerStatusLabel(d: HiddenDanger): {
    text: string;
    cls: string;
} {
    if (d.invest_status === 2) {
        return {
            text: '已归档',
            cls: 'border-slate-600/40 bg-slate-700/20 text-slate-400',
        };
    }

    if (d.correct_status === 3 || d.review_time) {
        return {
            text: '已确认',
            cls: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400',
        };
    }

    if (d.correct_status === 2) {
        return {
            text: '已整改待确认',
            cls: 'border-blue-500/30 bg-blue-600/10 text-blue-400',
        };
    }

    return {
        text: '待整改',
        cls: 'border-amber-500/30 bg-amber-600/10 text-amber-400',
    };
}

export function isActive(ins: Inspection): boolean {
    if (!ins.end_date) {
        return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(ins.end_date);
    end.setHours(0, 0, 0, 0);

    return end.getTime() >= today.getTime();
}

export function Modal({
    open,
    onClose,
    size = 'md',
    children,
}: {
    open: boolean;
    onClose: () => void;
    size?: 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}) {
    if (!open) {
        return null;
    }

    const widthCls =
        size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-2xl';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60',
                    widthCls,
                )}
            >
                {children}
            </div>
        </div>
    );
}

export function ModalHeader({
    title,
    subtitle,
    onClose,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <div>
                <h2 className="text-base font-semibold text-slate-100">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}
