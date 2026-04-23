import { CheckCircle2, Clock, Loader2, Plus, Trash2, X } from 'lucide-react';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';
import {
    CONFIG,
    fmt,
    isDone,
    type NoticeRow,
    type NoticeScopeRow,
    type NoticeVariant,
} from '../types';

interface ScopeDrawerProps {
    variant: NoticeVariant;
    notice: NoticeRow;
    scopes: NoticeScopeRow[];
    loading: boolean;
    doneCount: number;
    pendingCount: number;
    onClose: () => void;
    onAdd: () => void;
    onRemove: (s: NoticeScopeRow) => void | Promise<void>;
}

export function ScopeDrawer({
    variant,
    notice,
    scopes,
    loading,
    doneCount,
    pendingCount,
    onClose,
    onAdd,
    onRemove,
}: ScopeDrawerProps) {
    const config = CONFIG[variant];

    return (
        <div
            className="fixed inset-0 z-40 flex justify-end bg-black/40"
            onClick={onClose}
        >
            <aside
                className="h-full w-full max-w-3xl overflow-y-auto border-l border-blue-900/40 bg-[#050915] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">
                            {notice.name ?? '通知详情'}
                        </h2>
                        {notice.comment && (
                            <p className="mt-1 text-xs text-slate-400">
                                {notice.comment}
                            </p>
                        )}
                        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                            <div>
                                <dt className="inline text-slate-500">
                                    通知人：
                                </dt>
                                <dd className="inline">
                                    {notice.alert_others ?? '—'}
                                </dd>
                            </div>
                            {config.hasFeedback && (
                                <div>
                                    <dt className="inline text-slate-500">
                                        反馈截止：
                                    </dt>
                                    <dd className="inline">
                                        {fmt(notice.feedback_time)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 p-1 text-slate-400 hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {loading && (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                )}

                {!loading && (
                    <section>
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                                    {config.hasFeedback ? '待反馈' : '未读'}{' '}
                                    {pendingCount}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    {config.hasFeedback ? '已反馈' : '已读'}{' '}
                                    {doneCount}
                                </span>
                            </div>
                            <button
                                onClick={onAdd}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                添加企业
                            </button>
                        </div>
                        {scopes.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">
                                尚未添加通知企业
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {scopes.map((s) => {
                                    const done = isDone(variant, s);

                                    return (
                                        <li
                                            key={s.id}
                                            className="flex items-center gap-3 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm text-slate-200">
                                                    {s.company_name ??
                                                        `企业 #${s.company_id}`}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                                    {done ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-400">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            {config.hasFeedback
                                                                ? `已反馈 ${fmt(s.feedback_time)}`
                                                                : `已读 ${fmt(s.read_time)}`}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-400">
                                                            <Clock className="h-3 w-3" />
                                                            {config.hasFeedback
                                                                ? '待反馈'
                                                                : '未读'}
                                                        </span>
                                                    )}
                                                    {config.hasFeedback &&
                                                        s.feedback_annex_url && (
                                                            <OssDownloadLink
                                                                url={
                                                                    s.feedback_annex_url
                                                                }
                                                                label="反馈附件"
                                                            />
                                                        )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onRemove(s)}
                                                className="rounded border border-red-500/30 bg-red-600/10 p-1 text-red-400 transition-colors hover:bg-red-600/20"
                                                title="移除"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}
            </aside>
        </div>
    );
}
