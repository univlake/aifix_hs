<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentBulletin;
use App\Models\ExpertCompany;
use App\Models\InformationDraft;
use App\Models\Meeting;
use App\Models\NewNotify;
use App\Models\OfficeNotify;
use App\Models\RectificationSheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisibleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        // Placeholder: aggregate visible modules data
        $data = [
            'accident_bulletins' => AccidentBulletin::where('company_id', $request->company_id)->count(),
            'information_drafts' => InformationDraft::where('company_id', $request->company_id)->count(),
            'meetings' => Meeting::where('company_id', $request->company_id)->count(),
            'office_notifies' => OfficeNotify::where('company_id', $request->company_id)->count(),
            'new_notifies' => NewNotify::where('company_id', $request->company_id)->count(),
        ];

        return $this->success($data);
    }
}
