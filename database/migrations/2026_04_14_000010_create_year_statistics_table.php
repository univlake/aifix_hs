<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('year_statistics', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->comment('企业名称')->nullable();
            $table->string('base_area')->comment('地址')->nullable();
            $table->string('enterprise_type')->comment('企业分类')->nullable();
            $table->string('safety_funding')->comment('安全费用')->nullable();
            $table->string('fire_fighting')->comment('消防费用')->nullable();
            $table->timestamp('compliance_time')->comment('标准化达标时间')->nullable();
            $table->timestamp('revaluation_time')->comment('标准化复评时间')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('year_statistics');
    }
};
