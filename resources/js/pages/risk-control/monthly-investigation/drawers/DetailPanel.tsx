import { ChevronRight } from 'lucide-react';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';
import { DetailField } from '../components';
import type { Investigation } from '../types';

export function DetailPanel({
    row,
    onClose,
}: {
    row: Investigation;
    onClose: () => void;
}) {
    const reviews =
        row.monthlyInvestigationReviews ??
        row.monthly_investigation_reviews ??
        [];
    const views =
        row.monthlyInvestigationViews ?? row.monthly_investigation_views ?? [];

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-100">
                        隐患详情
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                    <div>
                        <p className="text-xs text-slate-600">企业</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-200">
                            {row.company?.title ?? '—'}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            基本信息
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailField label="隐患类型" value={row.type} />
                            <DetailField label="隐患等级" value={row.level} />
                            <DetailField
                                label="排查时间"
                                value={row.inv_time}
                            />
                            <DetailField label="排查人" value={row.inv_name} />
                            <div className="col-span-2">
                                <p className="text-xs text-slate-600">
                                    消防/应急
                                </p>
                                <p className="mt-0.5 text-sm text-slate-300">
                                    {[
                                        row.is_fire_fighting
                                            ? '消防排查'
                                            : null,
                                        row.is_emergency ? '应急排查' : null,
                                    ]
                                        .filter(Boolean)
                                        .join('、') || '—'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-slate-600">
                                    隐患描述
                                </p>
                                <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                                    {row.content || '—'}
                                </p>
                            </div>
                            {row.legalbasis && (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-600">
                                        法律依据
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        {row.legalbasis}
                                    </p>
                                </div>
                            )}
                            {row.proposal && (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-600">
                                        整改建议
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        {row.proposal}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            整改情况
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailField
                                label="整改日期"
                                value={row.correct_date}
                            />
                            <DetailField
                                label="整改结果"
                                value={row.correct_result}
                            />
                        </div>
                    </div>

                    {(row.review_user ||
                        row.review_date ||
                        row.review_content) && (
                        <div>
                            <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                复查信息
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <DetailField
                                    label="复查人"
                                    value={row.review_user}
                                />
                                <DetailField
                                    label="复查日期"
                                    value={row.review_date}
                                />
                                {row.review_discription && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-600">
                                            复查说明
                                        </p>
                                        <p className="mt-0.5 text-sm text-slate-400">
                                            {row.review_discription}
                                        </p>
                                    </div>
                                )}
                                {row.review_content && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-600">
                                            复查结果描述
                                        </p>
                                        <p className="mt-0.5 text-sm text-slate-400">
                                            {row.review_content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(reviews.length > 0 || views.length > 0) && (
                        <div>
                            <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                                附件
                            </p>
                            {views.length > 0 && (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs text-slate-600">
                                        隐患证据(图片)
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {views.map((a, i) => (
                                            <OssDownloadLink
                                                key={a.id ?? i}
                                                url={a.annex_url}
                                                label="查看"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {reviews.length > 0 && (
                                <div>
                                    <p className="mb-1 text-xs text-slate-600">
                                        复查附件
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {reviews.map((a, i) => (
                                            <OssDownloadLink
                                                key={a.id ?? i}
                                                url={a.annex_url}
                                                label="查看"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
