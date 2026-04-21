<?php

use App\Http\Controllers\Api\V1\EmergencyDrillController;
use App\Http\Controllers\Api\V1\EmergencySuppliesController;
use App\Http\Controllers\Api\V1\EmergencyTeamController;
use App\Http\Controllers\Api\V1\ExternalTrainingController;
use App\Http\Controllers\Api\V1\FireEquipmentController;
use App\Http\Controllers\Api\V1\FireFacilityController;
use App\Http\Controllers\Api\V1\FireSafetyController;
use App\Http\Controllers\Api\V1\FundingExecutionController;
use App\Http\Controllers\Api\V1\InternalMeetingController;
use App\Http\Controllers\Api\V1\InternalTrainingController;
use App\Http\Controllers\Api\V1\MeetingController;
use App\Http\Controllers\Api\V1\MeetingSignUpController;
use App\Http\Controllers\Api\V1\NewNotifyController;
use App\Http\Controllers\Api\V1\OfficeNotifyController;
use App\Http\Controllers\Api\V1\OtherTrainingController;
use App\Http\Controllers\Api\V1\SecurityInvestmentController;
use App\Http\Controllers\Api\V1\ThreeTogetherController;
use App\Http\Controllers\Api\V1\TrainingClassController;
use App\Http\Controllers\Api\V1\TrainingClassInfoController;
use App\Http\Controllers\Api\V1\TrainingFileController;
use App\Http\Controllers\Api\V1\TrainingVideoController;
use Illuminate\Support\Facades\Route;

// ── 消防管理 ─────────────────────────────────────────────────────
Route::middleware('permission:fire-safeties.list')->group(function () {
    Route::get('/fire-safeties', [FireSafetyController::class, 'index']);
    Route::get('/fire-safeties/{id}', [FireSafetyController::class, 'show']);
});
Route::middleware('permission:fire-safeties.create')->group(function () {
    Route::post('/fire-safeties', [FireSafetyController::class, 'store']);
});
Route::middleware('permission:fire-safeties.update')->group(function () {
    Route::put('/fire-safeties/{id}', [FireSafetyController::class, 'update']);
    Route::patch('/fire-safeties/{id}', [FireSafetyController::class, 'update']);
});
Route::middleware('permission:fire-safeties.delete')->group(function () {
    Route::delete('/fire-safeties/{id}', [FireSafetyController::class, 'destroy']);
});

// ── 消防器材 ─────────────────────────────────────────────────────
Route::middleware('permission:fire-equipment.list')->group(function () {
    Route::get('/fire-equipment', [FireEquipmentController::class, 'index']);
    Route::get('/fire-equipment/{id}', [FireEquipmentController::class, 'show']);
});
Route::middleware('permission:fire-equipment.create')->group(function () {
    Route::post('/fire-equipment', [FireEquipmentController::class, 'store']);
    Route::post('/fire-equipment/copy', [FireEquipmentController::class, 'copy']);
});
Route::middleware('permission:fire-equipment.update')->group(function () {
    Route::put('/fire-equipment/{id}', [FireEquipmentController::class, 'update']);
    Route::patch('/fire-equipment/{id}', [FireEquipmentController::class, 'update']);
});
Route::middleware('permission:fire-equipment.delete')->group(function () {
    Route::delete('/fire-equipment/{id}', [FireEquipmentController::class, 'destroy']);
});

// ── 消防设施 ─────────────────────────────────────────────────────
Route::middleware('permission:fire-facilities.list')->group(function () {
    Route::get('/fire-facilities', [FireFacilityController::class, 'index']);
    Route::get('/fire-facilities/{id}', [FireFacilityController::class, 'show']);
});
Route::middleware('permission:fire-facilities.create')->group(function () {
    Route::post('/fire-facilities', [FireFacilityController::class, 'store']);
    Route::post('/fire-facilities/copy', [FireFacilityController::class, 'copy']);
});
Route::middleware('permission:fire-facilities.update')->group(function () {
    Route::put('/fire-facilities/{id}', [FireFacilityController::class, 'update']);
    Route::patch('/fire-facilities/{id}', [FireFacilityController::class, 'update']);
});
Route::middleware('permission:fire-facilities.delete')->group(function () {
    Route::delete('/fire-facilities/{id}', [FireFacilityController::class, 'destroy']);
});

// ── 应急演练 ─────────────────────────────────────────────────────
Route::middleware('permission:emergency-drills.list')->group(function () {
    Route::get('/emergency-drills', [EmergencyDrillController::class, 'index']);
    Route::get('/emergency-drills/{id}', [EmergencyDrillController::class, 'show']);
});
Route::middleware('permission:emergency-drills.create')->group(function () {
    Route::post('/emergency-drills', [EmergencyDrillController::class, 'store']);
});
Route::middleware('permission:emergency-drills.update')->group(function () {
    Route::put('/emergency-drills/{id}', [EmergencyDrillController::class, 'update']);
    Route::patch('/emergency-drills/{id}', [EmergencyDrillController::class, 'update']);
});
Route::middleware('permission:emergency-drills.delete')->group(function () {
    Route::delete('/emergency-drills/{id}', [EmergencyDrillController::class, 'destroy']);
});

// ── 应急物资 ─────────────────────────────────────────────────────
Route::middleware('permission:emergency-supplies.list')->group(function () {
    Route::get('/emergency-supplies', [EmergencySuppliesController::class, 'index']);
    Route::get('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'show']);
});
Route::middleware('permission:emergency-supplies.create')->group(function () {
    Route::post('/emergency-supplies', [EmergencySuppliesController::class, 'store']);
});
Route::middleware('permission:emergency-supplies.update')->group(function () {
    Route::put('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'update']);
    Route::patch('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'update']);
});
Route::middleware('permission:emergency-supplies.delete')->group(function () {
    Route::delete('/emergency-supplies/{id}', [EmergencySuppliesController::class, 'destroy']);
});

// ── 应急队伍 ─────────────────────────────────────────────────────
Route::middleware('permission:emergency-teams.list')->group(function () {
    Route::get('/emergency-teams', [EmergencyTeamController::class, 'index']);
    Route::get('/emergency-teams/{id}', [EmergencyTeamController::class, 'show']);
});
Route::middleware('permission:emergency-teams.create')->group(function () {
    Route::post('/emergency-teams', [EmergencyTeamController::class, 'store']);
});
Route::middleware('permission:emergency-teams.update')->group(function () {
    Route::put('/emergency-teams/{id}', [EmergencyTeamController::class, 'update']);
    Route::patch('/emergency-teams/{id}', [EmergencyTeamController::class, 'update']);
});
Route::middleware('permission:emergency-teams.delete')->group(function () {
    Route::delete('/emergency-teams/{id}', [EmergencyTeamController::class, 'destroy']);
});

// ── 三同时管理 ─────────────────────────────────────────────────────
Route::middleware('permission:three-togethers.list')->group(function () {
    Route::get('/three-togethers', [ThreeTogetherController::class, 'index']);
    Route::get('/three-togethers/{id}', [ThreeTogetherController::class, 'show']);
});
Route::middleware('permission:three-togethers.create')->group(function () {
    Route::post('/three-togethers', [ThreeTogetherController::class, 'store']);
});
Route::middleware('permission:three-togethers.update')->group(function () {
    Route::put('/three-togethers/{id}', [ThreeTogetherController::class, 'update']);
    Route::patch('/three-togethers/{id}', [ThreeTogetherController::class, 'update']);
});
Route::middleware('permission:three-togethers.delete')->group(function () {
    Route::delete('/three-togethers/{id}', [ThreeTogetherController::class, 'destroy']);
});

// ── 内部培训 ─────────────────────────────────────────────────────
Route::middleware('permission:internal-trainings.list')->group(function () {
    Route::get('/internal-trainings', [InternalTrainingController::class, 'index']);
    Route::get('/internal-trainings/{id}', [InternalTrainingController::class, 'show']);
});
Route::middleware('permission:internal-trainings.create')->group(function () {
    Route::post('/internal-trainings', [InternalTrainingController::class, 'store']);
});
Route::middleware('permission:internal-trainings.update')->group(function () {
    Route::put('/internal-trainings/{id}', [InternalTrainingController::class, 'update']);
    Route::patch('/internal-trainings/{id}', [InternalTrainingController::class, 'update']);
});
Route::middleware('permission:internal-trainings.delete')->group(function () {
    Route::delete('/internal-trainings/{id}', [InternalTrainingController::class, 'destroy']);
});

// ── 外部培训 ─────────────────────────────────────────────────────
Route::middleware('permission:external-trainings.list')->group(function () {
    Route::get('/external-trainings', [ExternalTrainingController::class, 'index']);
    Route::get('/external-trainings/{id}', [ExternalTrainingController::class, 'show']);
});
Route::middleware('permission:external-trainings.create')->group(function () {
    Route::post('/external-trainings', [ExternalTrainingController::class, 'store']);
});
Route::middleware('permission:external-trainings.update')->group(function () {
    Route::put('/external-trainings/{id}', [ExternalTrainingController::class, 'update']);
    Route::patch('/external-trainings/{id}', [ExternalTrainingController::class, 'update']);
});
Route::middleware('permission:external-trainings.delete')->group(function () {
    Route::delete('/external-trainings/{id}', [ExternalTrainingController::class, 'destroy']);
});

// ── 其他培训 ─────────────────────────────────────────────────────
Route::middleware('permission:other-trainings.list')->group(function () {
    Route::get('/other-trainings', [OtherTrainingController::class, 'index']);
    Route::get('/other-trainings/{id}', [OtherTrainingController::class, 'show']);
});
Route::middleware('permission:other-trainings.create')->group(function () {
    Route::post('/other-trainings', [OtherTrainingController::class, 'store']);
});
Route::middleware('permission:other-trainings.update')->group(function () {
    Route::put('/other-trainings/{id}', [OtherTrainingController::class, 'update']);
    Route::patch('/other-trainings/{id}', [OtherTrainingController::class, 'update']);
});
Route::middleware('permission:other-trainings.delete')->group(function () {
    Route::delete('/other-trainings/{id}', [OtherTrainingController::class, 'destroy']);
});

// ── 培训材料 ─────────────────────────────────────────────────────
Route::middleware('permission:training-files.list')->group(function () {
    Route::get('/training-files', [TrainingFileController::class, 'index']);
    Route::get('/training-files/{id}', [TrainingFileController::class, 'show']);
});
Route::middleware('permission:training-files.create')->group(function () {
    Route::post('/training-files', [TrainingFileController::class, 'store']);
});
Route::middleware('permission:training-files.update')->group(function () {
    Route::put('/training-files/{id}', [TrainingFileController::class, 'update']);
    Route::patch('/training-files/{id}', [TrainingFileController::class, 'update']);
});
Route::middleware('permission:training-files.delete')->group(function () {
    Route::delete('/training-files/{id}', [TrainingFileController::class, 'destroy']);
});

// ── 培训视频 ─────────────────────────────────────────────────────
Route::middleware('permission:training-videos.list')->group(function () {
    Route::get('/training-videos', [TrainingVideoController::class, 'index']);
    Route::get('/training-videos/{id}', [TrainingVideoController::class, 'show']);
});
Route::middleware('permission:training-videos.create')->group(function () {
    Route::post('/training-videos', [TrainingVideoController::class, 'store']);
});
Route::middleware('permission:training-videos.update')->group(function () {
    Route::put('/training-videos/{id}', [TrainingVideoController::class, 'update']);
    Route::patch('/training-videos/{id}', [TrainingVideoController::class, 'update']);
});
Route::middleware('permission:training-videos.delete')->group(function () {
    Route::delete('/training-videos/{id}', [TrainingVideoController::class, 'destroy']);
});

// ── 培训课程 ─────────────────────────────────────────────────────
Route::middleware('permission:training-classes.list')->group(function () {
    Route::get('/training-classes', [TrainingClassController::class, 'index']);
    Route::get('/training-classes/{id}', [TrainingClassController::class, 'show']);
});
Route::middleware('permission:training-classes.create')->group(function () {
    Route::post('/training-classes', [TrainingClassController::class, 'store']);
});
Route::middleware('permission:training-classes.update')->group(function () {
    Route::put('/training-classes/{id}', [TrainingClassController::class, 'update']);
    Route::patch('/training-classes/{id}', [TrainingClassController::class, 'update']);
});
Route::middleware('permission:training-classes.delete')->group(function () {
    Route::delete('/training-classes/{id}', [TrainingClassController::class, 'destroy']);
});

// ── 培训课程详情 ─────────────────────────────────────────────────────
Route::middleware('permission:training-class-infos.list')->group(function () {
    Route::get('/training-class-infos', [TrainingClassInfoController::class, 'index']);
    Route::get('/training-class-infos/{id}', [TrainingClassInfoController::class, 'show']);
});
Route::middleware('permission:training-class-infos.create')->group(function () {
    Route::post('/training-class-infos', [TrainingClassInfoController::class, 'store']);
});
Route::middleware('permission:training-class-infos.update')->group(function () {
    Route::put('/training-class-infos/{id}', [TrainingClassInfoController::class, 'update']);
    Route::patch('/training-class-infos/{id}', [TrainingClassInfoController::class, 'update']);
});
Route::middleware('permission:training-class-infos.delete')->group(function () {
    Route::delete('/training-class-infos/{id}', [TrainingClassInfoController::class, 'destroy']);
});

// ── 会议管理 ─────────────────────────────────────────────────────
Route::middleware('permission:meetings.list')->group(function () {
    Route::get('/meetings', [MeetingController::class, 'index']);
    Route::get('/meetings/{id}', [MeetingController::class, 'show']);
});
Route::middleware('permission:meetings.create')->group(function () {
    Route::post('/meetings', [MeetingController::class, 'store']);
});
Route::middleware('permission:meetings.update')->group(function () {
    Route::put('/meetings/{id}', [MeetingController::class, 'update']);
    Route::patch('/meetings/{id}', [MeetingController::class, 'update']);
});
Route::middleware('permission:meetings.delete')->group(function () {
    Route::delete('/meetings/{id}', [MeetingController::class, 'destroy']);
});

// 通知发送 / 企业确认 / 仪表板待办（不走 meeting 权限中间件，企业侧也可确认）
Route::post('/meeting-notices/{id}/notify', [MeetingController::class, 'notifyNotice']);
Route::post('/meeting-notices/{id}/confirm', [MeetingController::class, 'confirmNotice']);
Route::get('/meeting-notifications/pending', [MeetingController::class, 'pendingNotices']);

// ── 会议报名 ─────────────────────────────────────────────────────
Route::middleware('permission:meeting-sign-ups.list')->group(function () {
    Route::get('/meeting-sign-ups', [MeetingSignUpController::class, 'index']);
    Route::get('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'show']);
});
Route::middleware('permission:meeting-sign-ups.create')->group(function () {
    Route::post('/meeting-sign-ups', [MeetingSignUpController::class, 'store']);
});
Route::middleware('permission:meeting-sign-ups.update')->group(function () {
    Route::put('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'update']);
    Route::patch('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'update']);
});
Route::middleware('permission:meeting-sign-ups.delete')->group(function () {
    Route::delete('/meeting-sign-ups/{id}', [MeetingSignUpController::class, 'destroy']);
});

// ── 内部会议 ─────────────────────────────────────────────────────
Route::middleware('permission:internal-meetings.list')->group(function () {
    Route::get('/internal-meetings', [InternalMeetingController::class, 'index']);
    Route::get('/internal-meetings/{id}', [InternalMeetingController::class, 'show']);
});
Route::middleware('permission:internal-meetings.create')->group(function () {
    Route::post('/internal-meetings', [InternalMeetingController::class, 'store']);
});
Route::middleware('permission:internal-meetings.update')->group(function () {
    Route::put('/internal-meetings/{id}', [InternalMeetingController::class, 'update']);
    Route::patch('/internal-meetings/{id}', [InternalMeetingController::class, 'update']);
});
Route::middleware('permission:internal-meetings.delete')->group(function () {
    Route::delete('/internal-meetings/{id}', [InternalMeetingController::class, 'destroy']);
});

// ── 通知公告 ─────────────────────────────────────────────────────
Route::middleware('permission:office-notifies.list')->group(function () {
    Route::get('/office-notifies', [OfficeNotifyController::class, 'index']);
    Route::get('/office-notifies/{id}', [OfficeNotifyController::class, 'show']);
});
Route::middleware('permission:office-notifies.create')->group(function () {
    Route::post('/office-notifies', [OfficeNotifyController::class, 'store']);
});
Route::middleware('permission:office-notifies.update')->group(function () {
    Route::put('/office-notifies/{id}', [OfficeNotifyController::class, 'update']);
    Route::patch('/office-notifies/{id}', [OfficeNotifyController::class, 'update']);
});
Route::middleware('permission:office-notifies.delete')->group(function () {
    Route::delete('/office-notifies/{id}', [OfficeNotifyController::class, 'destroy']);
});

// ── 新通知 ─────────────────────────────────────────────────────
Route::middleware('permission:new-notifies.list')->group(function () {
    Route::get('/new-notifies', [NewNotifyController::class, 'index']);
    Route::get('/new-notifies/{id}', [NewNotifyController::class, 'show']);
});
Route::middleware('permission:new-notifies.create')->group(function () {
    Route::post('/new-notifies', [NewNotifyController::class, 'store']);
});
Route::middleware('permission:new-notifies.update')->group(function () {
    Route::put('/new-notifies/{id}', [NewNotifyController::class, 'update']);
    Route::patch('/new-notifies/{id}', [NewNotifyController::class, 'update']);
});
Route::middleware('permission:new-notifies.delete')->group(function () {
    Route::delete('/new-notifies/{id}', [NewNotifyController::class, 'destroy']);
});

// 企业端反馈 / 已读 / 仪表板待办（受通知企业可用，不走发布方权限）
Route::post('/office-notify-scopes/{id}/feedback', [OfficeNotifyController::class, 'submitFeedback']);
Route::post('/new-notify-scopes/{id}/read', [NewNotifyController::class, 'markAsRead']);
Route::get('/office-notify-notifications/pending', [OfficeNotifyController::class, 'pendingNotices']);
Route::get('/new-notify-notifications/pending', [NewNotifyController::class, 'pendingNotices']);

// ── 安全投入计划 ─────────────────────────────────────────────────────
Route::middleware('permission:security-investments.list')->group(function () {
    Route::get('/security-investments', [SecurityInvestmentController::class, 'index']);
    Route::get('/security-investments/{id}', [SecurityInvestmentController::class, 'show']);
});
Route::middleware('permission:security-investments.create')->group(function () {
    Route::post('/security-investments', [SecurityInvestmentController::class, 'store']);
});
Route::middleware('permission:security-investments.update')->group(function () {
    Route::put('/security-investments/{id}', [SecurityInvestmentController::class, 'update']);
    Route::patch('/security-investments/{id}', [SecurityInvestmentController::class, 'update']);
});
Route::middleware('permission:security-investments.delete')->group(function () {
    Route::delete('/security-investments/{id}', [SecurityInvestmentController::class, 'destroy']);
});

// ── 经费执行情况 ─────────────────────────────────────────────────────
Route::middleware('permission:funding-executions.list')->group(function () {
    Route::get('/funding-executions', [FundingExecutionController::class, 'index']);
    Route::get('/funding-executions/{id}', [FundingExecutionController::class, 'show']);
});
Route::middleware('permission:funding-executions.create')->group(function () {
    Route::post('/funding-executions', [FundingExecutionController::class, 'store']);
});
Route::middleware('permission:funding-executions.update')->group(function () {
    Route::put('/funding-executions/{id}', [FundingExecutionController::class, 'update']);
    Route::patch('/funding-executions/{id}', [FundingExecutionController::class, 'update']);
});
Route::middleware('permission:funding-executions.delete')->group(function () {
    Route::delete('/funding-executions/{id}', [FundingExecutionController::class, 'destroy']);
});
