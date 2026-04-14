<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with('internalMeetingKid.join_user')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = InternalMeeting::with('internalMeetingKid.join_user')->find($id);

        if (!$data) {
            return $this->notFound('内部会议不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'theme' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'meeting_date' => 'nullable|date',
            'summary' => 'nullable|string',
            'annex_url' => 'nullable|string',
            'notice_annex_url' => 'nullable|string',
            'summary_annex_url' => 'nullable|string',
            'sign_annex_url' => 'nullable|string',
            'material_annex_url' => 'nullable|string',
            'photo_annex_url' => 'nullable|string',
        ]);

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

    public function update(Request $request, int $id): JsonResponse
    {
        $record = InternalMeeting::find($id);

        if (!$record) {
            return $this->notFound('内部会议不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:255',
            'theme' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|nullable|string|max:255',
            'meeting_date' => 'sometimes|nullable|date',
            'summary' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'notice_annex_url' => 'sometimes|nullable|string',
            'summary_annex_url' => 'sometimes|nullable|string',
            'sign_annex_url' => 'sometimes|nullable|string',
            'material_annex_url' => 'sometimes|nullable|string',
            'photo_annex_url' => 'sometimes|nullable|string',
        ]);

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

        if (!$record) {
            return $this->notFound('内部会议不存在');
        }

        DB::transaction(function () use ($record) {
            $record->internalMeetingKid()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
