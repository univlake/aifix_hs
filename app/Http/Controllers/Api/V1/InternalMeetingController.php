<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreInternalMeetingRequest;
use App\Http\Requests\Api\V1\UpdateInternalMeetingRequest;
use App\Models\InternalMeeting;
use App\Models\InternalMeetingKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InternalMeetingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InternalMeeting::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->with('internalMeetingKid.join_user')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = InternalMeeting::with('internalMeetingKid.join_user')->find($id);

        if (! $data) {
            return $this->notFound('内部会议不存在');
        }

        return $this->success($data);
    }

    public function store(StoreInternalMeetingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $record = InternalMeeting::create($data);

            $kids = $request->input('kids');
            if ($kids) {
                foreach ($kids as $v) {
                    $record->internalMeetingKid()->create([
                        'join_user_id' => $v['join_user_id'] ?? null,
                        'company_id' => $request->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $record->load('internalMeetingKid.join_user');
        });

        return $this->success($result);
    }

    public function update(UpdateInternalMeetingRequest $request, int $id): JsonResponse
    {
        $record = InternalMeeting::find($id);

        if (! $record) {
            return $this->notFound('内部会议不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $record, $data) {
            $record->update($data);

            $kids = $request->input('kids');
            if ($kids) {
                InternalMeetingKid::where('internal_meeting_id', $record->id)->delete();
                foreach ($kids as $v) {
                    $record->internalMeetingKid()->create([
                        'join_user_id' => $v['join_user_id'] ?? null,
                        'company_id' => $request->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $record->load('internalMeetingKid.join_user');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = InternalMeeting::find($id);

        if (! $record) {
            return $this->notFound('内部会议不存在');
        }

        DB::transaction(function () use ($record) {
            $record->internalMeetingKid()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
