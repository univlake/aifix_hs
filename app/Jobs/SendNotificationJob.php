<?php

namespace App\Jobs;

use App\Models\NewNotify;
use App\Models\NewNotifyScope;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

/**
 * Sends an in-app notification to a user asynchronously.
 *
 * Decouples notification delivery from the HTTP request cycle.
 * Use this for system-generated alerts (export ready, review required, etc.)
 * so the originating request returns immediately.
 *
 * Usage:
 *   SendNotificationJob::dispatch(
 *       userId: $user->id,
 *       title: '审核通过',
 *       body: '您的企业信息已审核通过。',
 *       data: ['company_id' => $company->id],
 *   );
 */
class SendNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    /**
     * @param  int  $userId  Recipient user ID
     * @param  string  $title  Notification title
     * @param  string  $body  Notification body text
     * @param  array<string, mixed>  $data  Arbitrary payload for the frontend
     */
    public function __construct(
        public readonly int $userId,
        public readonly string $title,
        public readonly string $body,
        public readonly array $data = [],
    ) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $notify = NewNotify::create([
                'title' => $this->title,
                'content' => $this->body,
                'type' => $this->data['type'] ?? 'system',
                'user_id' => 0,
                'last_user_id' => 0,
                'company_id' => $this->data['company_id'] ?? 0,
            ]);

            NewNotifyScope::create([
                'new_notify_id' => $notify->id,
                'user_id' => $this->userId,
                'is_read' => 0,
            ]);
        });
    }

    public function failed(\Throwable $exception): void
    {
        logger()->error('SendNotificationJob failed', [
            'user_id' => $this->userId,
            'title' => $this->title,
            'exception' => $exception->getMessage(),
        ]);
    }
}
