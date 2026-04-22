<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreJobManagementRequest;
use App\Http\Requests\Api\V1\UpdateJobManagementRequest;
use App\Models\JobManagement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobManagementController extends Controller
{
    /**
     * 作业管理列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobManagement::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_outsourcing')) {
            $query->where('is_outsourcing', $request->is_outsourcing);
        }

        if ($request->filled('job_time')) {
            $query->where('job_time', $request->job_time);
        }

        $list = $query->with(['evaluationUnit'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 作业管理详情
     */
    public function show(int $id): JsonResponse
    {
        $jobManagement = JobManagement::with(['evaluationUnit'])->find($id);

        if (! $jobManagement) {
            return $this->notFound('作业管理不存在');
        }

        return $this->success($jobManagement);
    }

    /**
     * 创建作业管理
     */
    public function store(StoreJobManagementRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $jobManagement = JobManagement::create($data);

        return $this->success($jobManagement);
    }

    /**
     * 更新作业管理
     */
    public function update(UpdateJobManagementRequest $request, int $id): JsonResponse
    {
        $jobManagement = JobManagement::find($id);

        if (! $jobManagement) {
            return $this->notFound('作业管理不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $jobManagement->update($data);

        return $this->success($jobManagement->fresh());
    }

    /**
     * 删除作业管理
     */
    public function destroy(int $id): JsonResponse
    {
        $jobManagement = JobManagement::find($id);

        if (! $jobManagement) {
            return $this->notFound('作业管理不存在');
        }

        $jobManagement->delete();

        return $this->message('删除成功');
    }
}
