<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('type')->comment('类型：1是固有，2是动态')->default(0);
            $table->float('old_risk_num')->comment('旧的风险指数')->default(0);
            $table->float('risk_num')->comment('风险指数')->default(0);
            $table->integer('date')->comment('变更日期')->default(0);
            $table->string('content')->comment('变更原因')->nullable();
            $table->string('company_name')->comment('公司名称')->nullable();
            $table->string('old_risk_grade')->comment('旧的风险等级')->nullable();
            $table->string('risk_grade')->comment('风险等级')->nullable();
            $table->integer('company_id')->comment('企业id')->default(0)->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_logs');
    }
};
