<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('month_statistic_controls', function (Blueprint $table) {
            $table->id();
            $table->string('govern_title')->comment('落实治理目标任务')->nullable();
            $table->string('govern_supplies')->comment('落实治理经费物资')->nullable();
            $table->string('govern_user')->comment('落实治理机构人员')->nullable();
            $table->string('govern_date')->comment('落实治理时间要求')->nullable();
            $table->string('govern_text')->comment('落实安全措施/应急预案')->nullable();
            $table->string('govern_money')->comment('落实治理资金')->nullable();
            $table->integer('month_statistic_id')->comment('月报id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('month_statistic_controls');
    }
};
