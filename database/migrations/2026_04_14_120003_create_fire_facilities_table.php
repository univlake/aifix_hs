<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fire_facilities', function (Blueprint $table) {
            $table->id();
            $table->string('equipment_name')->comment('设备名称')->nullable();
            $table->string('utilized_location')->comment('使用位置')->nullable();
            $table->string('special_type')->comment('设备类型')->nullable();
            $table->date('use_time')->comment('投用时间')->nullable();
            $table->string('automation_type')->comment('自动化程度')->nullable();
            $table->string('maintain_info')->comment('维护情况')->nullable();
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
        Schema::dropIfExists('fire_facilities');
    }
};
