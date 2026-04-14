<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\EmergencyTeam;
use App\Models\EmergencyTeamKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\V1\StoreEmergencyTeamRequest;
use App\Http\Requests\Api\V1\UpdateEmergencyTeamRequest;

class EmergencyTeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmergencyTeam::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with('emergencyTeamKid')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = EmergencyTeam::with('emergencyTeamKid')->find($id);

        if (!$data) {
            return $this->notFound('应急队伍不存在');
        }

        return $this->success($data);
    }

    public function store(StoreEmergencyTeamRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $record = EmergencyTeam::create($data);

            $kids = $request->input('kids');
            if ($kids) {
                foreach ($kids as $v) {
                    $record->emergencyTeamKid()->create([
                        'name' => $v['name'] ?? null,
                        'department' => $v['department'] ?? null,
                        'content' => $v['content'] ?? null,
                        'tel' => $v['tel'] ?? null,
                        'company_id' => $request->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $record->load('emergencyTeamKid');
        });

        return $this->success($result);
    }

    public function update(UpdateEmergencyTeamRequest $request, int $id): JsonResponse
    {
        $record = EmergencyTeam::find($id);

        if (!$record) {
            return $this->notFound('应急队伍不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $record, $data) {
            $record->update($data);

            $kids = $request->input('kids');
            if ($kids) {
                EmergencyTeamKid::where('emergency_team_id', $record->id)->delete();
                foreach ($kids as $v) {
                    $record->emergencyTeamKid()->create([
                        'name' => $v['name'] ?? null,
                        'department' => $v['department'] ?? null,
                        'content' => $v['content'] ?? null,
                        'tel' => $v['tel'] ?? null,
                        'company_id' => $request->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $record->load('emergencyTeamKid');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = EmergencyTeam::find($id);

        if (!$record) {
            return $this->notFound('应急队伍不存在');
        }

        DB::transaction(function () use ($record) {
            $record->emergencyTeamKid()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
