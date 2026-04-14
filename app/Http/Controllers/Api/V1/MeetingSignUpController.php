<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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

        if (!$data) {
            return $this->notFound('会议报名不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'meeting_id' => 'required|integer',
            'company_name' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'sex' => 'nullable|string|max:10',
            'job_title' => 'nullable|string|max:255',
            'tel' => 'nullable|string|max:255',
            'card_number' => 'nullable|string|max:255',
            'is_driving' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = MeetingSignUp::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = MeetingSignUp::find($id);

        if (!$record) {
            return $this->notFound('会议报名不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'meeting_id' => 'sometimes|required|integer',
            'company_name' => 'sometimes|nullable|string|max:255',
            'name' => 'sometimes|nullable|string|max:255',
            'sex' => 'sometimes|nullable|string|max:10',
            'job_title' => 'sometimes|nullable|string|max:255',
            'tel' => 'sometimes|nullable|string|max:255',
            'card_number' => 'sometimes|nullable|string|max:255',
            'is_driving' => 'sometimes|nullable|string|max:255',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = MeetingSignUp::find($id);

        if (!$record) {
            return $this->notFound('会议报名不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
