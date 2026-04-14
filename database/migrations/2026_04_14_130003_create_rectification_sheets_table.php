<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rectification_sheets', function (Blueprint $table) {
            $table->id();
            $table->integer('expert_inspection_id')->comment('检查计划id')->index();
            $table->integer('check_company_id')->comment('检查企业id')->index();
            $table->integer('sheet_name')->comment('报告名称');
            $table->text('path')->comment('生成报告路径');
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rectification_sheets');
    }
};
