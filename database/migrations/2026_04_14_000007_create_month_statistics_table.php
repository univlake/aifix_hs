<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('month_statistics', function (Blueprint $table) {
            $table->id();
            $table->integer('average_employee')->comment('平均职工数量')->default(0);
            $table->integer('safety_meeting_count')->comment('公司级安全例会')->default(0);
            $table->integer('fire_meeting_count')->comment('公司级消防例会')->default(0);
            $table->integer('safety_check_count')->comment('安全检查次数')->default(0);
            $table->integer('fire_check_count')->comment('消防检查次数')->default(0);
            $table->integer('safety_funding')->comment('当月安全投入费用')->default(0);
            $table->integer('fire_funding')->comment('当月消防投入费用')->default(0);
            $table->integer('hydrating_seedlings')->comment('水带苗子')->default(0);
            $table->integer('retrofit_electrical')->comment('改造电气线路')->default(0);
            $table->integer('fire_extinguisher')->comment('灭火器')->default(0);
            $table->integer('smart_fire')->comment('智慧消防系统')->default(0);
            $table->integer('safety_training_count')->comment('安全培训次数')->default(0);
            $table->integer('safety_training_number')->comment('安全培训人数')->default(0);
            $table->integer('new_people_training_number')->comment('新员工培训人数')->default(0);
            $table->integer('fire_training_count')->comment('消防培训次数')->default(0);
            $table->integer('fire_training_number')->comment('消防培训人数')->default(0);
            $table->integer('safety_emergency_count')->comment('应急救援演练次数')->default(0);
            $table->integer('safety_emergency_number')->comment('应急演练人数')->default(0);
            $table->integer('fire_emergency_count')->comment('消防演练次数')->default(0);
            $table->integer('fire_emergency_number')->comment('演练人数')->default(0);
            $table->integer('some_hidden_danger')->comment('一般隐患排查数量')->default(0);
            $table->integer('some_rectify_hidden_danger')->comment('一般隐患整改数量')->default(0);
            $table->text('no_rectify_info')->comment('未整改隐患情况说明')->nullable();
            $table->integer('big_hidden_danger')->comment('重大隐患排查数量')->default(0);
            $table->integer('big_rectify_hidden_danger')->comment('重大隐患整改数量')->default(0);
            $table->integer('govern_hidden_danger_count')->comment('列入治理计划的重大隐患数量')->default(0);
            $table->integer('fire_fighting_danger')->comment('消防隐患排查数量')->default(0);
            $table->integer('fire_fighting_hidden_danger')->comment('消防执法部门检查隐患数量')->default(0);
            $table->integer('fire_fighting_hidden_danger_rectify')->comment('消防执法部门检查隐患整改数量')->default(0);
            $table->integer('accident_bulletin_count')->comment('当月事故数量')->default(0);
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('month_statistics');
    }
};
