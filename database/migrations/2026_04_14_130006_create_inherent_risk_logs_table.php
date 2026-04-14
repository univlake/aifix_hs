<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inherent_risk_logs', function (Blueprint $table) {
            $table->id();
            $table->float('safety_architecture_value')->comment('安全管理组织机构')->default(0);
            $table->float('security_officer_scale')->comment('安管员数量比例')->default(0);
            $table->float('already_obtain_people_scale')->comment('持证安全管理人员比例')->default(0);
            $table->float('last_year_income_scale')->comment('年度经费预算比例')->default(0);
            $table->float('funding_execution_scale')->comment('执行进度')->default(0);
            $table->float('production_standardization_scale')->comment('安全生产标准化')->default(0);
            $table->float('health_system_scale')->comment('是否取得职业健康管理体系')->default(0);
            $table->float('assess_detect_scale')->comment('是否有安全评价和检测')->default(0);
            $table->float('high_school_diploma_scale')->comment('高中以上学历比例')->default(0);
            $table->float('acreage_scale')->comment('单位占地面积用工数量')->default(0);
            $table->float('staff_scale')->comment('合同制员工比例')->default(0);
            $table->float('safety_engineering_major_scale')->comment('安全工程专业人员比例')->default(0);
            $table->float('hazardous_processes_scale')->comment('人均危险工艺数量')->default(0);
            $table->float('hazardous_process_scale')->comment('涉及危险化学品的工艺数量比例')->default(0);
            $table->float('hazardous_process_more_scale')->comment('操作人数超过3人以上的危险工艺比例')->default(0);
            $table->float('process_is_automatic_scale')->comment('工艺中自动化比例')->default(0);
            $table->float('special_equipment_number_scale')->comment('特种设备规模')->default(0);
            $table->float('equipment_more_number_scale')->comment('运行超过10年的危险设备数量比例')->default(0);
            $table->float('hazardous_chemical_scale')->comment('爆炸品物质、有毒气体物质、易燃气体物质数量比例')->default(0);
            $table->float('hazardous_chemicals_number_scale')->comment('危险物质数量/人数')->default(0);
            $table->float('major_hazard_scale')->comment('重大危险源')->default(0);
            $table->integer('company_id')->comment('企业id')->default(0)->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inherent_risk_logs');
    }
};
