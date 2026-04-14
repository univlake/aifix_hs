<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_inspections', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('专家检查主题');
            $table->text('description')->comment('检查内容介绍')->nullable();
            $table->text('comment')->comment('备注')->nullable();
            $table->date('start_date')->comment('检查开始时间')->nullable();
            $table->date('end_date')->comment('检查结束时间')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_inspections');
    }
};
