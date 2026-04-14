<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Meeting;
use App\Models\MeetingNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\V1\StoreMeetingRequest;
use App\Http\Requests\Api\V1\UpdateMeetingRequest;

class MeetingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Meeting::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with('meetingNotice')
            ->orderBy('meeting_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = Meeting::with(['meetingNotice', 'meetingSignUps'])->find($id);

        if (!$data) {
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

        if (!$record) {
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

        if (!$record) {
            return $this->notFound('会议不存在');
        }

        DB::transaction(function () use ($record) {
            $record->meetingNotice()->delete();
            $record->meetingSignUps()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
