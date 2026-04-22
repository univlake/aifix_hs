<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreExpertCompanyRequest;
use App\Http\Requests\Api\V1\StoreExpertInspectionsRequest;
use App\Http\Requests\Api\V1\StoreExpertInspectionUserRequest;
use App\Http\Requests\Api\V1\UpdateExpertCompanyRequest;
use App\Http\Requests\Api\V1\UpdateExpertInspectionsRequest;
use App\Http\Requests\Api\V1\UpdateExpertInspectionUserRequest;
use App\Models\ExpertCompany;
use App\Models\ExpertInspection;
use App\Models\ExpertInspectionUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\TemplateProcessor;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExpertInspectionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExpertInspection::query();

        $companyId = $request->get('company_id');
        $expertUserId = $request->get('expert_user_id');

        if ($companyId && $expertUserId) {
            $query->where(function ($q) use ($companyId, $expertUserId) {
                $q->where('company_id', $companyId)
                    ->orWhereHas('expertCompanies', function ($qq) use ($companyId) {
                        $qq->where('check_company_id', $companyId);
                    })
                    ->orWhereHas('expertCompanies.expertInspectionUsers', function ($qq) use ($expertUserId) {
                        $qq->where('expert_user_id', $expertUserId);
                    });
            });
        } elseif ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                    ->orWhereHas('expertCompanies', function ($qq) use ($companyId) {
                        $qq->where('check_company_id', $companyId);
                    });
            });
        } elseif ($expertUserId) {
            $query->whereHas('expertCompanies.expertInspectionUsers', function ($q) use ($expertUserId) {
                $q->where('expert_user_id', $expertUserId);
            });
        }

        if ($request->filled('title')) {
            $query->where('title', 'like', '%'.$request->title.'%');
        }

        $list = $query->with(['expertCompanies'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = ExpertInspection::query()
            ->with([
                'expertCompanies.checkCompany:id,title',
                'expertCompanies.expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->find($id);

        if (! $data) {
            return $this->notFound('专家检查不存在');
        }

        return $this->success($data);
    }

    public function store(StoreExpertInspectionsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertInspection::create($data);

        return $this->success($record);
    }

    public function update(UpdateExpertInspectionsRequest $request, int $id): JsonResponse
    {
        $record = ExpertInspection::find($id);

        if (! $record) {
            return $this->notFound('专家检查不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = ExpertInspection::find($id);

        if (! $record) {
            return $this->notFound('专家检查不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    // ── ExpertCompany CRUD ──────────────────────────────

    public function companies(Request $request): JsonResponse
    {
        $list = ExpertCompany::query()
            ->where('expert_inspection_id', $request->expert_inspection_id)
            ->with([
                'checkCompany:id,title',
                'expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function storeCompany(StoreExpertCompanyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertCompany::create($data);

        return $this->success($record->load('checkCompany:id,title'));
    }

    public function updateCompany(UpdateExpertCompanyRequest $request, int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (! $record) {
            return $this->notFound('专家检查企业不存在');
        }

        $data = $request->validated();

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh('checkCompany:id,title'));
    }

    public function destroyCompany(int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (! $record) {
            return $this->notFound('专家检查企业不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    public function confirmCompany(int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (! $record) {
            return $this->notFound('专家检查企业不存在');
        }

        $record->update([
            'confirm_time' => now(),
            'status' => 2,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($record->fresh());
    }

    /**
     * 企业端仪表板通知：已到达 notify_company_time 且尚未确认的记录。
     *
     * 受检企业的通知由管理员在新增检查时填写的 notify_company_time 自动触发：
     * 当前时间 >= notify_company_time 即出现在仪表板，无需人工分发。
     */
    public function companyNotifications(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = ExpertCompany::query()
            ->where('check_company_id', $request->company_id)
            ->whereNull('confirm_time')
            ->whereNotNull('notify_company_time')
            ->where('notify_company_time', '<=', now())
            ->with([
                'expertInspection:id,title,description,start_date,end_date',
                'expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->orderByDesc('notify_company_time')
            ->get();

        return $this->success($list);
    }

    /**
     * 当前用户相关的检查记录：
     *   - 本企业被检查（check_company_id = company_id，且已到达 notify_company_time）
     *   - 本人作为专家被指派（expert_inspection_users.expert_user_id = user_id，立即可见）
     *   两者并集。
     */
    public function myCheckInspections(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $companyId = (int) $request->company_id;
        $expertUserId = $request->get('expert_user_id') ?? $request->get('user_id');

        $list = ExpertCompany::query()
            ->where(function ($q) use ($companyId, $expertUserId) {
                $q->where(function ($qq) use ($companyId) {
                    $qq->where('check_company_id', $companyId)
                        ->whereNotNull('notify_company_time')
                        ->where('notify_company_time', '<=', now());
                });

                if ($expertUserId) {
                    $q->orWhereHas('expertInspectionUsers', function ($qq) use ($expertUserId) {
                        $qq->where('expert_user_id', $expertUserId);
                    });
                }
            })
            ->with([
                'checkCompany:id,title',
                'expertInspection:id,title,description,start_date,end_date,company_id',
                'expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 50));

        return $this->success($list);
    }

    /**
     * 专家端：本专家所有被指派的检查记录（指派即刻可见）.
     */
    public function myExpertAssignments(Request $request): JsonResponse
    {
        $userId = $request->get('expert_user_id', auth()->id());

        if (! $userId) {
            return $this->success([]);
        }

        $list = ExpertInspectionUser::query()
            ->where('expert_user_id', $userId)
            ->with([
                'expertCompany.expertInspection:id,title,description,start_date,end_date,company_id',
                'expertCompany.checkCompany:id,title',
            ])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 50));

        return $this->success($list);
    }

    // ── ExpertInspectionUser CRUD ──────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $request->validate(['expert_company_id' => 'required|integer']);

        $list = ExpertInspectionUser::query()
            ->where('expert_company_id', $request->expert_company_id)
            ->with(['expertUser:id,nickname,phone'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function storeUser(StoreExpertInspectionUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertInspectionUser::create($data);

        return $this->success($record->load('expertUser:id,nickname,phone'));
    }

    public function updateUser(UpdateExpertInspectionUserRequest $request, int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (! $record) {
            return $this->notFound('专家用户不存在');
        }

        $data = $request->validated();

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroyUser(int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (! $record) {
            return $this->notFound('专家用户不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    public function confirmUser(int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (! $record) {
            return $this->notFound('专家用户不存在');
        }

        $record->update([
            'confirm_time' => now(),
            'status' => 2,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($record->fresh());
    }

    /**
     * 专家端仪表板通知：已指派但尚未确认的检查（指派即通知）.
     */
    public function expertNotifications(Request $request): JsonResponse
    {
        $userId = $request->get('expert_user_id', auth()->id());

        if (! $userId) {
            return $this->success([]);
        }

        $list = ExpertInspectionUser::query()
            ->where('expert_user_id', $userId)
            ->whereNull('confirm_time')
            ->with([
                'expertCompany.expertInspection:id,title,description,start_date,end_date',
                'expertCompany.checkCompany:id,title',
            ])
            ->orderByDesc('id')
            ->get();

        return $this->success($list);
    }

    // ── 检查通知单 ──────────────────────────────────────────────

    /**
     * 生成检查通知单 docx（仅检查计划创建企业可操作）。
     *
     * 通知单文件保存在 storage/app/inspection-notices/，路径写入 expert_companies.inspection_notice_url，
     * 受检企业无权访问；检查专家通过下载接口取得。
     */
    public function generateInspectionNotice(Request $request, int $id): JsonResponse
    {
        $expertCompany = ExpertCompany::query()
            ->with(['expertInspection', 'checkCompany', 'expertInspectionUsers.expertUser'])
            ->find($id);

        if (! $expertCompany) {
            return $this->notFound('检查记录不存在');
        }

        $user = $request->user();
        $planCompanyId = $expertCompany->expertInspection?->company_id;

        if ($planCompanyId === null || $planCompanyId !== (int) $user->company_id) {
            return $this->failed('仅检查计划创建企业可生成通知单');
        }

        $templatePath = public_path('enterprise_export.docx');

        if (! is_file($templatePath)) {
            return $this->failed('通知单模板缺失：enterprise_export.docx');
        }

        $checkCompanyName = $expertCompany->checkCompany?->title ?? '';
        $expertNames = $expertCompany->expertInspectionUsers
            ->map(fn ($row) => $row->expertUser?->nickname)
            ->filter()
            ->implode('、');

        try {
            ini_set('pcre.backtrack_limit', '999999999');
            $processor = new TemplateProcessor($templatePath);
            $processor->setValue('title', '安全检查通知单');
            $processor->setValue('company_title', $checkCompanyName);
            $processor->setValue('user_name', $expertNames);
            $processor->setValue('content', (string) ($expertCompany->expertInspection?->title ?? ''));
            $processor->setValue('time', (string) ($expertCompany->check_company_time ?? ''));
            $processor->setValue('created_time', (string) $expertCompany->created_at);

            $relDir = 'inspection-notices/'.date('Y').'/'.date('m');
            $absDir = storage_path('app/'.$relDir);

            if (! is_dir($absDir)) {
                mkdir($absDir, 0755, true);
            }

            $filename = '检查通知单-'.$checkCompanyName.'-'.date('Ymd').'-'.Str::random(6).'.docx';
            $relPath = $relDir.'/'.$filename;
            $processor->saveAs(storage_path('app/'.$relPath));
        } catch (\Throwable $e) {
            return $this->failed('生成通知单失败：'.$e->getMessage());
        }

        $expertCompany->update(['inspection_notice_url' => $relPath]);

        return $this->success($expertCompany->fresh());
    }

    /**
     * 下载检查通知单（计划创建企业、已指派专家可下载，受检企业无权访问）。
     */
    public function downloadInspectionNotice(Request $request, int $id): BinaryFileResponse|JsonResponse
    {
        $expertCompany = ExpertCompany::query()
            ->with(['expertInspection', 'expertInspectionUsers'])
            ->find($id);

        if (! $expertCompany) {
            return $this->notFound('检查记录不存在');
        }

        $user = $request->user();
        $planCompanyId = $expertCompany->expertInspection?->company_id;
        $isOwner = $planCompanyId !== null && $planCompanyId === (int) $user->company_id;
        $isAssignedExpert = $expertCompany->expertInspectionUsers
            ->contains(fn ($row) => (int) $row->expert_user_id === (int) $user->id);

        if (! $isOwner && ! $isAssignedExpert) {
            return $this->failed('无权限下载通知单');
        }

        if (! $expertCompany->inspection_notice_url) {
            return $this->failed('通知单尚未生成');
        }

        $path = storage_path('app/'.$expertCompany->inspection_notice_url);

        if (! is_file($path)) {
            return $this->failed('通知单文件不存在');
        }

        return response()->download($path, basename($path));
    }
}
