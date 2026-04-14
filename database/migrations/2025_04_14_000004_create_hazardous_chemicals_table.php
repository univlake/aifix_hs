<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hazardous_chemicals', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('化学品名')->nullable();
            $table->string('alias')->comment('别名')->nullable();
            $table->integer('is_supervision')->comment('是否重点监管危险化学品')->default(0);
            $table->integer('is_toxin')->comment('是否剧毒化学品')->default(0);
            $table->integer('is_explosion')->comment('是否爆炸品')->default(0);
            $table->integer('is_easy_explode')->comment('是否易爆炸')->default(0);
            $table->integer('is_narcotics')->comment('是否易制毒')->default(0);
            $table->integer('is_monitor')->comment('是否监控化学品')->default(0);
            $table->integer('is_mixing')->comment('是否混合化学品')->default(0);
            $table->string('cas')->comment('CAS')->nullable();
            $table->string('position')->comment('位置')->nullable();
            $table->string('temperature')->comment('工作温度(℃)')->nullable();
            $table->string('storage')->comment('最大存储量')->nullable();
            $table->string('year_use')->comment('最大使用量')->nullable();
            $table->string('year_use_unit')->comment('最大使用量单位')->nullable();
            $table->string('storage_unit')->comment('最大存储量单位')->nullable();
            $table->string('pressure')->comment('工作压力')->nullable();
            $table->string('pressure_unit')->comment('工作压力单位')->nullable();
            $table->string('fire_class')->comment('火灾危险等级')->nullable();
            $table->string('matter_state')->comment('物态')->nullable();
            $table->string('msds')->comment('MSDS')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hazardous_chemicals');
    }
};
