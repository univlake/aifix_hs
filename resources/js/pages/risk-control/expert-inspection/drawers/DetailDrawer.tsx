import {
    Archive,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileCheck,
    FileDown,
    FileSpreadsheet,
    Loader2,
    Plus,
    Trash2,
    UserCheck,
    Users,
    Wrench,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    ConfirmRectificationModal,
    RectifyModal,
} from '@/components/shared/HiddenDangerActionModals';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse, PaginatedData } from '@/types/models';
import {
    dangerStatusLabel,
    isActive,
    pickCheckCompany,
    pickExpertUser,
    pickUsers,
} from '../components';
import { AddCompanyModal } from '../modals/AddCompanyModal';
import { AddExpertModal } from '../modals/AddExpertModal';
import { DangerDetailsModal } from '../modals/DangerDetailsModal';
import { DangerModal } from '../modals/DangerModal';
import type {
    ExpertCompanyRow,
    ExpertInspectionUserRow,
    HiddenDanger,
    Inspection,
} from '../types';

export function DetailDrawer({
    inspection,
    canEdit,
    userId,
    onClose,
    onChanged,
    rootCompanyId,
}: {
    inspection: Inspection;
    canEdit: boolean;
    userId: number | null;
    onClose: () => void;
    onChanged: () => void;
    rootCompanyId: number;
}) {
    const [companies, setCompanies] = useState<ExpertCompanyRow[]>([]);
    const [dangers, setDangers] = useState<HiddenDanger[]>([]);
    const [loading, setLoading] = useState(false);
    const [addCompanyOpen, setAddCompanyOpen] = useState(false);
    const [addExpertFor, setAddExpertFor] = useState<ExpertCompanyRow | null>(
        null,
    );
    const [addDangerFor, setAddDangerFor] = useState<ExpertCompanyRow | null>(
        null,
    );
    const [confirmFor, setConfirmFor] = useState<HiddenDanger | null>(null);
    const [rectifyFor, setRectifyFor] = useState<HiddenDanger | null>(null);
    const [archiving, setArchiving] = useState<number | null>(null);
    const [generatingNotice, setGeneratingNotice] = useState<number | null>(
        null,
    );
    const [generatingSheet, setGeneratingSheet] = useState<number | null>(null);
    const [viewingDanger, setViewingDanger] = useState<HiddenDanger | null>(
        null,
    );

    const isPlanOwner = inspection.company_id === rootCompanyId;

    const refresh = useCallback(async () => {
        setLoading(true);

        try {
            const [companiesRes, dangersRes] = await Promise.all([
                api.get<ApiResponse<PaginatedData<ExpertCompanyRow>>>(
                    '/expert-inspection-companies',
                    {
                        params: {
                            expert_inspection_id: inspection.id,
                            per_page: 100,
                        },
                    },
                ),
                api.get<ApiResponse<PaginatedData<HiddenDanger>>>(
                    '/hidden-danger-infos',
                    {
                        params: {
                            expert_inspection_id: inspection.id,
                            per_page: 200,
                        },
                    },
                ),
            ]);
            setCompanies(companiesRes.data.data.data);
            setDangers(dangersRes.data.data.data);
        } finally {
            setLoading(false);
        }
    }, [inspection.id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const removeCompany = async (c: ExpertCompanyRow) => {
        if (!window.confirm('确定要删除该受检企业记录吗？')) {
            return;
        }

        await api.delete(`/expert-inspection-companies/${c.id}`);
        refresh();
        onChanged();
    };

    const removeExpert = async (u: ExpertInspectionUserRow) => {
        if (!window.confirm('确定要移除该专家吗？')) {
            return;
        }

        await api.delete(`/expert-inspection-users/${u.id}`);
        refresh();
    };

    const generateNotice = async (ec: ExpertCompanyRow) => {
        setGeneratingNotice(ec.id);

        try {
            await api.post(
                `/expert-inspection-companies/${ec.id}/inspection-notice`,
            );
            await refresh();
        } catch (err: unknown) {
            window.alert(getErrorMessage(err, '生成失败'));
        } finally {
            setGeneratingNotice(null);
        }
    };

    const downloadNotice = async (ec: ExpertCompanyRow) => {
        try {
            const res = await api.get(
                `/expert-inspection-companies/${ec.id}/inspection-notice`,
                {
                    responseType: 'blob',
                },
            );
            const blob = new Blob([res.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `检查通知单-${pickCheckCompany(ec)?.title ?? ec.id}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (err: unknown) {
            window.alert(getErrorMessage(err, '下载失败'));
        }
    };

    const generateSheet = async (ec: ExpertCompanyRow) => {
        setGeneratingSheet(ec.id);

        try {
            await api.post(
                `/expert-inspection-companies/${ec.id}/rectification-sheet`,
            );
            await refresh();
        } catch (err: unknown) {
            window.alert(getErrorMessage(err, '生成失败'));
        } finally {
            setGeneratingSheet(null);
        }
    };

    const downloadSheet = async (ec: ExpertCompanyRow) => {
        try {
            const res = await api.get(
                `/expert-inspection-companies/${ec.id}/rectification-sheet`,
                {
                    responseType: 'blob',
                },
            );
            const blob = new Blob([res.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `整改通知单-${pickCheckCompany(ec)?.title ?? ec.id}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (err: unknown) {
            window.alert(getErrorMessage(err, '下载失败'));
        }
    };

    const archiveDanger = async (d: HiddenDanger) => {
        if (!window.confirm('确认对该隐患进行归档？归档后将不可再修改。')) {
            return;
        }

        setArchiving(d.id);

        try {
            await api.post(`/hidden-danger-infos/${d.id}/archive`);
            refresh();
        } finally {
            setArchiving(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex justify-end">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <div className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                    <div className="flex items-start justify-between border-b border-blue-900/30 px-6 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">
                                {inspection.title}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-600">
                                {inspection.start_date ?? '—'} 至{' '}
                                {inspection.end_date ?? '—'}
                                {!canEdit && (
                                    <span className="ml-2 rounded border border-slate-700/40 bg-slate-700/20 px-1.5 py-0.5 text-[10px] text-slate-500">
                                        已结束
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {inspection.description && (
                            <section className="mb-5 rounded-lg border border-blue-900/20 bg-[#070d1f] px-4 py-3">
                                <p className="mb-1 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                    检查说明
                                </p>
                                <p className="text-sm whitespace-pre-wrap text-slate-300">
                                    {inspection.description}
                                </p>
                            </section>
                        )}

                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                    受检企业 ({companies.length})
                                </p>
                                {canEdit && (
                                    <button
                                        onClick={() => setAddCompanyOpen(true)}
                                        className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/15 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-600/25"
                                    >
                                        <Plus className="h-3 w-3" />
                                        添加企业
                                    </button>
                                )}
                            </div>
                            {loading ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
                                </div>
                            ) : companies.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-blue-900/30 py-8 text-center text-xs text-slate-600">
                                    暂无受检企业
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {companies.map((c) => {
                                        const co = pickCheckCompany(c);
                                        const experts = pickUsers(c);
                                        const ds = dangers.filter(
                                            (d) =>
                                                d.check_company_id ===
                                                c.check_company_id,
                                        );
                                        const isExpertOnRow =
                                            userId !== null &&
                                            experts.some(
                                                (u) =>
                                                    u.expert_user_id === userId,
                                            );
                                        const canAddDanger =
                                            isActive(inspection) &&
                                            (canEdit || isExpertOnRow);

                                        const canDownloadNoticeRow =
                                            Boolean(c.inspection_notice_url) &&
                                            (isPlanOwner || isExpertOnRow);
                                        const canGenerateSheetRow =
                                            isPlanOwner || isExpertOnRow;

                                        return (
                                            <div
                                                key={c.id}
                                                className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#070d1f]"
                                            >
                                                <div className="flex items-center gap-2 border-b border-blue-900/20 bg-blue-950/25 px-3 py-2">
                                                    <Users className="h-4 w-4 shrink-0 text-blue-400" />
                                                    <p className="truncate text-sm font-medium text-slate-200">
                                                        {co?.title ??
                                                            `企业#${c.check_company_id}`}
                                                    </p>
                                                    {c.confirm_time ? (
                                                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-600/10 px-1.5 text-[10px] text-emerald-400">
                                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                                            已确认
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-600/10 px-1.5 text-[10px] text-amber-400">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            待确认
                                                        </span>
                                                    )}
                                                    <div className="ml-auto flex items-center gap-0.5">
                                                        {isPlanOwner && (
                                                            <button
                                                                onClick={() =>
                                                                    generateNotice(
                                                                        c,
                                                                    )
                                                                }
                                                                disabled={
                                                                    generatingNotice ===
                                                                    c.id
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-blue-400 transition-colors hover:bg-blue-600/15 disabled:opacity-50"
                                                                title={
                                                                    c.inspection_notice_url
                                                                        ? '重新生成通知单'
                                                                        : '生成通知单'
                                                                }
                                                            >
                                                                {generatingNotice ===
                                                                c.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <FileDown className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                        {canDownloadNoticeRow && (
                                                            <button
                                                                onClick={() =>
                                                                    downloadNotice(
                                                                        c,
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-400 transition-colors hover:bg-emerald-600/15"
                                                                title="下载通知单"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        {canGenerateSheetRow && (
                                                            <button
                                                                onClick={() =>
                                                                    generateSheet(
                                                                        c,
                                                                    )
                                                                }
                                                                disabled={
                                                                    generatingSheet ===
                                                                    c.id
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-amber-400 transition-colors hover:bg-amber-600/15 disabled:opacity-50"
                                                                title={
                                                                    c.rectification_sheet_url
                                                                        ? '重新生成整改单'
                                                                        : '生成整改单'
                                                                }
                                                            >
                                                                {generatingSheet ===
                                                                c.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <FileSpreadsheet className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                        {c.rectification_sheet_url && (
                                                            <button
                                                                onClick={() =>
                                                                    downloadSheet(
                                                                        c,
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-violet-400 transition-colors hover:bg-violet-600/15"
                                                                title="下载整改单"
                                                            >
                                                                <FileCheck className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        {canEdit && (
                                                            <button
                                                                onClick={() =>
                                                                    removeCompany(
                                                                        c,
                                                                    )
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-600/15 hover:text-red-400"
                                                                title="删除受检企业"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 p-3">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            通知{' '}
                                                            {c.notify_company_time ??
                                                                '—'}
                                                        </span>
                                                        <span className="text-slate-700">
                                                            ·
                                                        </span>
                                                        <span>
                                                            检查{' '}
                                                            {c.check_company_time ??
                                                                '—'}
                                                        </span>
                                                        {c.confirm_time && (
                                                            <>
                                                                <span className="text-slate-700">
                                                                    ·
                                                                </span>
                                                                <span className="text-emerald-500/80">
                                                                    确认{' '}
                                                                    {
                                                                        c.confirm_time
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="text-[11px] text-slate-600">
                                                            专家：
                                                        </span>
                                                        {experts.length ===
                                                            0 && (
                                                            <span className="text-[11px] text-slate-700">
                                                                暂无
                                                            </span>
                                                        )}
                                                        {experts.map((u) => {
                                                            const user =
                                                                pickExpertUser(
                                                                    u,
                                                                );

                                                            return (
                                                                <span
                                                                    key={u.id}
                                                                    className="group inline-flex items-center gap-1 rounded-md border border-blue-900/40 bg-blue-600/5 px-2 py-0.5 text-[11px] text-slate-300"
                                                                >
                                                                    {user?.nickname ??
                                                                        `专家#${u.expert_user_id}`}
                                                                    {u.confirm_time ? (
                                                                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                                                                    ) : (
                                                                        <Clock className="h-2.5 w-2.5 text-amber-400" />
                                                                    )}
                                                                    {canEdit && (
                                                                        <button
                                                                            onClick={() =>
                                                                                removeExpert(
                                                                                    u,
                                                                                )
                                                                            }
                                                                            className="ml-0.5 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                                                                        >
                                                                            <X className="h-2.5 w-2.5" />
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            );
                                                        })}
                                                        {canEdit && (
                                                            <button
                                                                onClick={() =>
                                                                    setAddExpertFor(
                                                                        c,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 rounded-md border border-dashed border-blue-900/50 px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:border-blue-500/40 hover:text-blue-300"
                                                                title="指派专家"
                                                            >
                                                                <UserCheck className="h-2.5 w-2.5" />
                                                                指派
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="mb-1.5 flex items-center justify-between">
                                                            <span className="text-[11px] text-slate-600">
                                                                现场隐患{' '}
                                                                <span className="text-slate-500">
                                                                    ({ds.length}
                                                                    )
                                                                </span>
                                                            </span>
                                                            {canAddDanger && (
                                                                <button
                                                                    onClick={() =>
                                                                        setAddDangerFor(
                                                                            c,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-600/10 px-2 py-0.5 text-[10px] text-amber-400 transition-colors hover:bg-amber-600/20"
                                                                >
                                                                    <AlertTriangle className="h-2.5 w-2.5" />
                                                                    登记隐患
                                                                </button>
                                                            )}
                                                        </div>
                                                        {ds.length === 0 ? (
                                                            <p className="rounded border border-dashed border-blue-900/30 py-2 text-center text-[11px] text-slate-700">
                                                                暂无隐患
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-1.5">
                                                                {ds.map((d) => {
                                                                    const status =
                                                                        dangerStatusLabel(
                                                                            d,
                                                                        );
                                                                    const isArchived =
                                                                        d.invest_status ===
                                                                        2;
                                                                    const isConfirmed =
                                                                        d.correct_status ===
                                                                            3 ||
                                                                        Boolean(
                                                                            d.review_time,
                                                                        );
                                                                    const isRectified =
                                                                        d.correct_status ===
                                                                        2;
                                                                    const isPending =
                                                                        d.correct_status ===
                                                                        1;
                                                                    // 受检企业本人或指派专家均可提交整改。
                                                                    const canRectify =
                                                                        isPending &&
                                                                        (d.check_company_id ===
                                                                            rootCompanyId ||
                                                                            isExpertOnRow);

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                d.id
                                                                            }
                                                                            onClick={() =>
                                                                                setViewingDanger(
                                                                                    d,
                                                                                )
                                                                            }
                                                                            className="group cursor-pointer rounded-md border border-blue-900/20 bg-[#0d1530] px-2.5 py-2 text-[11px] transition-colors hover:border-blue-500/40 hover:bg-blue-950/40"
                                                                        >
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                <span className="rounded border border-blue-900/40 bg-blue-600/8 px-1.5 py-0 text-[10px] text-blue-400">
                                                                                    {
                                                                                        d.hidden_type
                                                                                    }
                                                                                </span>
                                                                                <span
                                                                                    className={cn(
                                                                                        'rounded border px-1.5 py-0 text-[10px]',
                                                                                        d.hidden_level ===
                                                                                            '重大隐患'
                                                                                            ? 'border-red-500/30 bg-red-600/10 text-red-400'
                                                                                            : 'border-blue-500/30 bg-blue-600/10 text-blue-400',
                                                                                    )}
                                                                                >
                                                                                    {
                                                                                        d.hidden_level
                                                                                    }
                                                                                </span>
                                                                                <span className="text-slate-500">
                                                                                    {
                                                                                        d.area
                                                                                    }
                                                                                </span>
                                                                                <span
                                                                                    className={cn(
                                                                                        'ml-auto rounded border px-1.5 py-0 text-[10px]',
                                                                                        status.cls,
                                                                                    )}
                                                                                >
                                                                                    {
                                                                                        status.text
                                                                                    }
                                                                                </span>
                                                                                <Eye className="h-3 w-3 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
                                                                            </div>
                                                                            <p
                                                                                className="mt-1 line-clamp-2 text-slate-400"
                                                                                title={
                                                                                    d.description
                                                                                }
                                                                            >
                                                                                {
                                                                                    d.description
                                                                                }
                                                                            </p>
                                                                            {(isRectified ||
                                                                                isConfirmed) &&
                                                                                d.review_description && (
                                                                                    <p className="mt-1 text-[10px] text-slate-500">
                                                                                        <span className="text-slate-600">
                                                                                            整改：
                                                                                        </span>
                                                                                        {
                                                                                            d.review_description
                                                                                        }
                                                                                        {d.correct_date && (
                                                                                            <span className="ml-1 text-slate-700">
                                                                                                ·{' '}
                                                                                                {
                                                                                                    d.correct_date
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                    </p>
                                                                                )}
                                                                            {!isArchived &&
                                                                                (canRectify ||
                                                                                    isRectified ||
                                                                                    (isConfirmed &&
                                                                                        isPlanOwner)) && (
                                                                                    <div
                                                                                        className="mt-1.5 flex items-center gap-1"
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) =>
                                                                                            e.stopPropagation()
                                                                                        }
                                                                                    >
                                                                                        {canRectify && (
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    setRectifyFor(
                                                                                                        d,
                                                                                                    )
                                                                                                }
                                                                                                className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/10 px-2 py-0.5 text-[10px] text-blue-300 hover:bg-blue-600/20"
                                                                                            >
                                                                                                <Wrench className="h-2.5 w-2.5" />
                                                                                                提交整改
                                                                                            </button>
                                                                                        )}
                                                                                        {isRectified &&
                                                                                            !isConfirmed && (
                                                                                                <button
                                                                                                    onClick={() =>
                                                                                                        setConfirmFor(
                                                                                                            d,
                                                                                                        )
                                                                                                    }
                                                                                                    className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-400 hover:bg-emerald-600/20"
                                                                                                >
                                                                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                                                                    整改确认
                                                                                                </button>
                                                                                            )}
                                                                                        {isConfirmed &&
                                                                                            isPlanOwner && (
                                                                                                <button
                                                                                                    onClick={() =>
                                                                                                        archiveDanger(
                                                                                                            d,
                                                                                                        )
                                                                                                    }
                                                                                                    disabled={
                                                                                                        archiving ===
                                                                                                        d.id
                                                                                                    }
                                                                                                    className="flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-600/10 px-2 py-0.5 text-[10px] text-violet-300 hover:bg-violet-600/20 disabled:opacity-50"
                                                                                                >
                                                                                                    {archiving ===
                                                                                                    d.id ? (
                                                                                                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                                                                    ) : (
                                                                                                        <Archive className="h-2.5 w-2.5" />
                                                                                                    )}
                                                                                                    确认归档
                                                                                                </button>
                                                                                            )}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <AddCompanyModal
                open={addCompanyOpen}
                onClose={() => setAddCompanyOpen(false)}
                inspection={inspection}
                rootCompanyId={rootCompanyId}
                onSaved={() => {
                    setAddCompanyOpen(false);
                    refresh();
                    onChanged();
                }}
            />
            <AddExpertModal
                open={addExpertFor !== null}
                onClose={() => setAddExpertFor(null)}
                expertCompany={addExpertFor}
                rootCompanyId={rootCompanyId}
                onSaved={() => {
                    setAddExpertFor(null);
                    refresh();
                }}
            />
            <DangerModal
                open={addDangerFor !== null}
                onClose={() => setAddDangerFor(null)}
                expertCompany={addDangerFor}
                inspectionId={inspection.id}
                rootCompanyId={rootCompanyId}
                onSaved={() => {
                    setAddDangerFor(null);
                    refresh();
                }}
            />
            <RectifyModal
                open={rectifyFor !== null}
                danger={rectifyFor}
                onClose={() => setRectifyFor(null)}
                onSaved={() => {
                    setRectifyFor(null);
                    refresh();
                }}
            />
            <ConfirmRectificationModal
                open={confirmFor !== null}
                danger={confirmFor}
                onClose={() => setConfirmFor(null)}
                onSaved={() => {
                    setConfirmFor(null);
                    refresh();
                }}
            />
            <DangerDetailsModal
                danger={viewingDanger}
                onClose={() => setViewingDanger(null)}
            />
        </>
    );
}
