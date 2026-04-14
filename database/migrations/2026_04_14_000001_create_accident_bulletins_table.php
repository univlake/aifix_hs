<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accident_bulletins', function (Blueprint $table) {
            $table->id();
            $table->string('type')->comment('事故类型')->nullable();
            $table->string('direct_cause')->comment('直接原因')->nullable();
            $table->string('indirect_cause')->comment('间接原因')->nullable();
            $table->string('accident_level')->comment('事故等级')->nullable();
            $table->string('department')->comment('事故部门')->nullable();
            $table->date('happen_time')->comment('作业时间')->nullable();
            $table->string('happen_area')->comment('发生位置')->nullable();
            $table->text('content')->comment('事故简况')->nullable();
            $table->string('degree_injury')->comment('事故伤害程度')->nullable();
            $table->string('direct_loss_property')->comment('直接经济损失')->nullable();
            $table->string('gauge_loss_property')->comment('估计财务损失')->nullable();
            $table->integer('staff_die')->comment('企业职工死亡人数')->nullable();
            $table->integer('staff_hurt')->comment('企业职工受伤人数')->nullable();
            $table->integer('not_staff_die')->comment('企业外职工死亡人数')->nullable();
            $table->integer('not_staff_hurt')->comment('企业外职工受伤人数')->nullable();
            $table->text('accident_report_url')->comment('事故调查报告')->nullable();
            $table->text('accident_photo_url')->comment('事故相关照片')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accident_bulletins');
    }
};
