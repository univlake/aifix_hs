<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentBulletin;
use App\Models\AccidentBulletinKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccidentBulletinsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
        ]);

        $data = AccidentBulletin::query()
            ->where('company_id', $request->company_id)
            ->with(['accidentBulletinKids'])
            ->when($request->accident_level, function ($query) use ($request) {
                $query->where('accident_level', 'like', '%' . $request->accident_level . '%');
            })
            ->when($request->type, function ($query) use ($request) {
                $query->where('type', 'like', '%' . $request->type . '%');
            })
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = AccidentBulletin::query()->with(['accidentBulletinKids'])->find($id);

        if (!$data) {
            return $this->notFound('事故快报不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
        ]);

        $data = DB::transaction(function () use ($request) {
            $accidentBulletin = AccidentBulletin::create($request->only(
                'type', 'direct_cause', 'indirect_cause', 'accident_level',
                'department', 'happen_time', 'happen_area', 'content',
                'degree_injury', 'direct_loss_property', 'gauge_loss_property',
                'staff_die', 'staff_hurt', 'not_staff_die', 'not_staff_hurt',
                'accident_report_url', 'accident_photo_url', 'company_id'
            ));
            $accidentBulletin->user_id = auth()->id() ?? 0;
            $accidentBulletin->last_user_id = auth()->id() ?? 0;
            $accidentBulletin->save();

            $kids = $request->input('kids', []);
            foreach ($kids as $v) {
                $accidentBulletin->accidentBulletinKids()->create([
                    'name' => $v['name'] ?? null,
                    'degree_injury' => $v['degree_injury'] ?? null,
                    'department' => $v['department'] ?? null,
                    'age' => $v['age'] ?? null,
                    'sex' => $v['sex'] ?? null,
                    'work_type' => $v['work_type'] ?? null,
                    'work_age' => $v['work_age'] ?? null,
                    'education_level' => $v['education_level'] ?? null,
                    'days_off' => $v['days_off'] ?? null,
                    'company_id' => $request->company_id,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            return $accidentBulletin->load('accidentBulletinKids');
        });

        return $this->success($data);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $accidentBulletin = AccidentBulletin::find($id);

        if (!$accidentBulletin) {
            return $this->notFound('事故快报不存在');
        }

        $data = DB::transaction(function () use ($request, $accidentBulletin) {
            $accidentBulletin->update($request->only(
                'type', 'direct_cause', 'indirect_cause', 'accident_level',
                'department', 'happen_time', 'happen_area', 'content',
                'degree_injury', 'direct_loss_property', 'gauge_loss_property',
                'staff_die', 'staff_hurt', 'not_staff_die', 'not_staff_hurt',
                'accident_report_url', 'accident_photo_url', 'company_id'
            ));
            $accidentBulletin->last_user_id = auth()->id() ?? 0;
            $accidentBulletin->save();

            $kids = $request->input('kids');
            if ($kids !== null) {
                $accidentBulletin->accidentBulletinKids()->delete();
                foreach ($kids as $v) {
                    $accidentBulletin->accidentBulletinKids()->create([
                        'name' => $v['name'] ?? null,
                        'degree_injury' => $v['degree_injury'] ?? null,
                        'department' => $v['department'] ?? null,
                        'age' => $v['age'] ?? null,
                        'sex' => $v['sex'] ?? null,
                        'work_type' => $v['work_type'] ?? null,
                        'work_age' => $v['work_age'] ?? null,
                        'education_level' => $v['education_level'] ?? null,
                        'days_off' => $v['days_off'] ?? null,
                        'company_id' => $request->company_id ?? $accidentBulletin->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $accidentBulletin->fresh()->load('accidentBulletinKids');
        });

        return $this->success($data);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = AccidentBulletin::find($id);

        if (!$record) {
            return $this->notFound('事故快报不存在');
        }

        DB::transaction(function () use ($record) {
            $record->accidentBulletinKids()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
