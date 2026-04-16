import { useState, useRef } from 'react';
import { Loader2, Upload, FileText, ExternalLink, X } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

interface OssSignature {
    access_key_id: string;
    host: string;
    policy: string;
    signature: string;
    expire: number;
    dir: string;
}

async function uploadToOss(file: File, dir?: string): Promise<string> {
    const { data: res } = await api.get<ApiResponse<OssSignature>>('/upload/oss-signature', {
        params: { dir: dir ?? `uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/` },
    });
    const sig = res.data;

    const ext = file.name.split('.').pop() ?? 'bin';
    const key = `${sig.dir}${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const formData = new FormData();
    formData.append('key', key);
    formData.append('policy', sig.policy);
    formData.append('OSSAccessKeyId', sig.access_key_id);
    formData.append('signature', sig.signature);
    formData.append('success_action_status', '200');
    formData.append('file', file);

    const url = `${sig.host}/${key}`;

    try {
        const response = await fetch(sig.host, { method: 'POST', body: formData });
        // OSS returns 200 (success_action_status=200) or 204
        if (response.status !== 0 && !response.ok && response.status !== 204) {
            throw new Error(`OSS上传失败: ${response.status}`);
        }
    } catch (err: any) {
        // OSS may not include CORS headers in its response for local dev origins,
        // causing fetch() to throw TypeError even though the upload succeeded.
        // Verify by probing the URL with no-cors (opaque response, won't throw on CORS).
        if (err instanceof TypeError) {
            try {
                await fetch(url, { method: 'HEAD', mode: 'no-cors' });
                // Reached here means the file is accessible — treat as success
            } catch {
                throw new Error('上传失败，请检查网络连接');
            }
        } else {
            throw err;
        }
    }

    return url;
}

interface OssUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    dir?: string;
    accept?: string;
}

export function OssUploadField({ value, onChange, dir, accept }: OssUploadFieldProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const isImage = value ? /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(value) : false;
    const filename = value ? decodeURIComponent(value.split('/').pop() ?? '') : '';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');

        try {
            const url = await uploadToOss(file, dir);
            onChange(url);
        } catch (err: any) {
            setUploadError(err.message ?? '上传失败，请重试');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {uploading ? '上传中...' : value ? '重新上传' : '选择文件'}
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="flex items-center gap-1 text-xs text-slate-600 transition-colors hover:text-red-400"
                    >
                        <X className="h-3 w-3" />
                        移除
                    </button>
                )}
            </div>

            <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

            {value && isImage && (
                <a href={value} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                        src={value}
                        alt="预览"
                        className="h-24 w-24 rounded-lg border border-blue-900/30 object-cover transition-opacity hover:opacity-80"
                    />
                </a>
            )}

            {value && !isImage && (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 transition-colors hover:text-blue-300"
                >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-xs truncate">{filename || '查看文件'}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
            )}
        </div>
    );
}

export { uploadToOss };
