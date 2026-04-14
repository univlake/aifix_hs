<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hidden_danger_infos', function (Blueprint $table) {
            $table->id();
            $table->integer('expert_inspection_id')->comment('检查计划id')->index();
            $table->integer('expert_company_id')->comment('检查企业id')->index();
            $table->integer('check_company_id')->comment('检查企业id')->nullable()->index();
            $table->string('area')->comment('场所');
            $table->string('session')->comment('次数')->default('第一轮');
            $table->text('description')->comment('隐患描述');
            $table->string('hidden_type')->comment('隐患类别');
            $table->string('hidden_level')->comment('隐患等级');
            $table->text('legalises')->comment('排查依据')->nullable();
            $table->text('proposal')->comment('整改建议')->nullable();
            $table->date('correct_deadline')->comment('整改截止期限')->nullable();
            $table->tinyInteger('invest_status')->comment('审核状态')->index()->default(1);
            $table->integer('zg_user_id')->comment('整改人')->nullable()->index();
            $table->tinyInteger('correct_status')->comment('整改状态')->index()->default(1);
            $table->date('correct_date')->comment('整改日期')->nullable();
            $table->text('review_description')->comment('整改描述')->nullable();
            $table->integer('review_user_id')->comment('复查人')->index()->nullable();
            $table->dateTime('review_time')->comment('复查时间')->nullable();
            $table->integer('archive_user_id')->comment('归档人')->nullable()->index();
            $table->text('comment')->comment('备注')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hidden_danger_infos');
    }
};
