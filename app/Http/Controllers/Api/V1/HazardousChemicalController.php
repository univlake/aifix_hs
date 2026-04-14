<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ChemicalIngredient;
use App\Models\HazardousChemical;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\V1\StoreHazardousChemicalRequest;
use App\Http\Requests\Api\V1\UpdateHazardousChemicalRequest;

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

    public function store(StoreHazardousChemicalRequest $request): JsonResponse
    {
        $data = $request->validated();
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

    public function update(UpdateHazardousChemicalRequest $request, int $id): JsonResponse
    {
        $hazardousChemical = HazardousChemical::find($id);

        if (!$hazardousChemical) {
            return $this->notFound('危险化学品不存在');
        }
        $data = $request->validated();
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
