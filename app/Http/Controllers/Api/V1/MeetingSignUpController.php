<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreMeetingSignUpRequest;
use App\Http\Requests\Api\V1\UpdateMeetingSignUpRequest;
use App\Models\MeetingSignUp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeetingSignUpController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MeetingSignUp::query();

        if ($request->filled('meeting_id')) {
            $query->where('meeting_id', $request->meeting_id);
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = MeetingSignUp::find($id);

        if (! $data) {
            return $this->notFound('会议报名不存在');
        }

        return $this->success($data);
    }

    public function store(StoreMeetingSignUpRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = MeetingSignUp::create($data);

        return $this->success($record);
    }

    public function update(UpdateMeetingSignUpRequest $request, int $id): JsonResponse
    {
        $record = MeetingSignUp::find($id);

        if (! $record) {
            return $this->notFound('会议报名不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = MeetingSignUp::find($id);

        if (! $record) {
            return $this->notFound('会议报名不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
