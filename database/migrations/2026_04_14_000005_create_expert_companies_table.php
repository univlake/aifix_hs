<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_companies', function (Blueprint $table) {
            $table->id();
            $table->integer('expert_inspection_id')->comment('检查计划id')->index();
            $table->integer('check_company_id')->comment('检查企业id')->index();
            $table->timestamp('notify_company_time')->comment('通知企业时间')->nullable();
            $table->timestamp('check_company_time')->comment('检查企业时间')->nullable();
            $table->integer('status')->comment('企业反馈状态')->default(1);
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_companies');
    }
};
