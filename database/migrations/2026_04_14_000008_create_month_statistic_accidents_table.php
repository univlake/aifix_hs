<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('month_statistic_accidents', function (Blueprint $table) {
            $table->id();
            $table->date('happen_time')->comment('发生时间')->nullable();
            $table->string('department')->comment('部门')->nullable();
            $table->string('name')->comment('姓名')->nullable();
            $table->string('sex')->comment('性别')->nullable();
            $table->integer('age')->comment('年龄')->nullable();
            $table->string('work_type')->comment('工种')->nullable();
            $table->integer('work_age')->comment('工龄')->nullable();
            $table->string('education_level')->comment('教育程度')->nullable();
            $table->string('degree_injury')->comment('受伤程度')->nullable();
            $table->string('type')->comment('事故类型')->nullable();
            $table->string('direct_cause')->comment('直接原因')->nullable();
            $table->text('content')->comment('事故简况')->nullable();
            $table->integer('days_off')->comment('歇工天数')->nullable();
            $table->string('direct_loss_property')->comment('直接经济损失')->nullable();
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
        Schema::dropIfExists('month_statistic_accidents');
    }
};
