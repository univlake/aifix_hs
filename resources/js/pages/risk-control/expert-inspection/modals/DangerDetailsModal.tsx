import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { cn } from '@/lib/utils';
import {
    Modal,
    ModalHeader,
    dangerStatusLabel,
    pickExamineAnnex,
    pickRectifyAnnex,
    pickReviewAnnex,
} from '../components';
import type { AnnexItem, HiddenDanger } from '../types';

function AnnexTile({ item }: { item: AnnexItem }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group relative block overflow-hidden rounded-md border border-blue-900/30 bg-[#070d1f] text-left hover:border-blue-500/40"
                title={item.geolocation ?? undefined}
            >
                <div className="flex h-24 w-full flex-col items-center justify-center gap-1 px-2 text-[10px] text-slate-500">
                    <ImageIcon className="h-5 w-5 text-slate-600" />
                    <span className="w-full truncate text-center">
                        {item.annex_url.split('/').pop() ?? '附件'}
                    </span>
                </div>
                {item.geolocation && (
                    <span className="absolute right-0 bottom-0 left-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-slate-300">
                        📍 {item.geolocation}
                    </span>
                )}
            </button>
            <AttachmentViewer
                url={item.annex_url}
                headless
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}

function AnnexGallery({ items }: { items: AnnexItem[] }) {
    if (items.length === 0) {
        return (
            <p className="rounded border border-dashed border-blue-900/30 py-3 text-center text-[11px] text-slate-700">
                暂无附件
            </p>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-2">
            {items.map((a, i) => (
                <AnnexTile key={a.id ?? i} item={a} />
            ))}
        </div>
    );
}

export function DangerDetailsModal({
    danger,
    onClose,
}: {
    danger: HiddenDanger | null;
    onClose: () => void;
}) {
    if (!danger) {
        return null;
    }

    const status = dangerStatusLabel(danger);
    const examineAnnex = pickExamineAnnex(danger);
    const rectifyAnnex = pickRectifyAnnex(danger);
    const reviewAnnex = pickReviewAnnex(danger);

    return (
        <Modal open={true} onClose={onClose} size="lg">
            <ModalHeader
                title="隐患详情"
                subtitle={`${danger.hidden_type} · ${danger.area}`}
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-blue-900/40 bg-blue-600/10 px-2 py-0.5 text-[11px] text-blue-400">
                            {danger.hidden_type}
                        </span>
                        <span
                            className={cn(
                                'rounded border px-2 py-0.5 text-[11px]',
                                danger.hidden_level === '重大隐患'
                                    ? 'border-red-500/30 bg-red-600/10 text-red-400'
                                    : 'border-blue-500/30 bg-blue-600/10 text-blue-400',
                            )}
                        >
                            {danger.hidden_level}
                        </span>
                        <span
                            className={cn(
                                'rounded border px-2 py-0.5 text-[11px]',
                                status.cls,
                            )}
                        >
                            {status.text}
                        </span>
                        {danger.session && (
                            <span className="rounded border border-blue-900/40 bg-[#070d1f] px-2 py-0.5 text-[11px] text-slate-400">
                                第 {danger.session}
                            </span>
                        )}
                    </div>

                    <section className="rounded-lg border border-blue-900/30 bg-[#070d1f] px-4 py-3">
                        <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                            隐患描述
                        </p>
                        <p className="text-sm whitespace-pre-wrap text-slate-200">
                            {danger.description}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-500">
                            场所：{danger.area}
                        </p>
                    </section>

                    <section>
                        <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                            排查信息
                        </p>
                        <div className="space-y-3 rounded-lg border border-blue-900/30 bg-[#070d1f] px-4 py-3">
                            {danger.correct_deadline && (
                                <div className="text-[11px] text-slate-400">
                                    <span className="text-slate-600">
                                        整改期限：
                                    </span>
                                    {danger.correct_deadline}
                                </div>
                            )}
                            {danger.legalises && (
                                <div>
                                    <p className="mb-0.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                        排查依据
                                    </p>
                                    <p className="text-xs whitespace-pre-wrap text-slate-300">
                                        {danger.legalises}
                                    </p>
                                </div>
                            )}
                            {danger.proposal && (
                                <div>
                                    <p className="mb-0.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                        整改建议
                                    </p>
                                    <p className="text-xs whitespace-pre-wrap text-slate-300">
                                        {danger.proposal}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                    排查附件
                                </p>
                                <AnnexGallery items={examineAnnex} />
                            </div>
                        </div>
                    </section>

                    {(danger.correct_date ||
                        danger.review_description ||
                        rectifyAnnex.length > 0) && (
                        <section>
                            <p className="mb-2 text-[10px] font-semibold tracking-wider text-emerald-400/80 uppercase">
                                整改情况
                            </p>
                            <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-600/5 px-4 py-3">
                                {danger.correct_date && (
                                    <div className="text-[11px] text-slate-400">
                                        <span className="text-slate-600">
                                            整改日期：
                                        </span>
                                        {danger.correct_date}
                                    </div>
                                )}
                                {danger.review_description && (
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                            整改描述
                                        </p>
                                        <p className="text-xs whitespace-pre-wrap text-slate-300">
                                            {danger.review_description}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                        整改附件
                                    </p>
                                    <AnnexGallery items={rectifyAnnex} />
                                </div>
                            </div>
                        </section>
                    )}

                    {(danger.review_time || reviewAnnex.length > 0) && (
                        <section>
                            <p className="mb-2 text-[10px] font-semibold tracking-wider text-violet-400/80 uppercase">
                                确认复查
                            </p>
                            <div className="space-y-3 rounded-lg border border-violet-500/20 bg-violet-600/5 px-4 py-3">
                                {danger.review_time && (
                                    <div className="text-[11px] text-slate-400">
                                        <span className="text-slate-600">
                                            确认时间：
                                        </span>
                                        {danger.review_time}
                                    </div>
                                )}
                                <div>
                                    <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                        复查附件
                                    </p>
                                    <AnnexGallery items={reviewAnnex} />
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-end border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    关闭
                </button>
            </div>
        </Modal>
    );
}
