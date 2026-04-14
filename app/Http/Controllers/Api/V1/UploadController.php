<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|max:10240']);

        $file = $request->file('file');
        $dir = $request->input('dir', 'uploads/' . date('Y/m'));
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs($dir, $filename, 'public');

        return $this->success([
            'filename' => $filename,
            'filepath' => $path,
            'url' => asset('storage/' . $path),
            'contenttype' => $file->getClientOriginalExtension(),
            'filesize' => $file->getSize(),
        ]);
    }
}
