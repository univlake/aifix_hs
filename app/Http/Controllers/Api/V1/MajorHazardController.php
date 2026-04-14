<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\MajorHazard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MajorHazardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MajorHazard::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with('majorConstitutes')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = MajorHazard::with('majorConstitutes')->find($id);

        if (!$data) {
            return $this->notFound('重大危险源不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'r_value' => 'nullable|string|max:255',
            'is_sis' => 'nullable|integer',
            'sil_level' => 'nullable|string|max:255',
            'detect_parameter' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $majorHazard = MajorHazard::create($data);

            $constitutes = $request->input('constitutes', []);
            foreach ($constitutes as $constitute) {
                $majorHazard->majorConstitutes()->create([
                    'name' => $constitute['name'] ?? null,
                    'hazardous_chemical_id' => $constitute['hazardous_chemical_id'] ?? null,
                    'number' => $constitute['number'] ?? 0,
                    'company_id' => $request->company_id,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            return $majorHazard->load('majorConstitutes');
        });

        return $this->success($result);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $majorHazard = MajorHazard::find($id);

        if (!$majorHazard) {
            return $this->notFound('重大危险源不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'level' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'r_value' => 'sometimes|nullable|string|max:255',
            'is_sis' => 'sometimes|nullable|integer',
            'sil_level' => 'sometimes|nullable|string|max:255',
            'detect_parameter' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $majorHazard, $data) {
            $majorHazard->update($data);

            $constitutes = $request->input('constitutes');
            if ($constitutes !== null) {
                $majorHazard->majorConstitutes()->delete();
                foreach ($constitutes as $constitute) {
                    $majorHazard->majorConstitutes()->create([
                        'name' => $constitute['name'] ?? null,
                        'hazardous_chemical_id' => $constitute['hazardous_chemical_id'] ?? null,
                        'number' => $constitute['number'] ?? 0,
                        'company_id' => $request->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $majorHazard->fresh()->load('majorConstitutes');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $majorHazard = MajorHazard::find($id);

        if (!$majorHazard) {
            return $this->notFound('重大危险源不存在');
        }

        DB::transaction(function () use ($majorHazard) {
            $majorHazard->majorConstitutes()->delete();
            $majorHazard->delete();
        });

        return $this->message('删除成功');
    }
}
