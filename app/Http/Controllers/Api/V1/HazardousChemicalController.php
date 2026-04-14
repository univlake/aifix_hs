<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ChemicalIngredient;
use App\Models\HazardousChemical;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HazardousChemicalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HazardousChemical::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->filled('is_supervision')) {
            $query->where('is_supervision', $request->is_supervision);
        }

        if ($request->filled('is_toxin')) {
            $query->where('is_toxin', $request->is_toxin);
        }

        if ($request->filled('is_explosion')) {
            $query->where('is_explosion', $request->is_explosion);
        }

        $list = $query->with('chemicalIngredients')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = HazardousChemical::with('chemicalIngredients')->find($id);

        if (!$data) {
            return $this->notFound('危险化学品不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'alias' => 'nullable|string|max:255',
            'is_supervision' => 'nullable|integer',
            'is_toxin' => 'nullable|integer',
            'is_explosion' => 'nullable|integer',
            'is_easy_explode' => 'nullable|integer',
            'is_narcotics' => 'nullable|integer',
            'is_monitor' => 'nullable|integer',
            'is_mixing' => 'nullable|integer',
            'cas' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'temperature' => 'nullable|string|max:255',
            'storage' => 'nullable|string|max:255',
            'year_use' => 'nullable|string|max:255',
            'year_use_unit' => 'nullable|string|max:255',
            'storage_unit' => 'nullable|string|max:255',
            'pressure' => 'nullable|string|max:255',
            'pressure_unit' => 'nullable|string|max:255',
            'fire_class' => 'nullable|string|max:255',
            'matter_state' => 'nullable|string|max:255',
            'msds' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $hazardousChemical = HazardousChemical::create($data);

            $ingredients = $request->input('ingredients', []);
            foreach ($ingredients as $ingredient) {
                $hazardousChemical->chemicalIngredients()->create([
                    'name' => $ingredient['name'] ?? null,
                    'content' => $ingredient['content'] ?? null,
                    'cas' => $ingredient['cas'] ?? null,
                    'company_id' => $request->company_id,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            return $hazardousChemical->load('chemicalIngredients');
        });

        return $this->success($result);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hazardousChemical = HazardousChemical::find($id);

        if (!$hazardousChemical) {
            return $this->notFound('危险化学品不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'alias' => 'sometimes|nullable|string|max:255',
            'is_supervision' => 'sometimes|nullable|integer',
            'is_toxin' => 'sometimes|nullable|integer',
            'is_explosion' => 'sometimes|nullable|integer',
            'is_easy_explode' => 'sometimes|nullable|integer',
            'is_narcotics' => 'sometimes|nullable|integer',
            'is_monitor' => 'sometimes|nullable|integer',
            'is_mixing' => 'sometimes|nullable|integer',
            'cas' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'temperature' => 'sometimes|nullable|string|max:255',
            'storage' => 'sometimes|nullable|string|max:255',
            'year_use' => 'sometimes|nullable|string|max:255',
            'year_use_unit' => 'sometimes|nullable|string|max:255',
            'storage_unit' => 'sometimes|nullable|string|max:255',
            'pressure' => 'sometimes|nullable|string|max:255',
            'pressure_unit' => 'sometimes|nullable|string|max:255',
            'fire_class' => 'sometimes|nullable|string|max:255',
            'matter_state' => 'sometimes|nullable|string|max:255',
            'msds' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $hazardousChemical, $data) {
            $hazardousChemical->update($data);

            $ingredients = $request->input('ingredients');
            if ($ingredients !== null) {
                $hazardousChemical->chemicalIngredients()->delete();
                foreach ($ingredients as $ingredient) {
                    $hazardousChemical->chemicalIngredients()->create([
                        'name' => $ingredient['name'] ?? null,
                        'content' => $ingredient['content'] ?? null,
                        'cas' => $ingredient['cas'] ?? null,
                        'company_id' => $request->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $hazardousChemical->fresh()->load('chemicalIngredients');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $hazardousChemical = HazardousChemical::find($id);

        if (!$hazardousChemical) {
            return $this->notFound('危险化学品不存在');
        }

        DB::transaction(function () use ($hazardousChemical) {
            $hazardousChemical->chemicalIngredients()->delete();
            $hazardousChemical->delete();
        });

        return $this->message('删除成功');
    }
}
