import {
    Loader2,
    ExternalLink,
    X,
    Download,
    FileText,
    FileSpreadsheet,
    Presentation,
    File as FileIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

type FileKind = 'image' | 'pdf' | 'video' | 'office' | 'other';

interface AttachmentViewerProps {
    /** Raw OSS URL as stored on the record. */
    url: string;
    /** Optional display name; falls back to the basename of `url`. */
    filename?: string;
    /** Trigger button label. */
    label?: string;
    /** Trigger button class override. */
    className?: string;
    /** If true, renders no trigger — caller controls open state via `open`/`onClose`. */
    headless?: boolean;
    open?: boolean;
    onClose?: () => void;
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'm4v', 'ogg', 'ogv'];
const OFFICE_EXTS = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'];

function fileKind(url: string): FileKind {
    const ext = (url.split('?')[0].split('.').pop() ?? '').toLowerCase();

    if (IMAGE_EXTS.includes(ext)) {
        return 'image';
    }

    if (ext === 'pdf') {
        return 'pdf';
    }

    if (VIDEO_EXTS.includes(ext)) {
        return 'video';
    }

    if (OFFICE_EXTS.includes(ext)) {
        return 'office';
    }

    return 'other';
}

function officeIcon(url: string) {
    const ext = (url.split('?')[0].split('.').pop() ?? '').toLowerCase();

    if (['xlsx', 'xls', 'csv'].includes(ext)) {
        return <FileSpreadsheet className="h-10 w-10 text-emerald-400" />;
    }

    if (['pptx', 'ppt'].includes(ext)) {
        return <Presentation className="h-10 w-10 text-orange-400" />;
    }

    return <FileText className="h-10 w-10 text-blue-400" />;
}

function deriveFilename(url: string): string {
    try {
        const raw = url.split('?')[0].split('/').pop() ?? '';

        return decodeURIComponent(raw) || '附件';
    } catch {
        return '附件';
    }
}

async function fetchSignedUrl(
    rawUrl: string,
    opts: { download?: boolean; filename?: string } = {},
): Promise<string> {
    const params: Record<string, string> = { url: rawUrl };

    if (opts.download) {
        params.download = '1';

        if (opts.filename) {
            params.filename = opts.filename;
        }
    }

    const res = await api.get<ApiResponse<string>>('/upload/oss-sign', {
        params,
    });

    return res.data.data || rawUrl;
}

export function AttachmentViewer({
    url,
    filename,
    label = '查看',
    className,
    headless = false,
    open: openProp,
    onClose,
}: AttachmentViewerProps) {
    const controlled = headless;
    const [openInner, setOpenInner] = useState(false);
    const open = controlled ? !!openProp : openInner;
    const [loading, setLoading] = useState(false);
    const [signedUrl, setSignedUrl] = useState('');
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    const displayName = filename || deriveFilename(url);
    const kind = fileKind(url);

    const close = useCallback(() => {
        if (controlled) {
            onClose?.();
        } else {
            setOpenInner(false);
        }
    }, [controlled, onClose]);

    const openViewer = async () => {
        if (!url || loading) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const signed = await fetchSignedUrl(url);
            setSignedUrl(signed);

            if (!controlled) {
                setOpenInner(true);
            }
        } catch {
            setError('获取预览链接失败');
        } finally {
            setLoading(false);
        }
    };

    // In headless/controlled mode, fetch the signed URL as soon as we're asked to open.
    useEffect(() => {
        if (!controlled || !openProp || !url) {
            return;
        }

        if (signedUrl) {
            return;
        }

        setLoading(true);
        setError('');
        fetchSignedUrl(url)
            .then(setSignedUrl)
            .catch(() => setError('获取预览链接失败'))
            .finally(() => setLoading(false));
    }, [controlled, openProp, url, signedUrl]);

    // Reset when the underlying url changes so a different record re-signs.
    useEffect(() => {
        setSignedUrl('');
    }, [url]);

    // Lock body scroll while open.
    useEffect(() => {
        if (!open) {
            return;
        }

        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // Esc to close.
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    const handleDownload = async () => {
        if (downloading) {
            return;
        }

        setDownloading(true);

        try {
            const signed = await fetchSignedUrl(url, {
                download: true,
                filename: displayName,
            });
            const a = document.createElement('a');
            a.href = signed;
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch {
            setError('下载失败，请重试');
        } finally {
            setDownloading(false);
        }
    };

    const handleOpenInTab = async () => {
        const signed = signedUrl || (await fetchSignedUrl(url).catch(() => ''));

        if (signed) {
            window.open(signed, '_blank', 'noopener,noreferrer');
        }
    };

    if (!url && !headless) {
        return <span className="text-slate-700">—</span>;
    }

    const trigger = !headless && (
        <button
            type="button"
            onClick={openViewer}
            disabled={loading}
            className={
                className ??
                'inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-600/10 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:pointer-events-none disabled:opacity-50'
            }
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <ExternalLink className="h-3 w-3" />
            )}
            {label}
        </button>
    );

    return (
        <>
            {trigger}

            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={close}
                    />
                    <div
                        className={cn(
                            'relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl',
                            kind === 'image' ||
                                kind === 'pdf' ||
                                kind === 'video'
                                ? 'h-[85vh]'
                                : 'max-h-[85vh]',
                        )}
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-blue-900/30 px-5 py-3">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-100">
                                    {displayName}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={downloading || loading}
                                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5" />
                                    )}
                                    {downloading ? '下载中...' : '下载'}
                                </button>
                                <button
                                    type="button"
                                    onClick={close}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-900/30 hover:text-slate-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-[#070d1f]">
                            {loading && !signedUrl && (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                                </div>
                            )}

                            {!loading && error && (
                                <div className="flex h-full items-center justify-center p-8 text-center text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && signedUrl && (
                                <>
                                    {kind === 'image' && (
                                        <div className="flex h-full items-center justify-center p-4">
                                            <img
                                                src={signedUrl}
                                                alt={displayName}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    )}

                                    {kind === 'pdf' && (
                                        <iframe
                                            src={signedUrl}
                                            title={displayName}
                                            className="h-full w-full border-0"
                                        />
                                    )}

                                    {kind === 'video' && (
                                        <div className="flex h-full items-center justify-center bg-black p-2">
                                            <video
                                                src={signedUrl}
                                                controls
                                                controlsList="nodownload"
                                                className="max-h-full max-w-full"
                                            >
                                                <track kind="captions" />
                                            </video>
                                        </div>
                                    )}

                                    {(kind === 'office' || kind === 'other') && (
                                        <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-4 p-8">
                                            {kind === 'office' ? (
                                                officeIcon(url)
                                            ) : (
                                                <FileIcon className="h-10 w-10 text-slate-500" />
                                            )}
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-slate-200">
                                                    {displayName}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    浏览器无法直接预览此类文件
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleOpenInTab}
                                                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:text-slate-100"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    新标签页打开
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDownload}
                                                    disabled={downloading}
                                                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    {downloading ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Download className="h-3.5 w-3.5" />
                                                    )}
                                                    {downloading ? '下载中...' : '下载'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
