<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_investigations', function (Blueprint $table) {
            $table->id();
            $table->string('type')->comment('隐患类型')->nullable();
            $table->integer('is_fire_fighting')->comment('是否消防部门检查')->nullable();
            $table->integer('is_emergency')->comment('是否应急部门检查')->nullable();
            $table->text('content')->comment('隐患描述')->nullable();
            $table->date('inv_time')->comment('排查时间')->nullable();
            $table->string('inv_name')->comment('排查人')->nullable();
            $table->string('level')->comment('隐患等级')->nullable();
            $table->text('proposal')->comment('整改方案建议')->nullable();
            $table->text('legalbasis')->comment('排查依据')->nullable();
            $table->date('correct_date')->comment('整改日期')->nullable();
            $table->text('review_discription')->comment('整改描述')->nullable();
            $table->date('review_date')->comment('复查日期')->nullable();
            $table->text('review_content')->comment('复查结果描述')->nullable();
            $table->string('review_user')->comment('复查人')->index()->nullable();
            $table->string('correct_result')->comment('整改结果')->nullable();
            $table->integer('is_govern')->comment('是否列入治理计划')->nullable();
            $table->string('govern_title')->comment('落实治理目标任务')->nullable();
            $table->string('govern_supplies')->comment('落实治理经费物资')->nullable();
            $table->string('govern_user')->comment('落实治理机构人员')->nullable();
            $table->string('govern_date')->comment('落实治理时间要求')->nullable();
            $table->string('govern_text')->comment('落实安全措施/应急预案')->nullable();
            $table->string('govern_money')->comment('落实治理资金')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_investigations');
    }
};
