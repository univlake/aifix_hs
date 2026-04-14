<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('change_manages', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable()->comment('变更内容');
            $table->string('department_name')->nullable()->comment('部门名称');
            $table->date('apply_date')->nullable()->comment('申请日期');
            $table->text('reason')->nullable()->comment('变更说明及其原因');
            $table->text('apply_leader_opinion')->nullable()->comment('申请部门领导意见');
            $table->date('apply_leader_opinion_date')->nullable();
            $table->text('risk_analyze')->nullable()->comment('风险分析');
            $table->text('manage_leader_opinion')->nullable()->comment('归口管理部门意见');
            $table->date('manage_leader_opinion_date')->nullable();
            $table->text('approve')->nullable()->comment('批准意见');
            $table->date('approve_date')->nullable();
            $table->text('acceptance_info')->nullable()->comment('验收情况');
            $table->date('acceptance_info_date')->nullable();
            $table->integer('company_id')->required()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('change_manages');
    }
};
