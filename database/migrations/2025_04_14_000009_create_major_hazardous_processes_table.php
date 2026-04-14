<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('major_hazardous_processes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('工艺名称')->nullable();
            $table->integer('dangerous_craft_type_id')->comment('危险工艺类型id')->nullable()->index();
            $table->string('position')->comment('工艺位置')->nullable();
            $table->integer('hazardous_chemical_id')->comment('使用物料id')->nullable()->index();
            $table->integer('dangerous_equipment_id')->comment('使用设备id')->nullable()->index();
            $table->integer('operating_people_num')->comment('操作人数')->default(0);
            $table->string('temperature')->comment('操作温度(℃)')->nullable();
            $table->string('pressure')->comment('操作压力')->nullable();
            $table->string('pressure_unit')->comment('操作压力单位')->nullable();
            $table->integer('is_sis')->comment('SIS/EDS')->default(0);
            $table->string('sil_level')->comment('SIL等级')->nullable();
            $table->string('detect_parameter')->comment('检测远传参数')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('major_hazardous_processes');
    }
};
