import { Loader2, Upload, FileVideo, X, Pause } from 'lucide-react';
import { useRef, useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

interface MultipartInit {
    upload_id: string;
    key: string;
    file_url: string;
}

interface MultipartSign {
    url: string;
}

interface MultipartComplete {
    file_url: string;
}

interface UploadedPart {
    PartNumber: number;
    ETag: string;
}

interface UploadRun {
    xhr: XMLHttpRequest | null;
    aborted: boolean;
}

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MiB
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GiB — OSS multipart limit
const MAX_PARALLEL = 3;

async function signPartUrl(
    key: string,
    uploadId: string,
    partNumber: number,
): Promise<string> {
    const { data: res } = await api.post<ApiResponse<MultipartSign>>(
        '/upload/multipart/sign-part',
        {
            key,
            upload_id: uploadId,
            part_number: partNumber,
        },
    );

    return res.data.url;
}

function putPart(
    url: string,
    blob: Blob,
    run: UploadRun,
    onProgress: (loaded: number) => void,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.timeout = 0; // no timeout for large chunks
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                onProgress(e.loaded);
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const etag =
                    xhr.getResponseHeader('ETag') ??
                    xhr.getResponseHeader('Etag');

                if (!etag) {
                    // OSS returned 2xx but ETag is unreadable — almost always
                    // missing `ETag` in the bucket's CORS ExposeHeader config.
                    console.error(
                        'OSS part upload succeeded but ETag header is not exposed.',
                        'Configure the bucket CORS rule to expose `ETag`.',
                        xhr.getAllResponseHeaders(),
                    );
                    reject(
                        new Error(
                            '分片响应缺少 ETag（请在 OSS Bucket CORS 中将 ETag 加入暴露 Header）',
                        ),
                    );

                    return;
                }

                resolve(etag);
            } else {
                const snippet = (xhr.responseText || '').slice(0, 200);
                console.error(
                    `OSS part upload failed (HTTP ${xhr.status}):`,
                    xhr.responseText,
                );
                reject(
                    new Error(
                        `分片上传失败 (HTTP ${xhr.status})${snippet ? `: ${snippet}` : ''}`,
                    ),
                );
            }
        };
        xhr.onerror = () =>
            reject(
                new Error(
                    '网络错误，分片上传失败（可能是 OSS Bucket CORS 未放通当前域名）',
                ),
            );
        xhr.onabort = () => reject(new Error('aborted'));
        run.xhr = xhr;
        xhr.send(blob);
    });
}

async function uploadChunked(
    file: File,
    run: UploadRun,
    onProgress: (pct: number, loaded: number, total: number) => void,
): Promise<string> {
    const { data: init } = await api.post<ApiResponse<MultipartInit>>(
        '/upload/multipart/init',
        {
            filename: file.name,
        },
    );
    const { key, upload_id: uploadId } = init.data;

    const total = file.size;
    const totalParts = Math.max(1, Math.ceil(total / CHUNK_SIZE));
    const partLoaded = new Array<number>(totalParts).fill(0);
    const parts: UploadedPart[] = [];

    const aggregate = () => {
        const loaded = partLoaded.reduce((a, b) => a + b, 0);
        onProgress(
            Math.min(100, Math.round((loaded / total) * 100)),
            loaded,
            total,
        );
    };

    let nextPart = 0;
    let failure: Error | null = null;

    const worker = async () => {
        while (!failure && !run.aborted) {
            const current = nextPart++;

            if (current >= totalParts) {
                return;
            }

            const partNumber = current + 1;
            const start = current * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, total);
            const blob = file.slice(start, end);

            try {
                const url = await signPartUrl(key, uploadId, partNumber);
                const etag = await putPart(url, blob, run, (loaded) => {
                    partLoaded[current] = loaded;
                    aggregate();
                });
                partLoaded[current] = end - start;
                aggregate();
                parts.push({ PartNumber: partNumber, ETag: etag });
            } catch (err) {
                failure = err as Error;

                return;
            }
        }
    };

    try {
        await Promise.all(
            Array.from({ length: Math.min(MAX_PARALLEL, totalParts) }, worker),
        );

        if (run.aborted) {
            await api
                .post('/upload/multipart/abort', { key, upload_id: uploadId })
                .catch(() => {});

            throw new Error('已取消');
        }

        if (failure) {
            await api
                .post('/upload/multipart/abort', { key, upload_id: uploadId })
                .catch(() => {});

            throw failure;
        }

        const { data: done } = await api.post<ApiResponse<MultipartComplete>>(
            '/upload/multipart/complete',
            { key, upload_id: uploadId, parts },
        );

        return done.data.file_url;
    } catch (err) {
        await api
            .post('/upload/multipart/abort', { key, upload_id: uploadId })
            .catch(() => {});

        throw err;
    }
}

interface OssVideoUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    accept?: string;
}

export function OssVideoUploadField({
    value,
    onChange,
    accept = 'video/*',
}: OssVideoUploadFieldProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const runRef = useRef<UploadRun>({ xhr: null, aborted: false });

    const filename = value
        ? decodeURIComponent(value.split('/').pop()?.split('?')[0] ?? '')
        : '';

    const resetState = () => {
        setUploading(false);
        setProgress(0);
        setLoaded(0);
        setTotal(0);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (inputRef.current) {
            inputRef.current.value = '';
        }

        if (!file) {
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                `文件超过上限 ${(MAX_FILE_SIZE / 1024 / 1024 / 1024).toFixed(0)} GB`,
            );

            return;
        }

        setError('');
        setUploading(true);
        setProgress(0);
        setLoaded(0);
        setTotal(file.size);
        runRef.current = { xhr: null, aborted: false };

        try {
            const url = await uploadChunked(
                file,
                runRef.current,
                (pct, l, t) => {
                    setProgress(pct);
                    setLoaded(l);
                    setTotal(t);
                },
            );
            onChange(url);
        } catch (err) {
            const msg = err instanceof Error ? err.message : '上传失败';

            if (msg !== '已取消') {
                setError(msg);
            }
        } finally {
            resetState();
        }
    };

    const handleCancel = () => {
        runRef.current.aborted = true;
        runRef.current.xhr?.abort();
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
                    {uploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Upload className="h-3 w-3" />
                    )}
                    {uploading
                        ? `上传中 ${progress}%`
                        : value
                          ? '重新上传'
                          : '选择视频'}
                </button>
                {uploading && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-600/10 px-2 py-1 text-xs text-red-400 hover:bg-red-600/20"
                    >
                        <Pause className="h-3 w-3" />
                        取消
                    </button>
                )}
                {!uploading && value && (
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

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />

            {uploading && (
                <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-900/40">
                        <div
                            className="h-full bg-blue-500 transition-all duration-150"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        {formatBytes(loaded)} / {formatBytes(total)} ·
                        分片上传中，大文件可能耗时数分钟
                    </p>
                </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            {!uploading && value && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FileVideo className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-xs truncate">
                        {filename || '查看视频'}
                    </span>
                    <AttachmentViewer
                        url={value}
                        filename={filename}
                        label="查看"
                    />
                </div>
            )}
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(
        units.length - 1,
        Math.floor(Math.log(bytes) / Math.log(1024)),
    );

    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
