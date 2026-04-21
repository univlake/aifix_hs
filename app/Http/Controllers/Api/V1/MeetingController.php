<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreMeetingRequest;
use App\Http\Requests\Api\V1\UpdateMeetingRequest;
use App\Models\Meeting;
use App\Models\MeetingNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Meeting::query();

        if ($request->filled('company_id')) {
            $companyId = (int) $request->company_id;
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                    ->orWhereHas('meetingNotices', function ($inner) use ($companyId) {
                        $inner->where('company_id', $companyId);
                    });
            });
        }

        if ($request->filled('notify_company_id')) {
            $query->whereHas('meetingNotices', function ($q) use ($request) {
                $q->where('company_id', $request->notify_company_id);
            });
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        if ($request->filled('start_date')) {
            $query->where('meeting_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('meeting_date', '<=', $request->end_date);
        }

        $list = $query->with('meetingNotices')
            ->orderBy('meeting_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = Meeting::with([
            'meetingNotices.company:id,title',
            'meetingSignUps',
        ])->find($id);

        if (! $data) {
            return $this->notFound('会议不存在');
        }

        return $this->success($data);
    }

    public function store(StoreMeetingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $record = Meeting::create($data);

            $kids = $request->input('kids');
            if ($kids) {
                foreach ($kids as $v) {
                    $record->meetingNotice()->create([
                        'company_name' => $v['company_name'] ?? null,
                        'company_id' => $v['company_id'] ?? null,
                        'company_group_name' => $v['company_group_name'] ?? null,
                        'company_group_id' => $v['company_group_id'] ?? null,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $record->load('meetingNotice');
        });

        return $this->success($result);
    }

    public function update(UpdateMeetingRequest $request, int $id): JsonResponse
    {
        $record = Meeting::find($id);

        if (! $record) {
            return $this->notFound('会议不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $record, $data) {
            $record->update($data);

            $kids = $request->input('kids');
            if ($kids) {
                MeetingNotice::where('meeting_id', $record->id)->delete();
                foreach ($kids as $v) {
                    $record->meetingNotice()->create([
                        'company_name' => $v['company_name'] ?? null,
                        'company_id' => $v['company_id'] ?? null,
                        'company_group_name' => $v['company_group_name'] ?? null,
                        'company_group_id' => $v['company_group_id'] ?? null,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $record->load('meetingNotice');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = Meeting::find($id);

        if (! $record) {
            return $this->notFound('会议不存在');
        }

        DB::transaction(function () use ($record) {
            $record->meetingNotices()->delete();
            $record->meetingSignUps()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }

    /**
     * 触发一个会议通知的发送（标记 notify_time）。
     * 邮件/短信通道尚未接入时，仅写入时间戳与活动日志；
     * 后续接入时在此处调用 Mail::send(...) 或短信服务即可。
     */
    public function notifyNotice(int $id): JsonResponse
    {
        $notice = MeetingNotice::find($id);

        if (! $notice) {
            return $this->notFound('会议通知记录不存在');
        }

        $notice->update([
            'notify_time' => now(),
            'last_user_id' => auth()->id() ?? 0,
        ]);

        activity('meeting_notice')
            ->performedOn($notice)
            ->causedBy(auth()->user())
            ->withProperties(['meeting_id' => $notice->meeting_id, 'company_id' => $notice->company_id])
            ->log('发送会议通知');

        return $this->success($notice->fresh());
    }

    /**
     * 企业端确认收到通知.
     */
    public function confirmNotice(int $id): JsonResponse
    {
        $notice = MeetingNotice::find($id);

        if (! $notice) {
            return $this->notFound('会议通知记录不存在');
        }

        $notice->update([
            'confirm_time' => now(),
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($notice->fresh());
    }

    /**
     * 企业端仪表板：本企业尚未确认的会议通知.
     */
    public function pendingNotices(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = MeetingNotice::query()
            ->where('company_id', $request->company_id)
            ->whereNull('confirm_time')
            ->where(function ($q) {
                $q->whereNull('notify_time')
                    ->orWhere('notify_time', '<=', now());
            })
            ->with(['meeting:id,name,meeting_date,sign_end_date,place,theme'])
            ->orderByDesc('notify_time')
            ->get();

        return $this->success($list);
    }
}
