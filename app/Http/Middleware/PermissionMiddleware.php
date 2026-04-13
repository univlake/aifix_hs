<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (!$request->user()) {
            return response()->json([
                'status' => 'error',
                'code' => 401,
                'message' => '未登录',
            ], 401);
        }

        if (!$request->user()->hasAnyPermission(...$permissions)) {
            return response()->json([
                'status' => 'error',
                'code' => 403,
                'message' => '没有操作权限',
            ], 403);
        }

        return $next($request);
    }
}
