import { Download, FileText, Loader2, Send, X } from 'lucide-react';
import { useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { uploadToOss } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';
import { fileNameOf, inputCls, NORM_TYPES } from '../types';

export function NormScoringModal({
    companyId,
    companyName,
    year,
    onClose,
    onSaved,
}: {
    companyId: number;
    companyName: string;
    year: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [type, setType] = useState<string>(NORM_TYPES[0]);
    const [number, setNumber] = useState<string>('0');
    const [path, setPath] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);

        try {
            const url = await uploadToOss(
                file,
                `uploads/norm-checks/${companyId}/${year}/`,
            );
            setPath(url);
        } catch (e) {
            const err = e as { message?: string };
            setError(err.message ?? '上传失败');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        setTemplateLoading(true);
        setError(null);

        try {
            const res = await api.get<
                ApiResponse<{ url: string; type: string }>
            >('/norm-checks/template-link', {
                params: { type },
            });
            const url = res.data.data?.url;

            if (!url) {
                throw new Error('模板地址为空');
            }

            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.download = url.split('/').pop() ?? '考核表模板';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(
                err.response?.data?.message ?? err.message ?? '下载模板失败',
            );
        } finally {
            setTemplateLoading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        setError(null);

        try {
            await api.post('/norm-checks/save-score', {
                company_id: companyId,
                year,
                type,
                number: Number(number) || 0,
                path: path || null,
            });
            onSaved();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '保存失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        {companyName} · {year}{' '}
                        年大中型企业安全生产标准化管理体系构建
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="space-y-3">
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 flex items-center justify-between">
                            <span>企业类型</span>
                            <button
                                type="button"
                                onClick={downloadTemplate}
                                disabled={templateLoading}
                                className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/10 px-2 py-0.5 text-[11px] text-blue-300 transition-colors hover:bg-blue-600/20 disabled:opacity-40"
                            >
                                {templateLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Download className="h-3 w-3" />
                                )}
                                下载考核表模板
                            </button>
                        </span>
                        <select
                            className={cn(inputCls, 'w-full')}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            {NORM_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 block">原始分（0 - 100）</span>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            className={cn(inputCls, 'w-full')}
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </label>
                    <div>
                        <p className="mb-1 text-xs text-slate-400">
                            打分表上传
                        </p>
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200">
                            {uploading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <FileText className="h-3 w-3" />
                            )}
                            {uploading
                                ? '上传中...'
                                : path
                                  ? '重新上传'
                                  : '上传文件'}
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];

                                    if (f) {
                                        upload(f);
                                    }

                                    e.currentTarget.value = '';
                                }}
                                disabled={uploading}
                            />
                        </label>
                        {path && (
                            <div className="mt-1 flex items-center gap-2 text-xs">
                                <span className="truncate text-slate-300">
                                    {fileNameOf(path)}
                                </span>
                                <AttachmentViewer
                                    url={path}
                                    filename={fileNameOf(path)}
                                    label="查看"
                                    className="shrink-0 text-blue-400 hover:text-blue-300"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || uploading}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        保存评分
                    </button>
                </footer>
            </div>
        </div>
    );
}
