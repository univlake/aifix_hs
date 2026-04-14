<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Offloads Excel generation from the HTTP worker to the queue.
 *
 * Usage (from a controller):
 *
 *   GenerateExcelExportJob::dispatch(
 *       export: new MyExport($filters),
 *       filename: 'companies-2026-04.xlsx',
 *       disk: 'local',
 *       notifyUserId: auth()->id(),
 *   );
 *
 * The job stores the file on the configured disk and can optionally
 * notify the requesting user when the download is ready.
 */
class GenerateExcelExportJob implements ShouldQueue
{
    use Queueable;

    /**
     * Retry up to 3 times before failing definitively.
     * Excel generation can fail transiently (memory pressure, disk I/O).
     */
    public int $tries = 3;

    /**
     * Give the job up to 5 minutes — large exports can be slow.
     */
    public int $timeout = 300;

    /**
     * @param  object  $export  An instance of any Maatwebsite\Excel exportable
     * @param  string  $filename  Target filename (e.g. 'report-2026.xlsx')
     * @param  string  $disk  Storage disk to write to (default: 'local')
     * @param  string  $directory  Sub-directory on the disk (default: 'exports')
     * @param  int|null  $notifyUserId  User to notify when the export is ready
     */
    public function __construct(
        public readonly object $export,
        public readonly string $filename,
        public readonly string $disk = 'local',
        public readonly string $directory = 'exports',
        public readonly ?int $notifyUserId = null,
    ) {}

    public function handle(): void
    {
        $path = $this->directory.'/'.$this->filename;

        Excel::store($this->export, $path, $this->disk);

        if ($this->notifyUserId !== null) {
            SendNotificationJob::dispatch(
                userId: $this->notifyUserId,
                title: '导出完成',
                body: "文件 {$this->filename} 已生成，请前往下载中心获取。",
                data: ['file_path' => $path, 'disk' => $this->disk],
            );
        }
    }

    /**
     * Handle a job failure — log rather than silently swallow the error.
     */
    public function failed(\Throwable $exception): void
    {
        logger()->error('Excel export job failed', [
            'filename' => $this->filename,
            'exception' => $exception->getMessage(),
        ]);
    }
}
