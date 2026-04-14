<?php

use App\Http\Controllers\Api\V1\BaseDataController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\PersonnelController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

// ── 企业管理 ─────────────────────────────────────────────────────
Route::middleware('permission:companies.list')->group(function () {
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::get('/companies-tree', [CompanyController::class, 'tree']);
});
Route::middleware('permission:companies.create')->group(function () {
    Route::post('/companies', [CompanyController::class, 'store']);
});
Route::middleware('permission:companies.update')->group(function () {
    Route::put('/companies/{company}', [CompanyController::class, 'update']);
    Route::patch('/companies/{company}', [CompanyController::class, 'update']);
});
Route::middleware('permission:companies.delete')->group(function () {
    Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);
});
Route::middleware('permission:companies.review')->group(function () {
    Route::get('/companies-review-list', [CompanyController::class, 'reviewList']);
    Route::post('/companies/{id}/review', [CompanyController::class, 'review']);
});

// ── 人员管理 ─────────────────────────────────────────────────────
Route::middleware('permission:personnels.list')->group(function () {
    Route::get('/personnels', [PersonnelController::class, 'index']);
    Route::get('/personnels/{personnel}', [PersonnelController::class, 'show']);
});
Route::middleware('permission:personnels.create')->group(function () {
    Route::post('/personnels', [PersonnelController::class, 'store']);
});
Route::middleware('permission:personnels.update')->group(function () {
    Route::put('/personnels/{personnel}', [PersonnelController::class, 'update']);
    Route::patch('/personnels/{personnel}', [PersonnelController::class, 'update']);
});
Route::middleware('permission:personnels.delete')->group(function () {
    Route::delete('/personnels/{personnel}', [PersonnelController::class, 'destroy']);
});

// ── 基础数据 ─────────────────────────────────────────────────────
Route::middleware('permission:base-data.view')->group(function () {
    Route::get('/enterprise-types', [BaseDataController::class, 'enterpriseTypes']);
    Route::get('/operational-types', [BaseDataController::class, 'operationalTypes']);
    Route::get('/base-areas', [BaseDataController::class, 'baseAreas']);
    Route::get('/record-types', [BaseDataController::class, 'recordTypes']);
});

// ── 用户管理 ─────────────────────────────────────────────────────
Route::middleware('permission:users.list')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
});
Route::middleware('permission:users.create')->group(function () {
    Route::post('/users', [UserController::class, 'store']);
});
Route::middleware('permission:users.update')->group(function () {
    Route::put('/users/{user}', [UserController::class, 'update']);
});
Route::middleware('permission:users.delete')->group(function () {
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});
Route::middleware('permission:roles.assign')->group(function () {
    Route::put('/users/{user}/role', [UserController::class, 'assignRole']);
});
Route::put('/users/{user}/password', [UserController::class, 'resetPassword'])
    ->middleware('permission:users.update');

// ── 角色管理 ─────────────────────────────────────────────────────
Route::middleware('permission:roles.list')->group(function () {
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{role}', [RoleController::class, 'show']);
});
Route::middleware('permission:roles.create')->group(function () {
    Route::post('/roles', [RoleController::class, 'store']);
});
Route::middleware('permission:roles.update')->group(function () {
    Route::put('/roles/{role}', [RoleController::class, 'update']);
});
Route::middleware('permission:roles.delete')->group(function () {
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
});

// ── 权限查看 ─────────────────────────────────────────────────────
Route::middleware('permission:permissions.list')->group(function () {
    Route::get('/permissions', [PermissionController::class, 'index']);
});
