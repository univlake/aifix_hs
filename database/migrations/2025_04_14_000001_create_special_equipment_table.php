<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('special_equipment', function (Blueprint $table) {
            $table->id();
            $table->string('equipment_name')->comment('设备名称')->nullable();
            $table->integer('special_type_id')->comment('特种类型id')->nullable()->index();
            $table->string('utilized_location')->comment('使用位置')->nullable();
            $table->string('norm_model1')->comment('规格型号1')->nullable();
            $table->string('norm_model2')->comment('规格型号2')->nullable();
            $table->string('norm_model3')->comment('规格型号3')->nullable();
            $table->string('norm_model4')->comment('规格型号4')->nullable();
            $table->string('serial_number')->comment('使用证编号/场内机动车牌证')->nullable();
            $table->date('use_time')->comment('投用时间')->nullable();
            $table->date('valid_period')->comment('有效期')->nullable();
            $table->string('inspect_unit')->comment('检验单位')->nullable();
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
        Schema::dropIfExists('special_equipment');
    }
};
