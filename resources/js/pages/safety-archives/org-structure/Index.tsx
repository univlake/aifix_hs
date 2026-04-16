import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { useScope } from '@/contexts/ScopeContext';
import { OssUploadField } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';
import { Loader2, ImageIcon, Save } from 'lucide-react';

interface SafetyArchitecture {
    id: number;
    annex_url: string | null;
    thumbnail_url: string | null;
    company_id: number;
}

export default function OrgStructureIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [record, setRecord] = useState<SafetyArchitecture | null>(null);
    const [annexUrl, setAnnexUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const fetchRecord = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError('');
        try {
            const { data: res } = await api.get<ApiResponse<SafetyArchitecture | null>>('/safety-architectures', {
                params: { company_id: companyId },
            });
            const rec = res.data;
            setRecord(rec ?? null);
            setAnnexUrl(rec?.annex_url ?? '');
        } catch (err: any) {
            setError(err.response?.data?.message ?? '加载失败');
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    const handleSave = async () => {
        if (!companyId) return;
        setSaving(true);
        setError('');
        try {
            const payload = { annex_url: annexUrl, company_id: companyId };
            if (record?.id) {
                await api.put(`/safety-architectures/${record.id}`, payload);
            } else {
                const { data: res } = await api.post<ApiResponse<SafetyArchitecture>>('/safety-architectures', payload);
                setRecord(res.data);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setError(err.response?.data?.message ?? '保存失败，请重试');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="安全生产组织架构" />

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">安全生产组织架构</h1>
                    <p className="mt-0.5 text-xs text-slate-600">上传并管理企业安全生产组织架构图</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? '保存中...' : saved ? '已保存 ✓' : '保存'}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Upload control */}
                    <div className="rounded-xl border border-blue-900/30 bg-[#0d1530] p-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                            架构图文件
                        </p>
                        <OssUploadField
                            value={annexUrl}
                            onChange={setAnnexUrl}
                            accept="image/*,.pdf"
                            dir="safety-architecture/"
                        />
                    </div>

                    {/* Full-size image preview */}
                    {annexUrl ? (
                        /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(annexUrl) ? (
                            <div className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#070d1f]">
                                <div className="border-b border-blue-900/20 px-4 py-2.5">
                                    <p className="text-xs text-slate-500">架构图预览</p>
                                </div>
                                <div className="p-4">
                                    <img
                                        src={annexUrl}
                                        alt="安全生产组织架构图"
                                        className="w-full rounded-lg object-contain"
                                        style={{ maxHeight: '80vh' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center rounded-xl border border-blue-900/30 bg-[#070d1f] p-12">
                                <a
                                    href={annexUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-3 text-blue-400 transition-colors hover:text-blue-300"
                                >
                                    <ImageIcon className="h-10 w-10 opacity-60" />
                                    <span className="text-sm">点击查看文件</span>
                                </a>
                            </div>
                        )
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-blue-900/40 bg-[#070d1f]">
                            <ImageIcon className="h-10 w-10 text-slate-700" />
                            <p className="text-sm text-slate-600">暂无架构图，请上传图片或 PDF 文件</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
