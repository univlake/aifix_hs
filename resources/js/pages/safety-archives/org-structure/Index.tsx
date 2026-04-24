import { Head } from '@inertiajs/react';
import { Loader2, ImageIcon, Save, Pencil, X, Upload } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse } from '@/types/models';

interface SafetyArchitecture {
    id: number;
    annex_url: string | null;
    signed_annex_url?: string | null;
    thumbnail_url: string | null;
    company_id: number;
}

export default function OrgStructureIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;
    const { canWrite } = usePermission();
    const canCreate = canWrite('safety-architectures.create');
    const canUpdate = canWrite('safety-architectures.update');

    const [record, setRecord] = useState<SafetyArchitecture | null>(null);
    const [annexUrl, setAnnexUrl] = useState('');
    const [displayUrl, setDisplayUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const fetchRecord = useCallback(async () => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: res } = await api.get<
                ApiResponse<SafetyArchitecture | null>
            >('/safety-architectures', {
                params: { company_id: companyId },
            });
            const rec = res.data;
            setRecord(rec ?? null);
            setAnnexUrl(rec?.annex_url ?? '');
            setDisplayUrl(rec?.signed_annex_url ?? rec?.annex_url ?? '');
            setIsEditing(false);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '加载失败'));
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    const handleSave = async () => {
        if (!companyId) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload = { annex_url: annexUrl, company_id: companyId };

            if (record?.id) {
                await api.put(`/safety-architectures/${record.id}`, payload);
            } else {
                await api.post<ApiResponse<SafetyArchitecture>>(
                    '/safety-architectures',
                    payload,
                );
            }

            setSaved(true);
            setIsEditing(false);
            await fetchRecord();
            setTimeout(() => setSaved(false), 2500);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '保存失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setAnnexUrl(record?.annex_url ?? '');
        setError('');
        setIsEditing(false);
    };

    const hasRecord = record !== null && !!record.annex_url;
    const isViewMode = hasRecord && !isEditing;
    const isUploadMode = !hasRecord || isEditing;
    const canEdit = hasRecord ? canUpdate : canCreate;

    const isImage = (url: string) =>
        /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url);

    return (
        <>
            <Head title="安全生产组织架构" />

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        安全生产组织架构
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        上传并管理企业安全生产组织架构图
                    </p>
                </div>

                {!loading && (
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                                取消
                            </button>
                        )}

                        {isViewMode
                            ? canUpdate && (
                                  <button
                                      onClick={() => setIsEditing(true)}
                                      className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25"
                                  >
                                      <Pencil className="h-4 w-4" />
                                      编辑
                                  </button>
                              )
                            : canEdit && (
                                  <button
                                      onClick={handleSave}
                                      disabled={saving}
                                      className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
                                  >
                                      {saving ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : saved ? (
                                          <Save className="h-4 w-4" />
                                      ) : isEditing ? (
                                          <Save className="h-4 w-4" />
                                      ) : (
                                          <Upload className="h-4 w-4" />
                                      )}
                                      {saving
                                          ? '保存中...'
                                          : saved
                                            ? '已保存 ✓'
                                            : isEditing
                                              ? '保存'
                                              : '上传并保存'}
                                  </button>
                              )}
                    </div>
                )}
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
                    {/* Upload control — shown when no record yet, or when editing */}
                    {isUploadMode && (
                        <div className="rounded-xl border border-blue-900/30 bg-[#0d1530] p-4">
                            <p className="mb-3 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                {isEditing ? '替换架构图文件' : '架构图文件'}
                            </p>
                            <OssUploadField
                                value={annexUrl}
                                onChange={(url, signedUrl) => {
                                    setAnnexUrl(url);
                                    setDisplayUrl(signedUrl ?? url);
                                }}
                                accept="image/*,.pdf"
                                dir="safety-architecture/"
                                displayValue={displayUrl}
                            />
                        </div>
                    )}

                    {/* Preview — always shown when a URL exists */}
                    {displayUrl ? (
                        isImage(displayUrl) ? (
                            <div className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#070d1f]">
                                <div className="border-b border-blue-900/20 px-4 py-2.5">
                                    <p className="text-xs text-slate-500">
                                        架构图预览
                                    </p>
                                </div>
                                <div className="p-4">
                                    <img
                                        src={displayUrl}
                                        alt="安全生产组织架构图"
                                        className="w-full rounded-lg object-contain"
                                        style={{ maxHeight: '80vh' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center rounded-xl border border-blue-900/30 bg-[#070d1f] p-12">
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <ImageIcon className="h-10 w-10 opacity-60" />
                                    <AttachmentViewer
                                        url={annexUrl || displayUrl}
                                        label="点击查看文件"
                                        className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                                    />
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-blue-900/40 bg-[#070d1f]">
                            <ImageIcon className="h-10 w-10 text-slate-700" />
                            <p className="text-sm text-slate-600">
                                暂无架构图，请上传图片或 PDF 文件
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
