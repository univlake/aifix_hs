<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hazardous_processes', function (Blueprint $table) {
            $table->id();
            $table->integer('process_type_id')->comment('工艺名称id')->nullable()->index();
            $table->string('position')->comment('工艺位置')->nullable();
            $table->integer('hazardous_chemical_id')->comment('使用物料id')->nullable()->index();
            $table->integer('dangerous_equipment_id')->comment('使用设备id')->nullable()->index();
            $table->string('other_equipment_name')->comment('其他使用设备名称')->nullable();
            $table->integer('operating_people_num')->comment('操作人员数量')->default(0);
            $table->integer('is_online_test')->comment('是否工艺过程在线监测')->default(0);
            $table->integer('is_automatic')->comment('是否自动化')->default(0);
            $table->integer('is_control')->comment('是否安装安全控制系统')->default(0);
            $table->integer('is_dust')->comment('是否产生可燃爆粉尘')->default(0);
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hazardous_processes');
    }
};
