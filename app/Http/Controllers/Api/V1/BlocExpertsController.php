<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreBlocExpertsRequest;
use App\Models\BlocExpertUser;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlocExpertsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $data = BlocExpertUser::query()
            ->where('company_id', $request->company_id)
            ->with(['company:id,title', 'user:id,nickname,phone,department_name,email'])
            ->when($request->nickname, fn ($q) => $q->whereHas('user', fn ($u) => $u->where('nickname', 'like', '%'.$request->nickname.'%')))
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = User::query()->with('company')->find($id);

        if (! $data) {
            return $this->notFound('专家不存在');
        }

        return $this->success($data);
    }

    public function store(StoreBlocExpertsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = BlocExpertUser::create($data);

        return $this->success($record);
    }

    public function destroy(int $id): JsonResponse
    {
        $data = BlocExpertUser::find($id);

        if (! $data) {
            return $this->notFound('该专家不存在');
        }

        $data->delete();

        return $this->success($data);
    }

    public function list(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $isInCompany = BlocExpertUser::query()
            ->where('company_id', $request->company_id)
            ->pluck('expert_user_id')
            ->toArray();

        $users = User::query()
            ->where('status', 1)
            ->whereNotIn('id', $isInCompany)
            ->when($request->nickname, function ($query) use ($request) {
                $query->where('nickname', 'like', '%'.$request->nickname.'%');
            })
            ->get();

        return $this->success($users);
    }
}
