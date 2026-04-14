<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_management', function (Blueprint $table) {
            $table->id();
            $table->string('department')->nullable()->comment('发起部门');
            $table->text('content')->nullable()->comment('作业内容');
            $table->string('type')->nullable()->comment('作业类型');
            $table->string('special_type')->nullable()->comment('八大特殊作业类型');
            $table->string('position')->nullable()->comment('位置');
            $table->date('job_time')->nullable()->comment('作业时间');
            $table->string('unit')->nullable()->comment('作业单位');
            $table->integer('is_outsourcing')->nullable()->comment('是否外协单位');
            $table->integer('evaluation_unit_id')->nullable()->index()->comment('外协单位id');
            $table->integer('job_people_number')->nullable()->comment('作业人数');
            $table->string('job_people_name')->nullable()->comment('作业负责人');
            $table->text('risk_analysis')->nullable()->comment('作业安全风险分析');
            $table->text('risk_protection')->nullable()->comment('作业安全保障措施');
            $table->integer('company_id')->required()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_management');
    }
};
