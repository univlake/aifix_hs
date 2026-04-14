<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('float_risk_logs', function (Blueprint $table) {
            $table->id();
            $table->float('internal_meeting_scale')->comment('会议频次')->default(0);
            $table->float('internal_training_scale')->comment('培训频次')->default(0);
            $table->float('accident_bulletin_scale')->comment('事故发生频率')->default(0);
            $table->float('accident_bulletin_severe_scale')->comment('事故严重程度')->default(0);
            $table->float('accident_report_url_scale')->comment('"四不放过"情况')->default(0);
            $table->float('emergency_team_scale')->comment('应急人员比例')->default(0);
            $table->float('emergency_drill_scale')->comment('演练频次')->default(0);
            $table->float('job_management_scale')->comment('特殊作业频次')->default(0);
            $table->float('risk_source_scale')->comment('风险源管理')->default(0);
            $table->float('monthly_investigation_scale')->comment('隐患整改率')->default(0);
            $table->float('three_together_over_scale')->comment('三同时及四新管理执行未完成三同时的比例')->default(0);
            $table->float('unit_sum_number_scale')->comment('资质情况')->default(0);
            $table->float('evaluation_unit_scale')->comment('安全协议')->default(0);
            $table->float('evaluation_unit_school_scale')->comment('培训教育')->default(0);
            $table->float('health_checkup_people_scale')->comment('体检覆盖率')->default(0);
            $table->float('health_checkup_scale')->comment('职业病危害接触人数比例')->default(0);
            $table->float('health_report_scale')->comment('是否有职业病报告')->default(0);
            $table->integer('company_id')->comment('企业id')->default(0)->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('float_risk_logs');
    }
};
