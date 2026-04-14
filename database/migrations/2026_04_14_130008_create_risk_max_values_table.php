<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_max_values', function (Blueprint $table) {
            $table->id();
            $table->float('security_officer_scale')->comment('安管员占企业用工总人数比例')->default(0);
            $table->float('already_obtain_people_scale')->comment('三类持证人员中安全管理员/安管员比例')->default(0);
            $table->float('last_year_income_scale')->comment('年度投入占上一年营收比例')->default(0);
            $table->float('acreage_scale')->comment('企业用工总人数/占地面积比例')->default(0);
            $table->float('hazardous_processes_scale')->comment('（重点监管危险工艺数量+较大危险工艺数量）/企业用工总人数')->default(0);
            $table->float('hazardous_chemicals_scale')->comment('危险物质数量/企业用工数量')->default(0);
            $table->float('internal_meeting_scale')->comment('平均每月的会议次数')->default(0);
            $table->float('internal_training_scale')->comment('平均每月的培训次数')->default(0);
            $table->float('accident_bulletin_scale')->comment('事故发生频率 次数/年')->default(0);
            $table->float('emergency_team_scale')->comment('应急队伍总人数/企业用工总数')->default(0);
            $table->float('emergency_drill_scale')->comment('年平均演练次数')->default(0);
            $table->float('job_management_scale')->comment('平均每月的特殊作业次数')->default(0);
            $table->float('health_checkup_scale')->comment('体检人员数量/企业用工总数')->default(0);
            $table->integer('company_id')->comment('企业id')->default(0)->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_max_values');
    }
};
