<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreRegulationLibraryRequest;
use App\Models\RegulationLibrary;
use App\Models\RegulationLibraryType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegulationLibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $list = RegulationLibrary::query()
            ->when($request->title, function ($query) use ($request) {
                $query->where('title', 'like', '%'.$request->title.'%');
            })
            ->when($request->filled('regulation_library_type_id'), function ($query) use ($request) {
                $query->where('regulation_library_type_id', $request->regulation_library_type_id);
            })
            ->when(! $request->filled('regulation_library_type_id') && $request->filled('type_parent_id'), function ($query) use ($request) {
                $childIds = RegulationLibraryType::where('pid', $request->type_parent_id)->pluck('id');
                if ($childIds->isEmpty()) {
                    $query->where('regulation_library_type_id', $request->type_parent_id);
                } else {
                    $query->whereIn('regulation_library_type_id', $childIds);
                }
            })
            ->with('regulationType')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = RegulationLibrary::query()->with('regulationType')->find($id);

        if (! $data) {
            return $this->notFound('法规库信息不存在');
        }

        return $this->success($data);
    }

    public function store(StoreRegulationLibraryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;
        $data['company_id'] = $data['company_id'] ?? 0;

        $regulationLibrary = RegulationLibrary::create($data);

        return $this->success($regulationLibrary);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $regulationLibrary = RegulationLibrary::find($id);

        if (! $regulationLibrary) {
            return $this->notFound('法规库信息不存在');
        }

        $regulationLibrary->update(array_merge(
            $request->only(
                'type', 'title', 'established_date', 'effective_date',
                'promulgating_department', 'standard_encoding', 'identify_date',
                'status', 'annex_url', 'regulation_library_type_id', 'company_id'
            ),
            ['last_user_id' => auth()->id() ?? 0]
        ));

        return $this->success($regulationLibrary);
    }

    public function destroy(int $id): JsonResponse
    {
        $regulationLibrary = RegulationLibrary::find($id);

        if (! $regulationLibrary) {
            return $this->notFound('法规库信息不存在');
        }

        $regulationLibrary->delete();

        return $this->message('删除成功', 204);
    }
}
